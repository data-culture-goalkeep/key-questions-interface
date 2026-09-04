"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { stageColorsForLevel } from "@/lib/stage-colors"
import {
  PRIORITIES,
  type AreaOfEnquiry,
  type IndicatorLevel,
  type Priority,
} from "@/lib/types"
import { PROJECT_SIDEBAR_SLOT_ID } from "../project-sidebar"

export type LockFilter = "all" | "locked" | "unlocked"

export interface ReviewFilters {
  titleQuery: string
  levelId: string | null
  priority: Priority | null
  areaId: string | null
  lockFilter: LockFilter
}

export const EMPTY_REVIEW_FILTERS: ReviewFilters = {
  titleQuery: "",
  levelId: null,
  priority: null,
  areaId: null,
  lockFilter: "all",
}

function FilterChip({
  active,
  onClick,
  fullWidth,
  children,
}: {
  active: boolean
  onClick: () => void
  // Priority/Status chips wrap in a row and should stay content-sized, but
  // the Areas-of-Enquiry (and, since names got spelled out, Indicator
  // level) lists are a single column of often much longer labels —
  // without an explicit width to truncate against, a long label just
  // grows the chip past the rail's width and overlaps whatever's next to
  // it (Badge defaults to `w-fit`, and a flex item's truncate does
  // nothing without a bounding width).
  fullWidth?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("text-left", fullWidth && "block w-full")}
    >
      <Badge
        variant={active ? "default" : "outline"}
        className={cn("cursor-pointer text-[11px]", fullWidth && "w-full")}
      >
        {children}
      </Badge>
    </button>
  )
}

// Level chips keep their stage colour visible even when unselected, so
// people learn the results-chain colour language just by scanning the
// filter panel — the one filter group where the doc wants that.
function StageFilterChip({
  active,
  onClick,
  stageClass,
  children,
}: {
  active: boolean
  onClick: () => void
  stageClass: { bg: string; fg: string; text: string }
  children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      <Badge
        className={cn(
          "w-full cursor-pointer justify-start border-transparent text-[11px]",
          active
            ? cn(stageClass.bg, stageClass.fg)
            : cn("bg-transparent", stageClass.text, "border-current/30")
        )}
      >
        {children}
      </Badge>
    </button>
  )
}

// Filters render inside the persistent left rail (via a portal into
// ProjectSidebar's slot) rather than as a second column next to the
// content — one left-hand region instead of two competing for horizontal
// space. Returns null (renders nothing in place) until the portal target
// exists in the DOM.
export function ReviewSidebar({
  areas,
  indicatorLevels,
  filters,
  onFiltersChange,
}: {
  areas: AreaOfEnquiry[]
  indicatorLevels: IndicatorLevel[]
  filters: ReviewFilters
  onFiltersChange: (filters: ReviewFilters) => void
}) {
  const [slot, setSlot] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    // The portal target is a real DOM node ProjectSidebar renders — it
    // only exists post-mount, so this genuinely needs an effect (there's
    // no "external store" API for an arbitrary getElementById lookup).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlot(document.getElementById(PROJECT_SIDEBAR_SLOT_ID))
  }, [])

  const sortedLevels = [...indicatorLevels].sort((a, b) => a.sequence - b.sequence)

  // Every filter category is single-select: clicking the already-active
  // value clears it back to "no filter" instead of switching selections.
  function selectLevel(id: string) {
    onFiltersChange({ ...filters, levelId: filters.levelId === id ? null : id })
  }

  function selectPriority(p: Priority) {
    onFiltersChange({
      ...filters,
      priority: filters.priority === p ? null : p,
    })
  }

  function selectArea(id: string) {
    onFiltersChange({ ...filters, areaId: filters.areaId === id ? null : id })
  }

  const hasActiveFilters =
    filters.titleQuery.trim() !== "" ||
    filters.levelId !== null ||
    filters.priority !== null ||
    filters.areaId !== null ||
    filters.lockFilter !== "all"

  if (!slot) return null

  return createPortal(
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Filters
          </h4>
          {hasActiveFilters && (
            <button
              type="button"
              className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => onFiltersChange(EMPTY_REVIEW_FILTERS)}
            >
              Clear all
            </button>
          )}
        </div>

        <Input
          value={filters.titleQuery}
          onChange={(e) =>
            onFiltersChange({ ...filters, titleQuery: e.target.value })
          }
          placeholder="Search by title…"
          className="h-8 text-[13px]"
          aria-label="Search key questions by title"
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted-foreground">
            Indicator level
          </span>
          <div className="flex flex-col gap-1">
            {sortedLevels.map((l) => (
              <StageFilterChip
                key={l.id}
                active={filters.levelId === l.id}
                onClick={() => selectLevel(l.id)}
                stageClass={stageColorsForLevel(l, sortedLevels)}
              >
                {l.number_label}. {l.label}
              </StageFilterChip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted-foreground">Priority</span>
          <div className="flex flex-wrap gap-1.5">
            {PRIORITIES.map((p) => (
              <FilterChip
                key={p.value}
                active={filters.priority === p.value}
                onClick={() => selectPriority(p.value)}
              >
                {p.label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted-foreground">Status</span>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "unlocked", "locked"] as const).map((status) => (
              <FilterChip
                key={status}
                active={filters.lockFilter === status}
                onClick={() =>
                  onFiltersChange({ ...filters, lockFilter: status })
                }
              >
                {status === "all"
                  ? "All"
                  : status === "unlocked"
                    ? "Unlocked"
                    : "Locked"}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      {areas.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Areas of enquiry
          </h4>
          <div className="flex flex-col gap-1">
            {areas.map((area) => (
              <FilterChip
                key={area.id}
                active={filters.areaId === area.id}
                onClick={() => selectArea(area.id)}
                fullWidth
              >
                <span className="flex min-w-0 items-center gap-1 text-left">
                  {area.area_number && (
                    <span className="shrink-0 font-mono">{area.area_number}</span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{area.name}</span>
                </span>
              </FilterChip>
            ))}
          </div>
        </div>
      )}
    </div>,
    slot
  )
}
