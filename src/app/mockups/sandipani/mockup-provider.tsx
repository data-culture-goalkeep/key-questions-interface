"use client"

import * as React from "react"

import { getMockupData } from "@/lib/mockup/mockup-data"
import {
  DEFAULT_FILTERS,
  type MockupFilters,
  type ScenarioId,
} from "@/lib/mockup/content/scenarios"
import {
  elementKey,
  isReviewed,
  type MockupComment,
  type MockupData,
  type StructuredAnswer,
} from "@/lib/mockup/types"

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface MockupContextValue {
  data: MockupData | null
  error: string | null
  refresh: () => Promise<void>
  mutate: (
    patch: (data: MockupData) => MockupData,
    action: () => Promise<void>,
  ) => Promise<void>

  /** Resolved from the chosen reviewer name; null until data loads or if unknown. */
  reviewerId: string | null
  reviewerName: string

  // --- UI state (survives view switches; no server round trip) ---
  filters: Omit<MockupFilters, "scenario">
  setFilter: (patch: Partial<Omit<MockupFilters, "scenario">>) => void
  resetFilters: (viewId: string) => void
  scenarioFor: (viewId: string) => ScenarioId
  setScenario: (viewId: string, scenario: ScenarioId) => void
  /** Full filter set for a view (filters + that view's scenario). */
  filtersForView: (viewId: string) => MockupFilters

  railOpen: boolean
  toggleRail: () => void

  focus: string | null
  setFocus: (elementNum: string | null) => void
}

const MockupContext = React.createContext<MockupContextValue | null>(null)

