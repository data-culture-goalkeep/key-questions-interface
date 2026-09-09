// Scenario definitions and the filter recompute maths, ported verbatim from
// the design handoff (scenarios.json + reference-implementation.js).

import {
  ALL_DIVISIONS,
  DIVISIONS,
  TOTAL_SCHOOLS,
  divisionIndex,
} from "./dimensions"

export type ScenarioId = "asis" | "hold" | "break"

export interface Scenario {
  id: ScenarioId
  label: string
  /** Percentage-point offset applied to rate metrics. */
  delta: number
  banner: string | null
}

export const SCENARIOS: Scenario[] = [
  { id: "asis", label: "Programme as-is", delta: 0, banner: null },
  {
    id: "hold",
    label: "Chain holding",
    delta: 11,
    banner:
      "Districts where the results chain holds: process implementation, teacher practice and learning move together in the same direction.",
  },
  {
    id: "break",
    label: "Chain breaking",
    delta: -14,
    banner:
      "A struggling picture: processes are recorded as done, but teacher practice and student learning do not follow — the chain breaks between output and outcome.",
  },
]

export function scenarioById(id: ScenarioId): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0]
}

export interface MockupFilters {
  year: string
  division: string
  district: string
  subject: string
  /** Per-view scenario; defaults to "asis". */
  scenario: ScenarioId
}

function divisionOffset(division: string): number {
  const i = divisionIndex(division)
  return i < 0 ? 0 : DIVISIONS[i].offset
}

/**
 * Adjust a rate metric (%) for the active scenario + selected division.
 * `reverse` metrics ("None met", "Below Dakshata") take the opposite sign so
 * "worse" always trends down. Result is clamped to [1, 99].
 */
export function adjustRate(
  value: number,
  filters: MockupFilters,
  reverse = false,
): number {
  const d =
    (scenarioById(filters.scenario).delta + divisionOffset(filters.division)) *
    (reverse ? -1 : 1)
  return Math.max(1, Math.min(99, Math.round(value + d)))
}

/** Scale a programme-wide count to the selected division's share of schools. */
export function scaleCount(n: number, filters: MockupFilters): number {
  const i = divisionIndex(filters.division)
  if (i < 0) return n
  return Math.max(1, Math.round((n * DIVISIONS[i].schools) / TOTAL_SCHOOLS))
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-US")
}

export function filtersDirty(filters: MockupFilters): boolean {
  return (
    filters.division !== ALL_DIVISIONS ||
    filters.district !== "All Districts" ||
    filters.subject !== "All Subjects" ||
    filters.scenario !== "asis"
  )
}

export const DEFAULT_FILTERS: MockupFilters = {
  year: "2025–26",
  division: ALL_DIVISIONS,
  district: "All Districts",
  subject: "All Subjects",
  scenario: "asis",
}
