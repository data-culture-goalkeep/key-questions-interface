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
  levelIds: Set<string>
  priorities: Set<Priority>
  lockFilter: LockFilter
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
  onJumpToArea,
}: {
  areas: AreaOfEnquiry[]
  indicatorLevels: IndicatorLevel[]
  filters: ReviewFilters
  onFiltersChange: (filters: ReviewFilters) => void
  onJumpToArea: (areaId: string) => void
}) {
  const sortedLevels = [...indicatorLevels].sort((a, b) => a.sequence - b.sequence)

  function toggleLevel(id: string) {
    const next = new Set(filters.levelIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onFiltersChange({ ...filters, levelIds: next })
  }

  function togglePriority(p: Priority) {
    const next = new Set(filters.priorities)
    if (next.has(p)) next.delete(p)
    else next.add(p)
    onFiltersChange({ ...filters, priorities: next })
  }

  const hasActiveFilters =
    filters.levelIds.size > 0 ||
    filters.priorities.size > 0 ||
    filters.lockFilter !== "all"

  return (
    <div className="flex w-56 shrink-0 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Filters
          </h4>
          {hasActiveFilters && (
            <button
              type="button"
              className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
              onClick={() =>
                onFiltersChange({
                  levelIds: new Set(),
                  priorities: new Set(),
                  lockFilter: "all",
                })
              }
            >
              Clear
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
                active={filters.levelIds.has(l.id)}
                onClick={() => toggleLevel(l.id)}
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
                active={filters.priorities.has(p.value)}
                onClick={() => togglePriority(p.value)}
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
          <nav className="flex flex-col gap-1">
            {areas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => onJumpToArea(area.id)}
                className="truncate text-left text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                title={area.name}
              >
                {area.name}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