export function useMockup() {
  const ctx = React.useContext(MockupContext)
  if (!ctx) throw new Error("useMockup must be used within a MockupProvider")
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const FILTERS_KEY = "sandipani-review-filters"

export function MockupProvider({
  reviewerName,
  children,
}: {
  reviewerName: string
  children: React.ReactNode
}) {
  const [data, setData] = React.useState<MockupData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [optimisticData, applyOptimisticPatch] = React.useOptimistic(
    data,
    (current: MockupData | null, patch: (d: MockupData) => MockupData) =>
      current ? patch(current) : current,
  )

  const refreshSeq = React.useRef(0)
  const refresh = React.useCallback(async () => {
    const seq = ++refreshSeq.current
    try {
      const result = await getMockupData()
      if (seq !== refreshSeq.current) return
      setData(result)
      setError(null)
    } catch {
      if (seq !== refreshSeq.current) return
      setError("Couldn't load the review data — try refreshing the page.")
    }
  }, [])

  const mutate = React.useCallback(
    (patch: (d: MockupData) => MockupData, action: () => Promise<void>) =>
      new Promise<void>((resolve, reject) => {
        React.startTransition(async () => {
          applyOptimisticPatch(patch)
          let actionError: unknown
          try {
            await action()
          } catch (err) {
            actionError = err
          }
          await refresh()
          if (actionError) reject(actionError)
          else resolve()
        })
      }),
    [refresh, applyOptimisticPatch],
  )

  React.useEffect(() => {
    let ignore = false
    getMockupData().then(
      (result) => {
        if (ignore) return
        setData(result)
        setError(null)
      },
      () => {
        if (ignore) return
        setError("Couldn't load the review data — try refreshing the page.")
      },
    )
    return () => {
      ignore = true
    }
  }, [])

  // --- UI state ---
  const [filters, setFilters] = React.useState<Omit<MockupFilters, "scenario">>(
    () => {
      const defaults: Omit<MockupFilters, "scenario"> = {
        year: DEFAULT_FILTERS.year,
        division: DEFAULT_FILTERS.division,
        district: DEFAULT_FILTERS.district,
        subject: DEFAULT_FILTERS.subject,
        quarter: DEFAULT_FILTERS.quarter,
        grade: DEFAULT_FILTERS.grade,
        implLevel: DEFAULT_FILTERS.implLevel,
      }
      if (typeof window === "undefined") return defaults
      try {
        const raw = localStorage.getItem(FILTERS_KEY)
        return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
      } catch {
        return defaults
      }
    },
  )
  const [scenarios, setScenarios] = React.useState<Record<string, ScenarioId>>({})
  const [railOpen, setRailOpen] = React.useState(true)
  const [focus, setFocusState] = React.useState<string | null>(null)

  // persist filters (writing to an external system from an effect is fine)
  React.useEffect(() => {
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filters))
    } catch {
      // ignore
    }
  }, [filters])

  const setFilter = React.useCallback(
    (patch: Partial<Omit<MockupFilters, "scenario">>) =>
      setFilters((p) => ({ ...p, ...patch })),
    [],
  )
  const resetFilters = React.useCallback((viewId: string) => {
    setFilters({
      year: DEFAULT_FILTERS.year,
      division: DEFAULT_FILTERS.division,
      district: DEFAULT_FILTERS.district,
      subject: DEFAULT_FILTERS.subject,
      quarter: DEFAULT_FILTERS.quarter,
      grade: DEFAULT_FILTERS.grade,
      implLevel: DEFAULT_FILTERS.implLevel,
    })
    setScenarios((p) => ({ ...p, [viewId]: "asis" }))
  }, [])
  const scenarioFor = React.useCallback(
    (viewId: string): ScenarioId => scenarios[viewId] ?? "asis",
    [scenarios],
  )
  const setScenario = React.useCallback(
    (viewId: string, scenario: ScenarioId) =>
      setScenarios((p) => ({ ...p, [viewId]: scenario })),
    [],
  )
  const filtersForView = React.useCallback(
    (viewId: string): MockupFilters => ({
      ...filters,
      scenario: scenarios[viewId] ?? "asis",
    }),
    [filters, scenarios],
  )
  const toggleRail = React.useCallback(() => setRailOpen((o) => !o), [])
  const setFocus = React.useCallback(
    (elementNum: string | null) => setFocusState(elementNum),
    [],
  )

  const reviewerId =
    optimisticData?.reviewers.find((r) => r.name === reviewerName)?.id ?? null

  const value = React.useMemo<MockupContextValue>(
    () => ({
      data: optimisticData,
      error,
      refresh,
      mutate,
      reviewerId,
      reviewerName,
      filters,
      setFilter,
      resetFilters,
      scenarioFor,
      setScenario,
      filtersForView,
      railOpen,
      toggleRail,
      focus,
      setFocus,
    }),
    [
      optimisticData,
      error,
      refresh,
      mutate,
      reviewerId,
      reviewerName,
      filters,
      setFilter,
      resetFilters,
      scenarioFor,
      setScenario,
      filtersForView,
      railOpen,
      toggleRail,
      focus,
      setFocus,
    ],
  )

  return (
    <MockupContext.Provider value={value}>{children}</MockupContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Loading gate
// ---------------------------------------------------------------------------

export function MockupGate({
  children,
}: {
  children: (data: MockupData) => React.ReactNode
}) {
  const { data, error } = useMockup()
  if (error)
    return (
      <div
        style={{
          margin: "16px 17px",
          padding: "12px 14px",
          borderRadius: 9,
          border: "1px solid var(--mk-bad-fg)",
          background: "var(--mk-bad-bg)",
          color: "var(--mk-bad-fg)",
          fontSize: 13,
        }}
      >
        {error}
      </div>
    )
  if (!data)
    return (
      <div
        style={{
          padding: "40px 17px",
          fontSize: 13,
          color: "var(--mk-sec)",
        }}
      >
        Loading the review…
      </div>
    )
  return <>{children(data)}</>
}

// ---------------------------------------------------------------------------
// Derived selectors (pure helpers over MockupData)
// ---------------------------------------------------------------------------

export function answerFor(
  data: MockupData,
  reviewerId: string | null,
  viewId: string,
  elementNum: string,
): StructuredAnswer | undefined {
  if (!reviewerId) return undefined
  const row = data.answers.find(
    (a) =>
      a.reviewerId === reviewerId &&
      a.viewId === viewId &&
      a.elementNum === elementNum,
  )
  return row ? { verdict: row.verdict } : undefined
}

export function elementThread(
  data: MockupData,
  viewId: string,
  elementNum: string,
): MockupComment[] {
  return data.comments
    .filter(
      (c) =>
        c.scope === "element" &&
        c.viewId === viewId &&
        c.elementNum === elementNum,
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function threadResolved(
  data: MockupData,
  viewId: string,
  elementNum: string,
): boolean {
  return data.comments.some(
    (c) =>
      c.scope === "element" &&
      c.viewId === viewId &&
      c.elementNum === elementNum &&
      !c.parentId &&
      !!c.resolvedAt,
  )
}

export function pageFeedback(
  data: MockupData,
  viewId: string,
): MockupComment[] {
  return data.comments
    .filter((c) => c.scope === "page" && c.viewId === viewId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function overallFeedback(data: MockupData): MockupComment[] {
  return data.comments
    .filter((c) => c.scope === "overall")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function totalComments(data: MockupData): number {
  return data.comments.length
}

/** Elements this reviewer has given a verdict on. */
export function countReviewed(
  data: MockupData,
  reviewerId: string | null,
): number {
  if (!reviewerId) return 0
  return data.answers.filter(
    (a) => a.reviewerId === reviewerId && isReviewed({ verdict: a.verdict }),
  ).length
}

export { elementKey }
