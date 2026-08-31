"use client"

import { Badge } from "@/components/ui/badge"
import {
  PRIORITIES,
  type AreaOfEnquiry,
  type IndicatorLevel,
  type Priority,
} from "@/lib/types"

export type LockFilter = "all" | "locked" | "unlocked"

export interface ReviewFilters {
  levelId: string | null
  priority: Priority | null
  areaId: string | null
  lockFilter: LockFilter
}

export const EMPTY_REVIEW_FILTERS: ReviewFilters = {
  levelId: null,
  priority: null,
  areaId: null,
  lockFilter: "all",
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick}>
      <Badge
        variant={active ? "default" : "outline"}
        className="cursor-pointer text-[11px]"
      >
        {children}
      </Badge>
    </button>
  )
}

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
    filters.levelId !== null ||
    filters.priority !== null ||
    filters.areaId !== null ||
    filters.lockFilter !== "all"

  return (
    <div className="flex w-56 shrink-0 flex-col gap-6 sm:sticky sm:top-4 sm:self-start">
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

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted-foreground">
            Indicator level
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sortedLevels.map((l) => (
              <FilterChip
                key={l.id}
                active={filters.levelId === l.id}
                onClick={() => selectLevel(l.id)}
              >
                {l.number_label}
              </FilterChip>
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
              >
                <span className="flex items-center gap-1 text-left">
                  {area.area_number && (
                    <span className="font-mono">{area.area_number}</span>
                  )}
                  <span className="truncate">{area.name}</span>
                </span>
              </FilterChip>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
