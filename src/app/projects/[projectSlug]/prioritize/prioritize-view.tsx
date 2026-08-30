"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Lock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PRIORITY_BADGE_VARIANT,
  type IndicatorLevel,
  type Priority,
} from "@/lib/types"

import { setRanking } from "./actions"
import type { PrioritizeKq, VoteRow } from "./page"

export function PrioritizeView({
  projectId,
  role,
  keyQuestions,
  myVotes,
  allVotes,
  indicatorLevels,
}: {
  projectId: string
  role: "facilitator" | "client"
  keyQuestions: PrioritizeKq[]
  myVotes: VoteRow[]
  allVotes: VoteRow[]
  indicatorLevels: IndicatorLevel[]
}) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  function run(fn: () => Promise<void>) {
    setError(null)
    startTransition(async () => {
      try {
        await fn()
        router.refresh()
      } catch {
        setError(
          "That ranking change didn't save — try again, or refresh the page."
        )
      }
    })
  }

  const myRankByKqId = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const v of myVotes) map.set(v.key_question_id, v.rank_within_type)
    return map
  }, [myVotes])

  const sortedLevels = React.useMemo(
    () => [...indicatorLevels].sort((a, b) => a.sequence - b.sequence),
    [indicatorLevels]
  )

  const kqsByLevel = React.useMemo(() => {
    const map = new Map<string, PrioritizeKq[]>()
    for (const level of sortedLevels) map.set(level.id, [])
    for (const kq of keyQuestions) {
      map.get(kq.indicator_level_id)?.push(kq)
    }
    return map
  }, [keyQuestions, sortedLevels])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Prioritise key questions</h2>
        <p className="text-sm text-muted-foreground">
          Rank the key questions within each level, most important first.
          Your ranking is personal — {role === "facilitator" ? "the combined ranking below shows how everyone's rankings line up." : "a facilitator will combine everyone's rankings to shortlist the dashboard set."}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {sortedLevels.map((level) => {
        const allInLevel = kqsByLevel.get(level.id) ?? []
        if (allInLevel.length === 0) return null

        const rankable =
          role === "facilitator"
            ? allInLevel
            : allInLevel.filter((kq) => !kq.is_locked)
        const excludedLocked =
          role === "client" ? allInLevel.filter((kq) => kq.is_locked) : []

        const ordered = [...rankable].sort((a, b) => {
          const ra = myRankByKqId.get(a.id) ?? Number.MAX_SAFE_INTEGER
          const rb = myRankByKqId.get(b.id) ?? Number.MAX_SAFE_INTEGER
          if (ra !== rb) return ra - rb
          return a.kq_number.localeCompare(b.kq_number)
        })

        function move(kqId: string, direction: "up" | "down") {
          const index = ordered.findIndex((k) => k.id === kqId)
          const swapWith = direction === "up" ? index - 1 : index + 1
          if (index === -1 || swapWith < 0 || swapWith >= ordered.length) return
          const next = [...ordered]
          ;[next[index], next[swapWith]] = [next[swapWith], next[index]]
          run(() => setRanking(projectId, next.map((k) => k.id)))
        }

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
                        <Badge variant="outline" className="font-mono">
                          {kq.kq_number}
                        </Badge>
                        <Badge
                          variant={
                            PRIORITY_BADGE_VARIANT[kq.priority as Priority]
                          }
                        >
                          {kq.priority}
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
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === 0}
                      onClick={() => move(kq.id, "up")}
                      aria-label="Rank higher"
                    >
                      <ChevronUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === ordered.length - 1}
                      onClick={() => move(kq.id, "down")}
                      aria-label="Rank lower"
                    >
                      <ChevronDown className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {excludedLocked.length > 0 && (
                <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                  <Lock className="size-3.5" />
                  {excludedLocked.length} locked question
                  {excludedLocked.length === 1 ? "" : "s"} in this level
                  {excludedLocked.length === 1 ? " isn't" : " aren't"} open
                  for ranking.
                </p>
              )}

              {role === "facilitator" && (
                <CombinedRanking keyQuestions={allInLevel} allVotes={allVotes} />
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function CombinedRanking({
  keyQuestions,
  allVotes,
}: {
  keyQuestions: PrioritizeKq[]
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

  if (combined.every((c) => c.voterCount === 0)) return null

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
