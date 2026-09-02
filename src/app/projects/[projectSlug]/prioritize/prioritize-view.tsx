"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, GripVertical, Lock } from "lucide-react"
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PriorityIndicator } from "@/components/priority-indicator"
import { cn } from "@/lib/utils"
import { stageColorsForLevel, type StageColorTokens } from "@/lib/stage-colors"
import {
  type IndicatorLevel,
  type KeyQuestion,
  type VoteRow,
} from "@/lib/types"

import { ProjectDataGate, useProjectData } from "../project-data-provider"
import { setRanking } from "./actions"

// Reordering happens entirely client-side; nothing is written until Save is
// pressed, which submits every level's final order in one batch.
type LocalOrder = Map<string, string[]>

function computeOrder(
  keyQuestions: KeyQuestion[],
  sortedLevels: IndicatorLevel[],
  myRankByKqId: Map<string, number>
): LocalOrder {
  const order: LocalOrder = new Map()
  for (const level of sortedLevels) {
    const rankable = keyQuestions.filter(
      (kq) => kq.indicator_level_id === level.id && kq.is_locked
    )
    rankable.sort((a, b) => {
      const ra = myRankByKqId.get(a.id) ?? Number.MAX_SAFE_INTEGER
      const rb = myRankByKqId.get(b.id) ?? Number.MAX_SAFE_INTEGER
      if (ra !== rb) return ra - rb
      return a.kq_number.localeCompare(b.kq_number)
    })
    order.set(
      level.id,
      rankable.map((kq) => kq.id)
    )
  }
  return order
}

export function PrioritizeView() {
  return (
    <ProjectDataGate skeletonRows={5}>
      {(data) => (
        <PrioritizeViewInner
          projectId={data.project.id}
          role={data.role}
          keyQuestions={data.keyQuestions}
          myVotes={data.votes.filter((v) => v.voter_id === data.userId)}
          allVotes={data.votes}
          indicatorLevels={data.indicatorLevels}
        />
      )}
    </ProjectDataGate>
  )
}

