import { cn } from "@/lib/utils"
import { priorityLabel, type Priority } from "@/lib/types"

// Priority is deliberately weight-based on ink, not another hue — using a
// colour here would compete with whichever results-chain stage colour
// happens to also read as "warm," blurring two separate visual questions
// ("what stage" vs "how urgent"). Replaces the old PRIORITY_BADGE_VARIANT
// (destructive/secondary/outline Badge) at every call site.
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
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <PriorityDot priority={priority} />
      {showLabel && (
        <span
          className={cn(
            "text-xs whitespace-nowrap",
            priority === "high" && "font-semibold text-foreground",
            priority === "medium" && "font-normal text-foreground",
            priority === "low" && "font-normal text-muted-foreground"
          )}
        >
          {priorityLabel(priority)}
        </span>
      )}
    </span>
  )
}

function PriorityDot({ priority }: { priority: Priority }) {
  if (priority === "high") {
    return (
      <svg width={8} height={8} viewBox="0 0 8 8" className="shrink-0" aria-hidden>
        <circle cx="4" cy="4" r="4" fill="var(--gk-ink)" />
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
          stroke="var(--ink-secondary)"
          strokeWidth="1.25"
        />
        <path d="M4 0.75 A3.25 3.25 0 0 1 4 7.25 Z" fill="var(--ink-secondary)" />
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
