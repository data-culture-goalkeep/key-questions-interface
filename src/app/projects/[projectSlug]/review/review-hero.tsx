import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { stageColorsForLevel } from "@/lib/stage-colors"
import type { IndicatorLevel, KeyQuestion } from "@/lib/types"

// Client-facing landing moment for Review — a few live stat tiles pulled
// entirely from data already loaded via ProjectDataProvider, no new fetch.
// Each tile's accent dot cycles through the four brand hues purely for
// visual variety (unlike the level filter chips, this isn't the stage-
// colour language — these are aggregate stats, not stage-specific data).
const TILE_DOTS = ["bg-gk-yellow", "bg-gk-coral", "bg-gk-teal", "bg-gk-blue"]

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
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-2.5">
            <span
              className={cn("size-2 shrink-0 rounded-full", TILE_DOTS[i % TILE_DOTS.length])}
              aria-hidden
            />
            <div className="flex flex-col">
              <span className="font-display text-2xl leading-none font-semibold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {levelCounts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
          {levelCounts.map(({ level, count, stage }) => (
            <span
              key={level.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                stage.bg,
                stage.fg
              )}
            >
              {count} {level.label}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
