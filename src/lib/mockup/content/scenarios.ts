// Scenario definitions and the filter recompute maths, ported verbatim from
// the design handoff (scenarios.json + reference-implementation.js).

import {
  ALL_DISTRICTS,
  ALL_DIVISIONS,
  ALL_SUBJECTS,
  DISTRICTS,
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

// Each filter dimension nudges rate metrics and rescales counts so that
// interacting with Year, Division or District all visibly move the numbers
// (the reference only wired up Division). Values are invented but deterministic.

const YEAR_RATE_DELTA: Record<string, number> = {
  "2025–26": 0,
  "2024–25": -6,
  "2023–24": -13,
}
const YEAR_COUNT_FACTOR: Record<string, number> = {
  "2025–26": 1,
  "2024–25": 0.82,
  "2023–24": 0.6,
}

// Per-district rate offset (pp), indexed by DISTRICTS order.
const DISTRICT_OFFSETS = [-4, 3, -1, 5, 2, -5, 4, -2, 1, -3]
// A single district is roughly a sixth of a division's schools.
const DISTRICT_COUNT_FACTOR = 0.17

function districtOffset(district: string): number {
  const i = DISTRICTS.indexOf(district as never)
  return i < 0 ? 0 : DISTRICT_OFFSETS[i]
}

/**
 * Adjust a rate metric (%) for the active scenario + Year / Division / District.
 * `reverse` metrics ("None met", "Below Dakshata") take the opposite sign so
 * "worse" always trends down. Result is clamped to [1, 99].
 */
export function adjustRate(
  value: number,
  filters: MockupFilters,
  reverse = false,
): number {
  const d =
    (scenarioById(filters.scenario).delta +
      divisionOffset(filters.division) +
      districtOffset(filters.district) +
      (YEAR_RATE_DELTA[filters.year] ?? 0)) *
    (reverse ? -1 : 1)
  return Math.max(1, Math.min(99, Math.round(value + d)))
}

/** Scale a programme-wide count for the selected Year / Division / District. */
export function scaleCount(n: number, filters: MockupFilters): number {
  let factor = YEAR_COUNT_FACTOR[filters.year] ?? 1
  const i = divisionIndex(filters.division)
  if (i >= 0) factor *= DIVISIONS[i].schools / TOTAL_SCHOOLS
  if (filters.district !== ALL_DISTRICTS) factor *= DISTRICT_COUNT_FACTOR
  return Math.max(1, Math.round(n * factor))
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-US")
}

export function filtersDirty(filters: MockupFilters): boolean {
  return (
    filters.year !== DEFAULT_FILTERS.year ||
    filters.division !== ALL_DIVISIONS ||
    filters.district !== ALL_DISTRICTS ||
    filters.subject !== ALL_SUBJECTS ||
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
