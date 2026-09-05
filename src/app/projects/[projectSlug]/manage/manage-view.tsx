"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronUp,
  Lock,
  LockOpen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { PageSkeleton } from "@/components/page-skeleton"
import { PriorityIndicator } from "@/components/priority-indicator"
import { highlightMatch } from "@/lib/highlight-match"
import type { ProjectData } from "@/lib/project-data"
import { cn } from "@/lib/utils"
import { stageColorsForLevel } from "@/lib/stage-colors"
import {
  indicatorLevelLabel,
  type AreaOfEnquiry,
  type IndicatorLevel,
  type KeyQuestion,
  type KeyQuestionLink,
} from "@/lib/types"
import { ProjectDataGate, useProjectData } from "../project-data-provider"
import { EMPTY_KQ_FILTERS, KqFiltersPanel, type KqFilters } from "../kq-filters-panel"
import {
  createArea,
  renameArea,
  deleteArea,
  moveArea,
  createKeyQuestion,
  updateKeyQuestion,
  deleteKeyQuestion,
  setKeyQuestionLocked,
  moveKeyQuestion,
  type KeyQuestionInput,
} from "./actions"
import { KqFormDialog } from "./kq-form-dialog"

// Computes the sequence swap a same-list "move up/down" would produce,
// mirroring moveArea/moveKeyQuestion's server-side logic exactly — a map of
// {id -> new sequence} for the two swapped items, or null if there's
// nothing to swap with (already first/last). Shared by the optimistic
// patches for both area and key-question reordering below.
function swappedSequences<T extends { id: string; sequence: number }>(
  list: T[],
  id: string,
  direction: "up" | "down"
): Map<string, number> | null {
  const sorted = [...list].sort((a, b) => a.sequence - b.sequence)
  const index = sorted.findIndex((item) => item.id === id)
  const swapWith = direction === "up" ? index - 1 : index + 1
  if (index === -1 || swapWith < 0 || swapWith >= sorted.length) return null
  return new Map([
    [sorted[index].id, sorted[swapWith].sequence],
    [sorted[swapWith].id, sorted[index].sequence],
  ])
}

// Mirrors updateKeyQuestion's Supabase payload — every KeyQuestionInput
// field applied onto an existing KeyQuestion, for the optimistic patch on
// edit-dialog submit. Deliberately excludes sequence/is_locked/links, which
// the edit dialog never touches.
function applyKeyQuestionInput(
  kq: KeyQuestion,
  input: KeyQuestionInput
): KeyQuestion {
  return {
    ...kq,
    area_of_enquiry_id: input.areaOfEnquiryId,
    kq_number: input.kqNumber,
    question_text: input.questionText,
    short_name: input.shortName,
    indicator_level_id: input.indicatorLevelId,
    indicator_definition: input.indicatorDefinition,
    action_text: input.actionText,
    primary_user: input.primaryUser,
    data_availability_status: input.dataAvailabilityStatus,
    data_availability_note: input.dataAvailabilityNote,
    priority: input.priority,
    reason_for_priority: input.reasonForPriority,
  }
}

// Ids of other KQs this one depends on, derived from the project's links.
function dependsOnIdsForKq(kqId: string, links: KeyQuestionLink[]): string[] {
  return links
    .filter(
      (l) =>
        l.relationship_type === "depends_on" &&
        (l.key_question_id_a === kqId || l.key_question_id_b === kqId)
    )
    .map((l) => (l.key_question_id_a === kqId ? l.key_question_id_b : l.key_question_id_a))
}

export function ManageView() {
  return (
    <ProjectDataGate skeletonRows={6}>
      {(data) =>
        data.role !== "facilitator" ? (
          <FacilitatorRedirect projectSlug={data.project.slug} />
        ) : (
          <ManageViewInner
            projectId={data.project.id}
            areas={data.areas}
            keyQuestions={data.keyQuestions}
            indicatorLevels={data.indicatorLevels}
            links={data.links}
          />
        )
      }
    </ProjectDataGate>
  )
}

