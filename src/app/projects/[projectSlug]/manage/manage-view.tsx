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
import { cn } from "@/lib/utils"
import {
  indicatorLevelLabel,
  priorityLabel,
  PRIORITY_BADGE_VARIANT,
  type AreaOfEnquiry,
  type IndicatorLevel,
  type KeyQuestion,
  type KeyQuestionLink,
} from "@/lib/types"
import { ProjectDataGate, useProjectData } from "../project-data-provider"
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
  const { refresh } = useProjectData()
  const [, startTransition] = React.useTransition()
  const [newAreaNumber, setNewAreaNumber] = React.useState("")
  const [newAreaName, setNewAreaName] = React.useState("")

  const kqsByArea = React.useMemo(() => {
    const map = new Map<string, KeyQuestion[]>()
    for (const kq of keyQuestions) {
      const list = map.get(kq.area_of_enquiry_id) ?? []
      list.push(kq)
      map.set(kq.area_of_enquiry_id, list)
    }
    return map
  }, [keyQuestions])

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
        <h2 className="text-lg font-semibold">Manage key questions</h2>
        <p className="text-sm text-muted-foreground">
          Add, edit, reorder, and lock key questions. Locking a question
          freezes it for clients — no further comments, votes, or
          verifications.
        </p>
      </div>

      {areas.map((area, areaIndex) => (
        <AreaSection
          key={area.id}
          projectId={projectId}
          area={area}
          areas={areas}
          keyQuestions={kqsByArea.get(area.id) ?? []}
          allKeyQuestions={keyQuestions}
          links={links}
          indicatorLevels={indicatorLevels}
          isFirst={areaIndex === 0}
          isLast={areaIndex === areas.length - 1}
          run={run}
          refresh={refresh}
        />
      ))}

      <Card>
        <CardContent className="flex items-center gap-2 pt-4">
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
            className="gap-1.5"
          >
            <Plus className="size-4" />
            Add area
          </Button>
        </CardContent>
      </Card>
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
  run,
  refresh,
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
  run: (fn: () => Promise<void>) => void
  refresh: () => Promise<void>
}) {
  const [editing, setEditing] = React.useState(false)
  const [areaNumber, setAreaNumber] = React.useState(area.area_number)
  const [name, setName] = React.useState(area.name)

  const sorted = [...keyQuestions].sort((a, b) => a.sequence - b.sequence)

  async function saveName() {
    if (
      (name.trim() && name !== area.name) ||
      areaNumber.trim() !== area.area_number
    ) {
      await renameArea(projectId, area.id, name.trim(), areaNumber.trim())
    }
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={areaNumber}
                onChange={(e) => setAreaNumber(e.target.value)}
                onBlur={() => run(saveName)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    run(saveName)
                  }
                }}
                placeholder="AOE01"
                className="w-20"
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => run(saveName)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    run(saveName)
                  }
                }}
                className="max-w-sm"
              />
            </div>
          ) : (
            <span className="flex items-center gap-2">
              {area.area_number && (
                <Badge variant="outline" className="font-mono">
                  {area.area_number}
                </Badge>
              )}
              {area.name}
            </span>
          )}
          <div className="flex items-center gap-1">
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
              disabled={isFirst}
              onClick={() => run(() => moveArea(projectId, area.id, "up"))}
              aria-label="Move area up"
            >
              <ChevronUp className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isLast}
              onClick={() => run(() => moveArea(projectId, area.id, "down"))}
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
                    onClick={() => run(() => deleteArea(projectId, area.id))}
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
            run={run}
            refresh={refresh}
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
  run,
  refresh,
}: {
  projectId: string
  areas: AreaOfEnquiry[]
  kq: KeyQuestion
  allKeyQuestions: KeyQuestion[]
  links: KeyQuestionLink[]
  indicatorLevels: IndicatorLevel[]
  isFirst: boolean
  isLast: boolean
  run: (fn: () => Promise<void>) => void
  refresh: () => Promise<void>
}) {
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
          <Badge variant="outline">
            {indicatorLevelLabel(indicatorLevels, kq.indicator_level_id)}
          </Badge>
          <Badge variant={PRIORITY_BADGE_VARIANT[kq.priority]}>
            {priorityLabel(kq.priority)}
          </Badge>
          {kq.is_locked && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="size-3" />
              Locked
            </Badge>
          )}
        </div>
        <p className="text-sm">{kq.question_text}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isFirst}
          onClick={() =>
            run(() =>
              moveKeyQuestion(projectId, kq.area_of_enquiry_id, kq.id, "up")
            )
          }
          aria-label="Move up"
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isLast}
          onClick={() =>
            run(() =>
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
          onClick={() =>
            run(() => setKeyQuestionLocked(projectId, kq.id, !kq.is_locked))
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
          onSubmit={async (input: KeyQuestionInput) => {
            await updateKeyQuestion(projectId, kq.id, input)
            await refresh()
          }}
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label="Edit">
              <Pencil className="size-3.5" />
            </Button>
          }
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Delete">
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
                onClick={() => run(() => deleteKeyQuestion(projectId, kq.id))}
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