function PrioritizeViewInner({
  projectId,
  role,
  keyQuestions,
  myVotes,
  allVotes,
  indicatorLevels,
}: {
  projectId: string
  role: "facilitator" | "client"
  keyQuestions: KeyQuestion[]
  myVotes: VoteRow[]
  allVotes: VoteRow[]
  indicatorLevels: IndicatorLevel[]
}) {
  const { refresh } = useProjectData()
  const [saving, setSaving] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // One shared sensor set, reused by every level's DndContext below —
  // hooks can't be called per-item inside the sortedLevels.map() render loop.
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const kqById = React.useMemo(() => {
    const map = new Map<string, KeyQuestion>()
    for (const kq of keyQuestions) map.set(kq.id, kq)
    return map
  }, [keyQuestions])

  const myRankByKqId = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const v of myVotes) map.set(v.key_question_id, v.rank_within_type)
    return map
  }, [myVotes])

  // Combined (all-voter) average rank per KQ, shown inline on each row for
  // facilitators — replaces the old separate "combined ranking" list below
  // the draggable order.
  const combinedByKqId = React.useMemo(() => {
    const map = new Map<string, { avg: number; voters: number }>()
    const ranksByKq = new Map<string, number[]>()
    for (const v of allVotes) {
      const list = ranksByKq.get(v.key_question_id) ?? []
      list.push(v.rank_within_type)
      ranksByKq.set(v.key_question_id, list)
    }
    for (const [kqId, ranks] of ranksByKq) {
      map.set(kqId, {
        avg: ranks.reduce((a, b) => a + b, 0) / ranks.length,
        voters: ranks.length,
      })
    }
    return map
  }, [allVotes])

  const sortedLevels = React.useMemo(
    () => [...indicatorLevels].sort((a, b) => a.sequence - b.sequence),
    [indicatorLevels]
  )

  // Derived fresh from server data on every render; local edits only exist
  // in localOrderOverride, which move() and handleDragEnd() both seed from
  // this the first time either is touched. That keeps this in sync with
  // fresh server data (e.g. a facilitator locking/unlocking a KQ elsewhere)
  // automatically whenever there's no unsaved local edit to protect, with
  // no effect-based resync needed.
  const computedOrder = React.useMemo(
    () => computeOrder(keyQuestions, sortedLevels, myRankByKqId),
    [keyQuestions, sortedLevels, myRankByKqId]
  )
  const [localOrderOverride, setLocalOrderOverride] =
    React.useState<LocalOrder | null>(null)
  const order = dirty && localOrderOverride ? localOrderOverride : computedOrder

  const kqsByLevel = React.useMemo(() => {
    const map = new Map<string, KeyQuestion[]>()
    for (const level of sortedLevels) map.set(level.id, [])
    for (const kq of keyQuestions) {
      map.get(kq.indicator_level_id)?.push(kq)
    }
    return map
  }, [keyQuestions, sortedLevels])

  function move(levelId: string, kqId: string, direction: "up" | "down") {
    setLocalOrderOverride((prev) => {
      const base = prev ?? order
      const current = base.get(levelId) ?? []
      const index = current.indexOf(kqId)
      const swapWith = direction === "up" ? index - 1 : index + 1
      if (index === -1 || swapWith < 0 || swapWith >= current.length) return base
      const next = [...current]
      ;[next[index], next[swapWith]] = [next[swapWith], next[index]]
      const map = new Map(base)
      map.set(levelId, next)
      return map
    })
    setDirty(true)
  }

  // Drag-and-drop's onDragEnd — a second entry point into the same
  // local-draft state move() already uses, so the chevron fallback and
  // dragging can never desync (both just mutate localOrderOverride).
  function handleDragEnd(levelId: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setLocalOrderOverride((prev) => {
      const base = prev ?? order
      const current = base.get(levelId) ?? []
      const oldIndex = current.indexOf(String(active.id))
      const newIndex = current.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return base
      const map = new Map(base)
      map.set(levelId, arrayMove(current, oldIndex, newIndex))
      return map
    })
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await Promise.all(
        [...order.entries()]
          .filter(([, ids]) => ids.length > 0)
          .map(([, ids]) => setRanking(projectId, ids))
      )
      setDirty(false)
      setLocalOrderOverride(null)
      await refresh()
    } catch {
      setError("That didn't save — try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-3xl font-semibold">
          Prioritise key questions
        </h2>
        <p className="text-sm text-muted-foreground">
          Rank locked key questions within each level, most important first.
          Drag to reorder, or use the chevrons, then hit Save — nothing is
          written until you do. Your ranking is personal —{" "}
          {role === "facilitator"
            ? "the combined ranking below shows how everyone's rankings line up."
            : "a facilitator will combine everyone's rankings to shortlist the dashboard set."}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {sortedLevels.map((level) => {
        const allInLevel = kqsByLevel.get(level.id) ?? []
        if (allInLevel.length === 0) return null

        const stage = stageColorsForLevel(level, sortedLevels)
        const orderedIds = order.get(level.id) ?? []
        const ordered = orderedIds
          .map((id) => kqById.get(id))
          .filter((kq): kq is KeyQuestion => !!kq)
        const excludedUnlocked = allInLevel.filter((kq) => !kq.is_locked)

        return (
          <Card key={level.id} style={{ borderLeft: `4px solid ${stage.cssVar}` }}>
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold">
                {level.number_label}. {level.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <DndContext
                collisionDetection={closestCenter}
                sensors={dndSensors}
                onDragEnd={(event) => handleDragEnd(level.id, event)}
              >
                <SortableContext
                  items={ordered.map((kq) => kq.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {ordered.map((kq, index) => (
                    <RankRow
                      key={kq.id}
                      kq={kq}
                      index={index}
                      stage={stage}
                      isFirst={index === 0}
                      isLast={index === ordered.length - 1}
                      onMoveUp={() => move(level.id, kq.id, "up")}
                      onMoveDown={() => move(level.id, kq.id, "down")}
                      combined={role === "facilitator" ? combinedByKqId.get(kq.id) : undefined}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {ordered.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No locked key questions in this level yet.
                </p>
              )}

              {excludedUnlocked.length > 0 && (
                <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                  <Lock className="size-3.5" />
                  {excludedUnlocked.length} key question
                  {excludedUnlocked.length === 1 ? "" : "s"} in this level
                  {excludedUnlocked.length === 1 ? " isn't" : " aren't"}{" "}
                  locked yet — a facilitator locks a question in Manage once
                  it&apos;s ready to prioritise.
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}

      <div
        aria-hidden={!dirty}
        className={cn(
          "sticky bottom-4 flex items-center gap-3 self-start rounded-card border border-border bg-background p-3 shadow-[0_1px_3px_rgba(20,20,20,0.08)]",
          !dirty && "opacity-0"
        )}
      >
        <Button
          type="button"
          disabled={!dirty || saving}
          tabIndex={dirty ? undefined : -1}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save ranking"}
        </Button>
        {dirty && !saving && (
          <span className="text-xs text-muted-foreground">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  )
}

function RankRow({
  kq,
  index,
  stage,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  combined,
}: {
  kq: KeyQuestion
  index: number
  stage: StageColorTokens
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  // Facilitator-only: this KQ's all-voter average rank, shown inline
  // rather than in a separate list — undefined for clients, or for a KQ
  // nobody has voted on yet.
  combined?: { avg: number; voters: number }
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: kq.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start justify-between gap-3 rounded-card bg-card p-3 shadow-[0_1px_3px_rgba(20,20,20,0.08)] ring-1 ring-border",
        isDragging && "z-10 shadow-lg"
      )}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          className="mt-1 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <span
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
            stage.bg,
            stage.fg
          )}
        >
          {index + 1}
        </span>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="font-mono">
              {kq.kq_number}
            </Badge>
            <PriorityIndicator priority={kq.priority} />
            {combined && (
              <span className="text-xs whitespace-nowrap text-muted-foreground">
                combined avg {combined.avg.toFixed(1)} ({combined.voters} voter
                {combined.voters === 1 ? "" : "s"})
              </span>
            )}
          </div>
          <p className="text-sm">{kq.question_text}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isFirst}
          onClick={onMoveUp}
          aria-label="Rank higher"
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isLast}
          onClick={onMoveDown}
          aria-label="Rank lower"
        >
          <ChevronDown className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