// RLS is the real access boundary for facilitator-only writes — this is a
// UX nicety that bounces a client off the page rather than showing them an
// empty facilitator screen.
function FacilitatorRedirect({ projectSlug }: { projectSlug: string }) {
  const router = useRouter()
  React.useEffect(() => {
    router.replace(`/projects/${projectSlug}`)
  }, [projectSlug, router])
  return <PageSkeleton rows={6} />
}

function ManageViewInner({
  projectId,
  areas,
  keyQuestions,
  indicatorLevels,
  links,
}: {
  projectId: string
  areas: AreaOfEnquiry[]
  keyQuestions: KeyQuestion[]
  indicatorLevels: IndicatorLevel[]
  links: KeyQuestionLink[]
}) {
  const { refresh, mutate } = useProjectData()
  const [, startTransition] = React.useTransition()
  const [pending, startMutationTransition] = React.useTransition()
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [newAreaNumber, setNewAreaNumber] = React.useState("")
  const [newAreaName, setNewAreaName] = React.useState("")
  const [filters, setFilters] = React.useState<KqFilters>(EMPTY_KQ_FILTERS)

  // Wraps mutate() with a shared pending flag (so every reorder/lock/delete
  // button in this view disables together, preventing a double-click from
  // racing the server's non-atomic sequence swap) and a visible error
  // message, mirroring review/kq-detail-content.tsx's runAction pattern —
  // a bare mutate() call here previously had neither.
  function runMutation(
    patch: (data: ProjectData) => ProjectData,
    action: () => Promise<void>
  ) {
    setActionError(null)
    startMutationTransition(async () => {
      try {
        await mutate(patch, action)
      } catch {
        setActionError("That didn't go through — try again.")
      }
    })
  }

  const hasActiveFilters =
    filters.titleQuery.trim() !== "" ||
    filters.levelId !== null ||
    filters.priority !== null ||
    filters.areaId !== null ||
    filters.lockFilter !== "all"

  const filteredKeyQuestions = React.useMemo(() => {
    const titleQuery = filters.titleQuery.trim().toLowerCase()
    return keyQuestions.filter((kq) => {
      if (titleQuery && !kq.question_text.toLowerCase().includes(titleQuery)) {
        return false
      }
      if (filters.levelId && kq.indicator_level_id !== filters.levelId) {
        return false
      }
      if (filters.priority && kq.priority !== filters.priority) return false
      if (filters.areaId && kq.area_of_enquiry_id !== filters.areaId) {
        return false
      }
      if (filters.lockFilter === "locked" && !kq.is_locked) return false
      if (filters.lockFilter === "unlocked" && kq.is_locked) return false
      return true
    })
  }, [keyQuestions, filters])

  const kqsByArea = React.useMemo(() => {
    const map = new Map<string, KeyQuestion[]>()
    for (const kq of filteredKeyQuestions) {
      const list = map.get(kq.area_of_enquiry_id) ?? []
      list.push(kq)
      map.set(kq.area_of_enquiry_id, list)
    }
    return map
  }, [filteredKeyQuestions])

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn()
      await refresh()
    })
  }

  async function handleAddArea() {
    if (!newAreaName.trim()) return
    await createArea(projectId, newAreaName.trim(), newAreaNumber.trim())
    setNewAreaNumber("")
    setNewAreaName("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-3xl font-semibold">
          Manage key questions
        </h2>
        <p className="text-sm text-muted-foreground">
          Add, edit, reorder, and lock key questions. Locking a question
          freezes it for clients — no further comments, votes, or
          verifications.
        </p>
      </div>

      {/* Renders nothing here — portals its content into the persistent
          left nav rail (ProjectSidebar), shared with Review's filters. */}
      <KqFiltersPanel
        areas={areas}
        indicatorLevels={indicatorLevels}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {actionError && (
        <p className="text-sm text-destructive">{actionError}</p>
      )}

      {hasActiveFilters && filteredKeyQuestions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No key questions match the current filters.
        </p>
      )}

      {areas.map((area, areaIndex) => {
        const areaKqs = kqsByArea.get(area.id) ?? []
        if (hasActiveFilters && areaKqs.length === 0) return null
        return (
          <AreaSection
            key={area.id}
            projectId={projectId}
            area={area}
            areas={areas}
            keyQuestions={areaKqs}
            allKeyQuestions={keyQuestions}
            links={links}
            indicatorLevels={indicatorLevels}
            isFirst={areaIndex === 0}
            isLast={areaIndex === areas.length - 1}
            refresh={refresh}
            mutate={mutate}
            runMutation={runMutation}
            pending={pending}
            titleQuery={filters.titleQuery}
          />
        )
      })}

      <div className="flex items-center gap-2 rounded-card border border-dashed border-foreground/30 p-4">
        <Input
          placeholder="AOE01"
          className="w-20"
          value={newAreaNumber}
          onChange={(e) => setNewAreaNumber(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              run(handleAddArea)
            }
          }}
        />
        <Input
          placeholder="New area of enquiry, e.g. Who Are We Reaching?"
          value={newAreaName}
          onChange={(e) => setNewAreaName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              run(handleAddArea)
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => run(handleAddArea)}
          className="w-fit gap-1.5"
        >
          <Plus className="size-4" />
          Add area
        </Button>
      </div>
    </div>
  )
}

