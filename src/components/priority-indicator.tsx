import { cn } from "@/lib/utils"
import { priorityLabel, type Priority } from "@/lib/types"

// Priority is deliberately weight-based on ink, not another hue — using a
// colour here would compete with whichever results-chain stage colour
// happens to also read as "warm," blurring two separate visual questions
// ("what stage" vs "how urgent"). Replaces the old PRIORITY_BADGE_VARIANT
// (destructive/secondary/outline Badge) at every call site.
//
// Rendered as a bounded, filled/bordered pill (not just plain dot+text) and
// deliberately given more visual weight than the stage pill it sits next
// to — only High-priority questions get taken up when a dashboard is
// designed, so priority needs to win the eye over "what stage," not lose
// to it.
export function PriorityIndicator({
  priority,
  showLabel = true,
  className,
}: {
  priority: Priority
  showLabel?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs whitespace-nowrap",
        priority === "high" && "bg-gk-ink font-bold text-white",
        priority === "medium" && "border-2 border-gk-ink font-semibold text-foreground",
        priority === "low" && "border border-border font-normal text-muted-foreground",
        className
      )}
    >
      <PriorityDot priority={priority} />
      {showLabel && priorityLabel(priority)}
    </span>
  )
}

function PriorityDot({ priority }: { priority: Priority }) {
  if (priority === "high") {
    return (
      <svg width={8} height={8} viewBox="0 0 8 8" className="shrink-0" aria-hidden>
        <circle cx="4" cy="4" r="4" fill="white" />
      </svg>
    )
  }
  if (priority === "medium") {
    return (
      <svg width={8} height={8} viewBox="0 0 8 8" className="shrink-0" aria-hidden>
        <circle
          cx="4"
          cy="4"
          r="3.25"
          fill="none"
          stroke="var(--gk-ink)"
          strokeWidth="1.25"
        />
        <path d="M4 0.75 A3.25 3.25 0 0 1 4 7.25 Z" fill="var(--gk-ink)" />
      </svg>
    )
  }
  return (
    <svg width={8} height={8} viewBox="0 0 8 8" className="shrink-0" aria-hidden>
      <circle
        cx="4"
        cy="4"
        r="3.25"
        fill="none"
        stroke="var(--ink-secondary)"
        strokeWidth="1.25"
      />
    </svg>
  )
}
