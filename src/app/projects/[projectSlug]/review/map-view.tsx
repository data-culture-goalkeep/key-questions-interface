"use client"

import * as React from "react"
import { Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  type IndicatorLevel,
  type KeyQuestion,
  type KeyQuestionLink,
} from "@/lib/types"

// Cycles through the theme's 5 chart colors regardless of how many levels
// a project has configured.
const CHART_COLOR_COUNT = 5

const LINE_STYLE_BY_RELATIONSHIP: Record<
  KeyQuestionLink["relationship_type"],
  { dash?: string; opacity: number }
> = {
  informs: { opacity: 0.9 },
  depends_on: { dash: "4 3", opacity: 0.9 },
  related_to: { dash: "1 4", opacity: 0.6 },
}

interface LineCoords {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  relationshipType: KeyQuestionLink["relationship_type"]
  active: boolean
}

export function MapView({
  keyQuestions,
  links,
  indicatorLevels,
  selectedKqId,
  onSelectKq,
}: {
  keyQuestions: KeyQuestion[]
  links: KeyQuestionLink[]
  indicatorLevels: IndicatorLevel[]
  selectedKqId: string | null
  onSelectKq: (kqId: string) => void
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const nodeRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const [lines, setLines] = React.useState<LineCoords[]>([])

  const sortedLevels = React.useMemo(
    () => [...indicatorLevels].sort((a, b) => a.sequence - b.sequence),
    [indicatorLevels]
  )

  const kqsByLevel = React.useMemo(() => {
    const map = new Map<string, KeyQuestion[]>()
    for (const level of sortedLevels) map.set(level.id, [])
    for (const kq of keyQuestions) {
      map.get(kq.indicator_level_id)?.push(kq)
    }
    // `sequence` only orders KQs within their own area of enquiry, which
    // is meaningless once grouped by indicator level (cuts across areas).
    // kq_number is stable and comparable across areas.
    for (const list of map.values()) {
      list.sort((a, b) => a.kq_number.localeCompare(b.kq_number))
    }
    return map
  }, [keyQuestions, sortedLevels])

  const recomputeLines = React.useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()

    const next: LineCoords[] = []
    for (const link of links) {
      const a = nodeRefs.current.get(link.key_question_id_a)
      const b = nodeRefs.current.get(link.key_question_id_b)
      if (!a || !b) continue
      const aRect = a.getBoundingClientRect()
      const bRect = b.getBoundingClientRect()

      const aRight = aRect.right < bRect.left
      next.push({
        id: link.id,
        x1: (aRight ? aRect.right : aRect.left) - containerRect.left,
        y1: aRect.top + aRect.height / 2 - containerRect.top,
        x2: (aRight ? bRect.left : bRect.right) - containerRect.left,
        y2: bRect.top + bRect.height / 2 - containerRect.top,
        relationshipType: link.relationship_type,
        active:
          selectedKqId === link.key_question_id_a ||
          selectedKqId === link.key_question_id_b,
      })
    }
    setLines(next)
  }, [links, selectedKqId])

  React.useLayoutEffect(() => {
    recomputeLines()
  }, [recomputeLines])

  React.useEffect(() => {
    const onResize = () => recomputeLines()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [recomputeLines])

  if (keyQuestions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No key questions yet for this project.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Solid lines = informs · dashed = depends on · dotted = related to.
        Click a key question to view it in the list.
      </p>
      <div className="overflow-x-auto">
        {/* containerRef's own box must span the full scrollable content
            width (not just the visible viewport), since the SVG overlay
            sizes itself to this element and clips anything outside it. */}
        <div
          ref={containerRef}
          className="relative"
          style={{ minWidth: `${sortedLevels.length * 180}px` }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {lines.map((line) => (
              <line
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="var(--foreground)"
                strokeWidth={line.active ? 2 : 1}
                strokeOpacity={
                  line.active
                    ? 0.9
                    : LINE_STYLE_BY_RELATIONSHIP[line.relationshipType].opacity * 0.5
                }
                strokeDasharray={
                  LINE_STYLE_BY_RELATIONSHIP[line.relationshipType].dash
                }
              />
            ))}
          </svg>

          <div
            className="relative grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${sortedLevels.length}, minmax(0, 1fr))`,
            }}
          >
          {sortedLevels.map((level, levelIndex) => (
            <div key={level.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 pb-1">
                <span
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor: `var(--chart-${(levelIndex % CHART_COLOR_COUNT) + 1})`,
                  }}
                />
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {level.number_label}. {level.label}
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {(kqsByLevel.get(level.id) ?? []).map((kq) => (
                  <button
                    key={kq.id}
                    ref={(el) => {
                      if (el) nodeRefs.current.set(kq.id, el)
                      else nodeRefs.current.delete(kq.id)
                    }}
                    type="button"
                    onClick={() => onSelectKq(kq.id)}
                    className={cn(
                      "flex flex-col gap-1 rounded-lg border border-border bg-card p-2.5 text-left text-xs shadow-sm transition-colors hover:bg-muted/50",
                      selectedKqId === kq.id && "ring-2 ring-ring"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {kq.kq_number}
                      </Badge>
                      {kq.is_locked && <Lock className="size-3 text-muted-foreground" />}
                    </div>
                    <span className="line-clamp-3 text-foreground">
                      {kq.question_text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
}