function AreaSection({
  projectId,
  area,
  areas,
  keyQuestions,
  allKeyQuestions,
  links,
  indicatorLevels,
  isFirst,
  isLast,
  refresh,
  mutate,
  runMutation,
  pending,
  titleQuery,
}: {
  projectId: string
  area: AreaOfEnquiry
  areas: AreaOfEnquiry[]
  keyQuestions: KeyQuestion[]
  allKeyQuestions: KeyQuestion[]
  links: KeyQuestionLink[]
  indicatorLevels: IndicatorLevel[]
  isFirst: boolean
  isLast: boolean
  refresh: () => Promise<void>
  mutate: (
    patch: (data: ProjectData) => ProjectData,
    action: () => Promise<void>
  ) => Promise<void>
  runMutation: (
    patch: (data: ProjectData) => ProjectData,
    action: () => Promise<void>
  ) => void
  pending: boolean
  titleQuery: string
}) {
  const [editing, setEditing] = React.useState(false)
  const [areaNumber, setAreaNumber] = React.useState(area.area_number)
  const [name, setName] = React.useState(area.name)
  // Adjusted during render (React's documented alternative to an effect for
  // "reset local state when a prop changes") rather than via useEffect, so
  // a resync happens in the same render pass instead of a follow-up one.
  const [prevArea, setPrevArea] = React.useState(area)
  if (!editing && prevArea !== area) {
    // Resyncs from the server-derived `area` prop whenever it changes (e.g.
    // refresh() reverting a failed rename) as long as the user isn't
    // actively editing — without this, a failed save left the rejected
    // input sitting in local state indefinitely, invisible until reopened.
    setPrevArea(area)
    setAreaNumber(area.area_number)
    setName(area.name)
  }

  const sorted = [...keyQuestions].sort((a, b) => a.sequence - b.sequence)
  const lockedCount = keyQuestions.filter((kq) => kq.is_locked).length

  function saveName() {
    const trimmedName = name.trim() || area.name
    const trimmedNumber = areaNumber.trim()
    setEditing(false)
    if (trimmedName !== area.name || trimmedNumber !== area.area_number) {
      runMutation(
        (data) => ({
          ...data,
          areas: data.areas.map((a) =>
            a.id === area.id
              ? { ...a, name: trimmedName, area_number: trimmedNumber }
              : a
          ),
        }),
        () => renameArea(projectId, area.id, trimmedName, trimmedNumber)
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-xl">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={areaNumber}
                onChange={(e) => setAreaNumber(e.target.value)}
                onBlur={() => saveName()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    saveName()
                  }
                }}
                placeholder="AOE01"
                className="w-20"
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => saveName()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    saveName()
                  }
                }}
                className="max-w-sm"
              />
            </div>
          ) : (
            <span className="flex items-center gap-2">
              {area.area_number && (
                <Badge variant="outline" className="font-mono text-xs">
                  {area.area_number}
                </Badge>
              )}
              {area.name}
              {keyQuestions.length > 0 && (
                <Badge variant="secondary" className="text-[11px] font-normal">
                  {lockedCount} of {keyQuestions.length} locked
                </Badge>
              )}
            </span>
          )}
          <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditing((v) => !v)}
              aria-label="Rename area"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isFirst || pending}
              onClick={() =>
                runMutation(
                  (data) => {
                    const swaps = swappedSequences(data.areas, area.id, "up")
                    if (!swaps) return data
                    return {
                      ...data,
                      areas: data.areas.map((a) =>
                        swaps.has(a.id) ? { ...a, sequence: swaps.get(a.id)! } : a
                      ),
                    }
                  },
                  () => moveArea(projectId, area.id, "up")
                )
              }
              aria-label="Move area up"
            >
              <ChevronUp className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isLast || pending}
              onClick={() =>
                runMutation(
                  (data) => {
                    const swaps = swappedSequences(data.areas, area.id, "down")
                    if (!swaps) return data
                    return {
                      ...data,
                      areas: data.areas.map((a) =>
                        swaps.has(a.id) ? { ...a, sequence: swaps.get(a.id)! } : a
                      ),
                    }
                  },
                  () => moveArea(projectId, area.id, "down")
                )
              }
              aria-label="Move area down"
            >
              <ChevronDown className="size-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete area"
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete &quot;{area.name}&quot;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This also deletes all {keyQuestions.length} key question
                    {keyQuestions.length === 1 ? "" : "s"} in this area. This
                    can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={pending}
                    onClick={() =>
                      runMutation(
                        (data) => ({
                          ...data,
                          areas: data.areas.filter((a) => a.id !== area.id),
                          keyQuestions: data.keyQuestions.filter(
                            (k) => k.area_of_enquiry_id !== area.id
                          ),
                        }),
                        () => deleteArea(projectId, area.id)
                      )
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sorted.map((kq, kqIndex) => (
          <KqRow
            key={kq.id}
            projectId={projectId}
            areas={areas}
            kq={kq}
            allKeyQuestions={allKeyQuestions}
            links={links}
            indicatorLevels={indicatorLevels}
            isFirst={kqIndex === 0}
            isLast={kqIndex === sorted.length - 1}
            mutate={mutate}
            runMutation={runMutation}
            pending={pending}
            titleQuery={titleQuery}
          />
        ))}

        <Separator />

        <KqFormDialog
          areas={areas}
          indicatorLevels={indicatorLevels}
          allKeyQuestions={allKeyQuestions}
          defaultAreaId={area.id}
          onSubmit={async (input: KeyQuestionInput) => {
            await createKeyQuestion(projectId, input)
            await refresh()
          }}
          trigger={
            <Button variant="outline" size="sm" className="w-fit gap-1.5">
              <Plus className="size-3.5" />
              Add key question
            </Button>
          }
        />
      </CardContent>
    </Card>
  )
}

