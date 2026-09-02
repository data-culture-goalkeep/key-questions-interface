import * as React from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { stageColorsForLevel } from "@/lib/stage-colors"
import type { IndicatorLevel, KeyQuestion } from "@/lib/types"

// A few live stat tiles pulled entirely from data already loaded via
// ProjectDataProvider, no new fetch — shown at the top of both Review and
// Prioritize, so "where things stand" is visible the moment either screen
// opens. Every tile shares one visual language now (a colour bar, not a
// small dot, so it reads clearly at a glance) — the four aggregate stats
// on the left use the four brand hues purely for variety, the level
// breakdown on the right uses the real stage colours.
const TILE_BAR_CLASSES = [
  "border-l-gk-yellow",
  "border-l-gk-coral",
  "border-l-gk-teal",
  "border-l-gk-blue",
]

function StatTile({
  value,
  label,
  className,
  style,
}: {
  value: string
  label: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={cn("flex flex-col gap-1 border-l-4 pl-3.5", className)} style={style}>
      <span className="font-display text-3xl leading-none font-semibold text-foreground">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function ReviewHero({
  keyQuestions,
  indicatorLevels,
}: {
  keyQuestions: KeyQuestion[]
  indicatorLevels: IndicatorLevel[]
}) {
  const total = keyQuestions.length
  const locked = keyQuestions.filter((kq) => kq.is_locked).length
  const openComments = keyQuestions.reduce(
    (sum, kq) =>
      sum + (kq.key_question_comments?.filter((c) => c.status === "open").length ?? 0),
    0
  )
  const verified = keyQuestions.reduce(
    (sum, kq) => sum + (kq.key_question_client_reviews?.length ?? 0),
    0
  )

  const stats = [
    { label: "Key questions", value: String(total) },
    { label: "Locked", value: `${locked} of ${total}` },
    { label: "Open comments", value: String(openComments) },
    { label: "Verified", value: String(verified) },
  ]

  const sortedLevels = [...indicatorLevels].sort((a, b) => a.sequence - b.sequence)
  const countByLevel = new Map<string, number>()
  for (const kq of keyQuestions) {
    countByLevel.set(
      kq.indicator_level_id,
      (countByLevel.get(kq.indicator_level_id) ?? 0) + 1
    )
  }
  const levelCounts = sortedLevels
    .map((level) => ({
      level,
      count: countByLevel.get(level.id) ?? 0,
      stage: stageColorsForLevel(level, sortedLevels),
    }))
    .filter(({ count }) => count > 0)

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
        {stats.map((stat, i) => (
          <StatTile
            key={stat.label}
            value={stat.value}
            label={stat.label}
            className={TILE_BAR_CLASSES[i % TILE_BAR_CLASSES.length]}
          />
        ))}

        {levelCounts.length > 0 && (
          <>
            <div className="hidden h-12 w-px shrink-0 bg-border sm:block" aria-hidden />
            <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
              {levelCounts.map(({ level, count, stage }) => (
                <StatTile
                  key={level.id}
                  value={String(count)}
                  label={level.label}
                  style={{ borderLeftColor: stage.cssVar }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
