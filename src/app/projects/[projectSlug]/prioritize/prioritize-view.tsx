"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, Lock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  priorityLabel,
  PRIORITY_BADGE_VARIANT,
  type IndicatorLevel,
  type KeyQuestion,
  type Priority,
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

  const sortedLevels = React.useMemo(
    () => [...indicatorLevels].sort((a, b) => a.sequence - b.sequence),
    [indicatorLevels]
  )

  // Derived fresh from server data on every render; local edits only exist
  // in localOrderOverride, which move() seeds from this the first time it's
  // touched. That keeps this in sync with fresh server data (e.g. a
  // facilitator locking/unlocking a KQ elsewhere) automatically whenever
  // there's no unsaved local edit to protect, with no effect-based
  // resync needed.
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
        <h2 className="text-lg font-semibold">Prioritise key questions</h2>
        <p className="text-sm text-muted-foreground">
          Rank locked key questions within each level, most important first.
          Reorder freely, then hit Save — nothing is written until you do.
          Your ranking is personal —{" "}
          {role === "facilitator"
            ? "the combined ranking below shows how everyone's rankings line up."
            : "a facilitator will combine everyone's rankings to shortlist the dashboard set."}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {sortedLevels.map((level) => {
        const allInLevel = kqsByLevel.get(level.id) ?? []
        if (allInLevel.length === 0) return null

        const orderedIds = order.get(level.id) ?? []
        const ordered = orderedIds
          .map((id) => kqById.get(id))
          .filter((kq): kq is KeyQuestion => !!kq)
        const excludedUnlocked = allInLevel.filter((kq) => !kq.is_locked)

        return (
          <Card key={level.id}>
            <CardHeader>
              <CardTitle>
                {level.number_label}. {level.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {ordered.map((kq, index) => (
                <div
                  key={kq.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 shrink-0 text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="font-mono">
                          {kq.kq_number}
                        </Badge>
                        <Badge
                          variant={
                            PRIORITY_BADGE_VARIANT[kq.priority as Priority]
                          }
                        >
                          {priorityLabel(kq.priority as Priority)}
                        </Badge>
                      </div>
                      <p className="text-sm">{kq.question_text}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === 0}
                      onClick={() => move(level.id, kq.id, "up")}
                      aria-label="Rank higher"
                    >
                      <ChevronUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === ordered.length - 1}
                      onClick={() => move(level.id, kq.id, "down")}
                      aria-label="Rank lower"
                    >
                      <ChevronDown className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

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

              {role === "facilitator" && (
                <CombinedRanking
                  keyQuestions={allInLevel.filter((kq) => kq.is_locked)}
                  allVotes={allVotes}
                />
              )}
            </CardContent>
          </Card>
        )
      })}

      <div
        className={cn(
          "sticky bottom-4 flex items-center gap-3 self-start rounded-lg border border-border bg-background p-3 shadow-sm",
          !dirty && "opacity-0"
        )}
      >
        <Button type="button" disabled={!dirty || saving} onClick={handleSave}>
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

function CombinedRanking({
  keyQuestions,
  allVotes,
}: {
  keyQuestions: KeyQuestion[]
  allVotes: VoteRow[]
}) {
  const combined = React.useMemo(() => {
    const votesByKq = new Map<string, number[]>()
    for (const v of allVotes) {
      const list = votesByKq.get(v.key_question_id) ?? []
      list.push(v.rank_within_type)
      votesByKq.set(v.key_question_id, list)
    }
    return keyQuestions
      .map((kq) => {
        const ranks = votesByKq.get(kq.id) ?? []
        const avg =
          ranks.length > 0
            ? ranks.reduce((a, b) => a + b, 0) / ranks.length
            : null
        return { kq, avg, voterCount: ranks.length }
      })
      .sort((a, b) => {
        if (a.avg === null && b.avg === null) return 0
        if (a.avg === null) return 1
        if (b.avg === null) return -1
        return a.avg - b.avg
      })
  }, [keyQuestions, allVotes])

  if (combined.length === 0 || combined.every((c) => c.voterCount === 0)) {
    return null
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-3">
      <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Combined ranking (all voters)
      </h4>
      {combined.map(({ kq, avg, voterCount }) => (
        <div
          key={kq.id}
          className="flex items-center justify-between gap-2 text-sm"
        >
          <span className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              {kq.kq_number}
            </Badge>
            <span className="text-muted-foreground">{kq.question_text}</span>
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {avg !== null
              ? `avg rank ${avg.toFixed(1)} · ${voterCount} voter${voterCount === 1 ? "" : "s"}`
              : "no votes yet"}
          </span>
        </div>
      ))}
    </div>
  )
}