function KqRow({
  projectId,
  areas,
  kq,
  allKeyQuestions,
  links,
  indicatorLevels,
  isFirst,
  isLast,
  mutate,
  runMutation,
  pending,
  titleQuery,
}: {
  projectId: string
  areas: AreaOfEnquiry[]
  kq: KeyQuestion
  allKeyQuestions: KeyQuestion[]
  links: KeyQuestionLink[]
  indicatorLevels: IndicatorLevel[]
  isFirst: boolean
  isLast: boolean
  mutate: (
    patch: (data: ProjectData) => ProjectData,
    action: () => Promise<void>
  ) => Promise<void>
  runMutation: (
    patch: (data: ProjectData) => ProjectData,
    action: () => Promise<void>
  ) => void
  pending: boolean
  titleQuery: string
}) {
  const level = indicatorLevels.find((l) => l.id === kq.indicator_level_id)
  const stage = level ? stageColorsForLevel(level, indicatorLevels) : null

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-start sm:justify-between",
        kq.is_locked && "border-muted-foreground/40"
      )}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={kq.is_locked ? "secondary" : "outline"}
            className="font-mono"
          >
            {kq.kq_number}
          </Badge>
          {stage ? (
            <Badge className={cn("border-transparent", stage.bg, stage.fg)}>
              {indicatorLevelLabel(indicatorLevels, kq.indicator_level_id)}
            </Badge>
          ) : (
            <Badge variant="outline">
              {indicatorLevelLabel(indicatorLevels, kq.indicator_level_id)}
            </Badge>
          )}
          <PriorityIndicator priority={kq.priority} />
          {kq.is_locked && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="size-3" />
              Locked
            </Badge>
          )}
        </div>
        <p className="text-sm">
          {titleQuery.trim()
            ? highlightMatch(kq.question_text, titleQuery)
            : kq.question_text}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border p-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isFirst || pending}
          onClick={() =>
            runMutation(
              (data) => {
                const areaKqs = data.keyQuestions.filter(
                  (k) => k.area_of_enquiry_id === kq.area_of_enquiry_id
                )
                const swaps = swappedSequences(areaKqs, kq.id, "up")
                if (!swaps) return data
                return {
                  ...data,
                  keyQuestions: data.keyQuestions.map((k) =>
                    swaps.has(k.id) ? { ...k, sequence: swaps.get(k.id)! } : k
                  ),
                }
              },
              () => moveKeyQuestion(projectId, kq.area_of_enquiry_id, kq.id, "up")
            )
          }
          aria-label="Move up"
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isLast || pending}
          onClick={() =>
            runMutation(
              (data) => {
                const areaKqs = data.keyQuestions.filter(
                  (k) => k.area_of_enquiry_id === kq.area_of_enquiry_id
                )
                const swaps = swappedSequences(areaKqs, kq.id, "down")
                if (!swaps) return data
                return {
                  ...data,
                  keyQuestions: data.keyQuestions.map((k) =>
                    swaps.has(k.id) ? { ...k, sequence: swaps.get(k.id)! } : k
                  ),
                }
              },
              () =>
                moveKeyQuestion(projectId, kq.area_of_enquiry_id, kq.id, "down")
            )
          }
          aria-label="Move down"
        >
          <ChevronDown className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          onClick={() =>
            runMutation(
              (data) => ({
                ...data,
                keyQuestions: data.keyQuestions.map((k) =>
                  k.id === kq.id ? { ...k, is_locked: !kq.is_locked } : k
                ),
              }),
              () => setKeyQuestionLocked(projectId, kq.id, !kq.is_locked)
            )
          }
          aria-label={kq.is_locked ? "Unlock" : "Lock"}
        >
          {kq.is_locked ? (
            <Lock className="size-3.5" />
          ) : (
            <LockOpen className="size-3.5" />
          )}
        </Button>
        <KqFormDialog
          areas={areas}
          indicatorLevels={indicatorLevels}
          allKeyQuestions={allKeyQuestions}
          keyQuestion={kq}
          initialDependsOnKqIds={dependsOnIdsForKq(kq.id, links)}
          onSubmit={(input: KeyQuestionInput) =>
            mutate(
              (data) => ({
                ...data,
                keyQuestions: data.keyQuestions.map((k) =>
                  k.id === kq.id ? applyKeyQuestionInput(k, input) : k
                ),
              }),
              () => updateKeyQuestion(projectId, kq.id, input)
            )
          }
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label="Edit">
              <Pencil className="size-3.5" />
            </Button>
          }
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {kq.kq_number}?</AlertDialogTitle>
              <AlertDialogDescription>
                This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={pending}
                onClick={() =>
                  runMutation(
                    (data) => ({
                      ...data,
                      keyQuestions: data.keyQuestions.filter(
                        (k) => k.id !== kq.id
                      ),
                    }),
                    () => deleteKeyQuestion(projectId, kq.id)
                  )
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
