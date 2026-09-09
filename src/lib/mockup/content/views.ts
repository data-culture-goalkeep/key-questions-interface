// The nine dashboard views plus the three reference pages, in tab-strip order.
// ids match the workbook (v1..v7 with v6a/v6b); reference pages are guide,
// coverage, log.

export type ViewKind = "view" | "ref"

export interface MockupView {
  id: string
  /** Tab-strip label. */
  label: string
  kind: ViewKind
  title: string
  purpose: string
  kqs: string[]
  /** false = no filter bar (reference pages). */
  filters: boolean
  /** Learning views expose the Subject filter. */
  subject?: boolean
  /** Last dashboard view — carries the overall-feedback card. */
  last?: boolean
  /** Sits in the Reference group at the right of the tab strip. */
  ref?: boolean
}

export const VIEWS: MockupView[] = [
  {
    id: "guide",
    label: "Guide",
    kind: "ref",
    title: "Dashboard Guide",
    purpose:
      "How this dashboard is structured, who each view is for, and how to use the filters.",
    kqs: [],
    filters: false,
  },
  {
    id: "v1",
    label: "1. Input & Reach",
    kind: "view",
    title: "Input & Reach",
    purpose:
      "Ensure reach numbers align with internal, government and funder data — and see where allocation is thin before the next quarter's plan is set.",
    kqs: ["KQ01", "KQ02", "KQ03", "KQ04", "KQ05"],
    filters: true,
  },
  {
    id: "v2",
    label: "2. Delivery & Quality",
    kind: "view",
    title: "Delivery & Quality",
    purpose:
      "Ensure our trainings are high quality and that most stakeholders complete them.",
    kqs: ["KQ06", "KQ07", "KQ08"],
    filters: true,
  },
  {
    id: "v3",
    label: "3. PAP Overview",
    kind: "view",
    title: "Priority Academic Processes — Overview",
    purpose:
      "Identify which priority academic processes are strongest or weakest across schools.",
    kqs: ["KQ10", "KQ11", "KQ12", "KQ13", "KQ15", "KQ16", "KQ17"],
    filters: true,
  },
  {
    id: "v4",
    label: "4. PAP Detail",
    kind: "view",
    title: "Priority Academic Processes — Detail",
    purpose:
      "Diagnose gaps within each academic process criterion, one process at a time.",
    kqs: ["KQ10", "KQ11", "KQ12", "KQ13", "KQ15", "KQ16", "KQ17"],
    filters: true,
  },
  {
    id: "v5",
    label: "5. Teacher Practice",
    kind: "view",
    title: "Teacher Practice",
    purpose:
      "Track classroom practice and student engagement, including differences by teacher gender.",
    kqs: ["KQ21", "KQ22"],
    filters: true,
  },
  {
    id: "v6a",
    label: "6a. Learning (Internal)",
    kind: "view",
    title: "Student Learning (Internal)",
    purpose:
      "Review current learning levels from the latest spot assessments, including grade comparisons within a selected subject.",
    kqs: ["KQ23"],
    filters: true,
    subject: true,
  },
  {
    id: "v6b",
    label: "6b. Learning (External)",
    kind: "view",
    title: "Student Learning (External)",
    purpose:
      "Review learning levels and change across evaluation rounds, including grade comparisons within a selected subject.",
    kqs: ["KQ23"],
    filters: true,
    subject: true,
  },
  {
    id: "v7",
    label: "7. Impact",
    kind: "view",
    title: "Impact",
    purpose:
      "Identify patterns consistent or inconsistent with the Theory of Change, and locate where the results chain may be breaking.",
    kqs: ["KQ24"],
    filters: true,
    last: true,
  },
  {
    id: "coverage",
    label: "Coverage check",
    kind: "ref",
    title: "KQ → chart coverage",
    purpose:
      "Which key questions the dashboard answers, with what, and how far the review has got.",
    kqs: [],
    filters: false,
    ref: true,
  },
  {
    id: "log",
    label: "Feedback log",
    kind: "ref",
    title: "Feedback log",
    purpose: "Every comment left on this mockup, grouped by view and element.",
    kqs: [],
    filters: false,
    ref: true,
  },
]

export const DASHBOARD_VIEWS = VIEWS.filter((v) => v.kind === "view")
export const FIRST_VIEW_ID = "v1"

export function viewById(id: string): MockupView | undefined {
  return VIEWS.find((v) => v.id === id)
}

export function usersFor(id: string): string {
  const map: Record<string, string> = {
    v1: "Programme Leadership, PMU",
    v2: "Programme Leadership, Training Team",
    v3: "Programme Leadership, District Leads",
    v4: "District Leads, PMU",
    v5: "District Leads, Training & Content Team",
    v6a: "Programme Leadership, District Leads",
    v6b: "Programme Leadership, Funders",
    v7: "Programme Leadership",
  }
  return map[id] || ""
}
