import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { KeyQuestion } from "@/lib/types"

// Client-facing landing moment for Review — a few live stat tiles pulled
// entirely from data already loaded via ProjectDataProvider, no new fetch.
// Each tile's accent dot cycles through the four brand hues purely for
// visual variety (unlike the level filter chips, this isn't the stage-
// colour language — these are aggregate stats, not stage-specific data).
const TILE_DOTS = ["bg-gk-yellow", "bg-gk-coral", "bg-gk-teal", "bg-gk-blue"]

export function ReviewHero({ keyQuestions }: { keyQuestions: KeyQuestion[] }) {
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

  return (
    <Card className="flex-row flex-wrap items-center gap-x-10 gap-y-4">
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
    </Card>
  )
}
