// Pure port of the design mockup's `buildCards()` — given a view id and the
// active filters, produce the sections/cards to render. No React, no styling:
// components in src/app/mockups/sandipani/_components render these shapes.
//
// Source of truth: docs/mockup-navigator/reference-implementation.js.

import {
  ALL_DISTRICTS,
  DISTRICTS,
  DIVISIONS,
  TOTAL_SCHOOLS,
  divisionIndex,
} from "./content/dimensions"
import { COLOR, LEVELS } from "./content/palette"
import {
  adjustRate,
  DEFAULT_FILTERS,
  formatCount,
  scaleCount,
  type MockupFilters,
} from "./content/scenarios"

const { blue: BLUE, teal: TEAL, coral: CORAL, yellow: YEL } = COLOR

// ---------------------------------------------------------------------------
// Card / section types
// ---------------------------------------------------------------------------

export type ChartKind =
  | "Scorecard"
  | "Table"
  | "Action list"
  | "Bar chart"
  | "Grouped bar chart"
  | "Grouped column chart"
  | "100% stacked bar chart"
  | "100% stacked column chart"
  | "Note"

interface CardBase {
  num: string
  name: string
  kind: ChartKind
  kq: string
  /** Span the whole section grid. */
  full?: boolean
}

export interface ScorecardCard extends CardBase {
  type: "scorecard"
  value: string
  reverse?: boolean
  splits?: { value: string; label: string }[]
  sub?: string
}

export interface TableColumn {
  label: string
  percent?: boolean
  reverse?: boolean
  threshold?: number
  /** Render cells as a (dummy) drill-through link to another dashboard. */
  link?: boolean
}

export interface TableCard extends CardBase {
  type: "table"
  head: TableColumn[]
  rows: (string | number)[][]
  minWidth: string
  legend?: string
  /**
   * Number of rows to size the card's fixed scroll area for — the *unfiltered*
   * count for division/district tables, so selecting a division (which drops
   * the table to one row) doesn't change the card's height.
   */
  rowsReserve?: number
  /**
   * RAG-colour a marker column from an achieved/target ratio per row
   * (green ≥90%, amber ≥50%, red below).
   */
  rag?: { valueCol: number; targetCol: number; markCol: number }
  /** Keep the given row order (don't sort by the first column). */
  unsorted?: boolean
}

export interface BarsCard extends CardBase {
  type: "bars"
  /** Rendered as columns (vertical) always; kind distinguishes for the chip. */
  max: number
  percent?: boolean
  legend: { label: string; color: string }[]
  groups: { label: string; bars: { value: number; color: string }[] }[]
}

export interface StackCard extends CardBase {
  type: "stack"
  note?: string
  /**
   * Custom stack series (legend label + colour). When absent the chart uses
   * the four learning levels — the design's original behaviour.
   */
  series?: { label: string; color: string }[]
  /** Per-row 100%-normalised segments; `abs` is the matching raw counts. */
  rows: { label: string; values: number[]; abs?: number[] }[]
}

export interface NoteCard extends CardBase {
  type: "note"
  body: string
  /** "warn" renders the note as a bold, underlined disclaimer banner. */
  tone?: "warn"
}

export type MockupCard =
  | ScorecardCard
  | TableCard
  | BarsCard
  | StackCard
  | NoteCard

export interface Section {
  title: string
  note?: string
  /** Resolved CSS grid-template-columns value. */
  grid: string
  cards: MockupCard[]
}

// ---------------------------------------------------------------------------
// Builder helpers (bound to a filter set)
// ---------------------------------------------------------------------------

function resolveGrid(grid: string | number): string {
  if (typeof grid === "number") {
    const min = grid >= 5 ? 168 : 212
    return `repeat(auto-fit,minmax(${min}px,1fr))`
  }
  return grid
}

class ViewBuilder {
  constructor(private f: MockupFilters) {}

  // Set by rowsForDiv/rowsForDistrict just before table() is called with their
  // result (argument evaluation runs first), so table() can record the
  // unfiltered row count for a constant card height.
  private _pendingReserve?: number

  private A = (v: number, reverse?: boolean | number) =>
    adjustRate(v, this.f, !!reverse)
  private S = (n: number) => scaleCount(n, this.f)
  private F = (n: number) => formatCount(n)

  private divIdx() {
    return divisionIndex(this.f.division)
  }

  private score(
    num: string,
    name: string,
    value: string,
    opts: Partial<ScorecardCard> = {},
  ): ScorecardCard {
    return { type: "scorecard", kind: "Scorecard", num, name, value, kq: "", ...opts }
  }

  private table(
    num: string,
    name: string,
    head: TableColumn[],
    rows: (string | number)[][],
    opts: Partial<TableCard> = {},
  ): TableCard {
    const reserve = opts.rowsReserve ?? this._pendingReserve ?? rows.length
    this._pendingReserve = undefined
    // Sort by the first column (division / district / name) unless it's a
    // curated ordered list.
    const sorted =
      opts.kind === "Action list" || opts.unsorted
        ? rows
        : [...rows].sort((a, b) =>
            String(a[0]).localeCompare(String(b[0]), undefined, {
              numeric: true,
            }),
          )
    return {
      type: "table",
      kind: "Table",
      num,
      name,
      head,
      kq: "",
      minWidth: "420px",
      ...opts,
      rows: sorted,
      rowsReserve: reserve,
    }
  }

  private pct(label: string, reverse?: boolean | number, threshold = 5): TableColumn {
    return { label, percent: true, reverse: !!reverse, threshold }
  }

  private get dcols(): TableColumn[] {
    return [{ label: "Division" }, { label: "Districts" }]
  }

  /** All 9 divisions (prefixed name + district count), or just the selected one. */
  private rowsForDiv(rows: number[][]): (string | number)[][] {
    this._pendingReserve = DIVISIONS.length
    const i = this.divIdx()
    return i < 0
      ? rows.map((r, j) => [DIVISIONS[j].name, DIVISIONS[j].districts, ...r])
      : [[DIVISIONS[i].name, DIVISIONS[i].districts, ...rows[i]]]
  }

  private rowsForDistrict(rows: number[][]): (string | number)[][] {
    this._pendingReserve = DISTRICTS.length
    if (this.f.district === ALL_DISTRICTS)
      return DISTRICTS.map((d, i) => [d, ...rows[i % rows.length]])
    const idx = Math.max(0, DISTRICTS.indexOf(this.f.district as never))
    return [[this.f.district, ...rows[idx % rows.length]]]
  }

  build(viewId: string): Section[] {
    const raw = this.sections(viewId)
    return raw.map((s) => ({
      title: s.title || "",
      note: s.note || undefined,
      grid: resolveGrid(s.grid),
      cards: s.cards,
    }))
  }

  private sections(
    v: string,
  ): { title: string; note?: string; grid: string | number; cards: MockupCard[] }[] {
    if (v === "v1") return this.v1()
    if (v === "v2") return this.v2()
    if (v === "v3") return this.v3()
    if (v === "v4") return this.v4()
    if (v === "v5") return this.v5()
    if (v === "v6a" || v === "v6b") return this.v6(v === "v6b")
    if (v === "v7") return this.v7()
    return []
  }

  // ----- View 1: Input & Reach -----
  private v1() {
    const { S, F } = this
    // Female / Male teacher counts by subject (for the 100% stacked 1.7).
    const teach = [
      [92, 64],
      [88, 61],
      [82, 73],
    ]
    const subj = ["English", "Hindi", "Mathematics"]
    return [
      {
        title: "Reach of key stakeholders",
        note: "Scorecards 1.1–1.5 · School Leader = Principal, Vice-Principal, PSHM and MSHM. MSHMs are a subset — do not add 1.4 and 1.5.",
        grid: 5,
        cards: [
          this.score("1.1", "Schools reached", F(S(275)), {
            kq: "KQ01",
            sub: "Sandipani Vidyalayas",
          }),
          this.score("1.2", "Middle-grade students", F(S(247721)), {
            kq: "KQ02",
            splits: [
              { value: F(S(121626)) + " (50%)", label: "Girls" },
              { value: F(S(121095)) + " (50%)", label: "Boys" },
            ],
            sub: "Updated once a year from the school MIS",
          }),
          this.score("1.3", "Middle-grade teachers", F(S(460)), {
            kq: "KQ03",
            splits: [
              { value: F(S(262)) + " (57%)", label: "Female" },
              { value: F(S(198)) + " (43%)", label: "Male" },
            ],
            sub: "Updated once a year from the school MIS",
          }),
          this.score("1.4", "School Leaders reached", F(S(275)), {
            kq: "KQ04",
            splits: [
              { value: F(S(96)) + " (35%)", label: "Female" },
              { value: F(S(179)) + " (65%)", label: "Male" },
            ],
            sub: "Target School Leaders across all SV-programme schools (3–4 per school)",
          }),
          this.score("1.5", "MSHMs reached", F(S(230)), {
            kq: "KQ04",
            splits: [
              { value: F(S(83)) + " (36%)", label: "Female" },
              { value: F(S(147)) + " (64%)", label: "Male" },
            ],
            sub: "MSHMs are a subset of School Leaders — one per school",
          }),
        ] as MockupCard[],
      },
      {
        title: "Reach by geography and subject",
        grid: "1.4fr 1fr",
        cards: [
          this.table(
            "1.6",
            "Stakeholder counts by division",
            [
              { label: "Division" },
              { label: "Schools" },
              { label: "Students" },
              { label: "Teachers" },
              { label: "SLs" },
              { label: "MSHMs" },
            ],
            (this.divIdx() < 0
              ? DIVISIONS
              : [DIVISIONS[this.divIdx()]]
            ).map((d) => [
              d.name,
              d.schools,
              d.students,
              d.teachers,
              d.schoolLeaders,
              d.mshms,
            ]),
            {
              kq: "KQ01–KQ04",
              minWidth: "440px",
              rowsReserve: DIVISIONS.length,
            },
          ),
          this.genderStack(
            "1.7",
            "Middle-grade teachers by subject and gender",
            "KQ03",
            subj.map((s, i) => [s, teach[i][0], teach[i][1]]),
          ),
        ] as MockupCard[],
      },
      {
        title: "Annual activity plan: quarterly progress",
        note: "State-level data · Division and District filters do not apply",
        grid: 3,
        cards: [
          this.progressStack("1.8", "School implementation", "KQ05", [
            ["Q2", 275, 67],
            ["Q3", 275, 0],
          ]),
          this.progressStack("1.9", "State interventions", "KQ05", [
            ["Q1", 17, 17],
            ["Q2", 15, 12],
          ]),
          this.progressStack("1.10", "Internal team activities", "KQ05", [
            ["Q1", 10, 3],
            ["Q2", 9, 4],
          ]),
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "1.11",
            "Activities requiring attention",
            [
              { label: "Quarter" },
              { label: "Category" },
              { label: "Planned activity" },
              { label: "Target" },
              { label: "Achieved" },
              { label: "Status" },
              { label: "Remarks" },
            ],
            [
              ["Q1", "Internal Team", "Monitoring Tool Creation", 2, 1, "Delayed", "—"],
              [
                "Q2",
                "School Implementation",
                "All Schools Visited in a quarter",
                275,
                67,
                "In Progress",
                "—",
              ],
              ["Q2", "State Intervention", "R&R", 12, 8, "In Progress", "—"],
              [
                "Q2",
                "Internal Team",
                "Monitoring Dashboard – Internal",
                1,
                0,
                "Yet to Start",
                "—",
              ],
              [
                "Q2",
                "Internal Team",
                "Monthly Adda Cadence",
                3,
                1,
                "In Progress",
                "Cancelled due to trainings",
              ],
              ["Q2", "Internal Team", "Friyay Cadence", 3, 2, "In Progress", "—"],
              [
                "Q2",
                "Internal Team",
                "Quarterly Review",
                1,
                0,
                "Yet to Start",
                "Yet to plan",
              ],
            ],
            {
              kind: "Action list",
              kq: "KQ05",
              minWidth: "760px",
              rag: { valueCol: 4, targetCol: 3, markCol: 5 },
              legend:
                "Status RAG: achieved vs target (green ≥90%, amber ≥50%, red below). Activities and targets are sourced from the annual calendar. —",
            },
          ),
        ] as MockupCard[],
      },
    ]
  }

  /** Female / Male share by category as a 100% stacked bar with counts. */
  private genderStack(
    num: string,
    name: string,
    kq: string,
    rows: (string | number)[][],
  ): StackCard {
    const { S } = this
    return {
      type: "stack",
      kind: "100% stacked bar chart",
      num,
      name,
      kq,
      series: [
        { label: "Female", color: BLUE },
        { label: "Male", color: TEAL },
      ],
      rows: rows.map(([label, f, m]) => {
        const fs = S(f as number)
        const ms = S(m as number)
        const t = fs + ms || 1
        const fp = Math.round((fs / t) * 100)
        return { label: String(label), values: [fp, 100 - fp], abs: [fs, ms] }
      }),
    }
  }

  /** Achieved vs remaining against target, as a 100% stacked bar with counts. */
  private progressStack(
    num: string,
    name: string,
    kq: string,
    rows: [string, number, number][],
  ): StackCard {
    return {
      type: "stack",
      kind: "100% stacked bar chart",
      num,
      name,
      kq,
      series: [
        { label: "Achieved", color: TEAL },
        { label: "Not yet", color: "#DAD7D4" },
      ],
      rows: rows.map(([label, target, achieved]) => {
        const t = target || 1
        const ap = Math.min(100, Math.round((achieved / t) * 100))
        return {
          label,
          values: [ap, 100 - ap],
          abs: [achieved, Math.max(0, target - achieved)],
        }
      }),
    }
  }

  // ----- View 2: Delivery & Quality -----
  private v2() {
    const { A, S, F } = this
    const pct = this.pct.bind(this)
    const dr = [
      [24, 72, 19, 66, 29, 67],
      [25, 75, 20, 69, 31, 70],
      [26, 77, 21, 71, 33, 72],
      [27, 80, 22, 74, 35, 75],
      [54, 81, 45, 74, 82, 76],
      [29, 72, 19, 79, 39, 67],
      [24, 75, 20, 66, 41, 70],
      [25, 77, 21, 69, 43, 72],
      [27, 82, 23, 74, 47, 77],
    ]
    const dtr = [
      [18, 69, 15, 63, 25, 64],
      [19, 72, 16, 66, 27, 67],
      [20, 74, 17, 68, 29, 69],
      [21, 77, 18, 71, 31, 72],
      [22, 79, 19, 73, 33, 74],
      [23, 82, 15, 76, 35, 77],
      [24, 69, 16, 63, 37, 64],
      [18, 72, 17, 66, 39, 67],
      [19, 74, 18, 68, 41, 69],
      [20, 77, 19, 71, 43, 72],
    ]
    return [
      {
        title: "Stakeholders completing training",
        note: "School Leader = Principal, Vice-Principal, PSHM and MSHM. MSHMs are a subset — do not add 2.1 and 2.2.",
        grid: 3,
        cards: [
          this.score("2.1", "School Leaders trained", A(78) + "%", {
            kq: "KQ07",
            sub: F(S(214)) + " of " + F(S(275)) + " (P/VP, PSHM and MSHM)",
          }),
          this.score("2.2", "MSHMs trained", A(73) + "%", {
            kq: "KQ07",
            sub: F(S(168)) + " of " + F(S(230)),
          }),
          this.score("2.3", "Teachers trained", A(73) + "%", {
            kq: "KQ08",
            sub: F(S(336)) + " of " + F(S(460)) + " (Grades 6–8, Hi/En/Ma)",
          }),
        ] as MockupCard[],
      },
      {
        title: "Training completion detail",
        grid: "1fr 1.4fr",
        cards: [
          {
            type: "bars",
            kind: "Grouped bar chart",
            num: "2.7",
            name: "Teacher training completion by subject and gender",
            kq: "KQ08",
            max: 100,
            percent: true,
            legend: [
              { label: "Female", color: BLUE },
              { label: "Male", color: TEAL },
            ],
            groups: [
              ["English", 76, 69],
              ["Hindi", 79, 72],
              ["Mathematics", 73, 66],
            ].map(([label, fem, male]) => ({
              label: label as string,
              bars: [
                { value: A(fem as number), color: BLUE },
                { value: A(male as number), color: TEAL },
              ],
            })),
          } as BarsCard,
          this.table(
            "2.8",
            "Training reach by division",
            [
              { label: "Division" },
              { label: "SL #" },
              pct("SL %"),
              { label: "MSHM #" },
              pct("MSHM %"),
              { label: "Teacher #" },
              pct("Teacher %"),
            ],
            this.rowsForDiv(dr).map((r) => [
              r[0],
              r[2],
              r[3],
              r[4],
              r[5],
              r[6],
              r[7],
            ]),
            {
              kq: "KQ07–KQ08",
              minWidth: "520px",
              legend: "Outliers: ≥5pp vs peer average, % columns only —",
            },
          ),
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "2.9",
            "Training reach by district",
            [
              { label: "District" },
              { label: "SL #" },
              pct("SL %"),
              { label: "MSHM #" },
              pct("MSHM %"),
              { label: "Teacher #" },
              pct("Teacher %"),
            ],
            this.f.district === ALL_DISTRICTS
              ? DISTRICTS.map((d, i) => [d, ...dtr[i]])
              : [
                  [
                    this.f.district,
                    ...dtr[Math.max(0, DISTRICTS.indexOf(this.f.district as never))],
                  ],
                ],
            {
              kq: "KQ07–KQ08",
              minWidth: "560px",
              legend: "Outliers: ≥5pp vs peer average, % columns only —",
              rowsReserve: DISTRICTS.length,
            },
          ),
        ] as MockupCard[],
      },
      {
        title: "Training quality",
        note: "State-level data · Division and District filters do not apply",
        grid: 5,
        cards: [
          this.score("2.10", "All criteria met", "47%", {
            kq: "KQ06",
            sub: "Facilitation quality, content usefulness and delivery usefulness all met",
          }),
          this.score("2.11", "No criteria met", "11%", {
            kq: "KQ06",
            sub: "None of the three criteria met",
            reverse: true,
          }),
          this.score("2.12", "Facilitation quality", "68%", {
            kq: "KQ06",
            sub: "Facilitator rated at Beginning Proficiency or higher",
          }),
          this.score("2.13", "Content usefulness", "74%", {
            kq: "KQ06",
            sub: ">50% of participants rated content 3 or higher",
          }),
          this.score("2.14", "Delivery usefulness", "69%", {
            kq: "KQ06",
            sub: ">50% of participants rated delivery 3 or higher",
          }),
        ] as MockupCard[],
      },
      {
        title: "Assessment participation",
        grid: "repeat(3, minmax(0, 1fr))",
        cards: [
          // 2.18 sits above the pre/post-test scorecards (review feedback).
          {
            type: "bars",
            kind: "Grouped bar chart",
            num: "2.18",
            name: "Training quality by stakeholder type",
            kq: "KQ06",
            full: true,
            max: 100,
            percent: true,
            legend: [
              { label: "All criteria", color: BLUE },
              { label: "Facilitation", color: TEAL },
              { label: "Content", color: CORAL },
              { label: "Delivery", color: YEL },
            ],
            groups: [
              ["Teachers", 49, 70, 76, 71],
              ["School Leaders", 46, 67, 73, 68],
              ["MSHMs", 52, 72, 78, 74],
            ].map((row) => ({
              label: row[0] as string,
              bars: [
                { value: row[1] as number, color: BLUE },
                { value: row[2] as number, color: TEAL },
                { value: row[3] as number, color: CORAL },
                { value: row[4] as number, color: YEL },
              ],
            })),
          } as BarsCard,
          this.score("2.15", "Pre-test completed", A(86) + "%", { kq: "KQ06" }),
          this.score("2.16", "Post-test completed", A(74) + "%", { kq: "KQ06" }),
          this.score("2.17", "Both completed", A(70) + "%", { kq: "KQ06" }),
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "2.19",
            "Training-level quality and assessment diagnostics",
            [
              { label: "Training" },
              { label: "Stakeholder" },
              { label: "Participants" },
              { label: "All met" },
              { label: "None met" },
              { label: "Facilitation" },
              { label: "Content" },
              { label: "Delivery" },
              pct("Pre-test completion"),
              pct("Post-test completion"),
              pct("Both completion"),
            ],
            [
              ["School Leader Induction", "School leaders", 46, "Yes", "No", "Yes", "Yes", "Yes", 93, 89, 85],
              ["MSHM Academic Leadership", "MSHMs", 38, "Yes", "No", "Yes", "Yes", "Yes", 95, 92, 89],
              ["English Pedagogy Workshop", "Teachers", 112, "No", "No", "Yes", "Yes", "No", 88, 82, 76],
              ["Hindi Pedagogy Workshop", "Teachers", 104, "Yes", "No", "Yes", "Yes", "Yes", 91, 87, 84],
              ["Mathematics Pedagogy Workshop", "Teachers", 108, "No", "Yes", "No", "Yes", "No", 84, 78, 72],
              ["CWT Refresher", "School leaders", 52, "Yes", "No", "Yes", "Yes", "Yes", 96, 94, 91],
              ["Assessment & Data Use", "MSHMs", 34, "No", "No", "Yes", "No", "Yes", 89, 81, 77],
              ["Remediation Planning", "Teachers", 96, "Yes", "No", "Yes", "Yes", "Yes", 90, 86, 82],
            ],
            {
              kq: "KQ06",
              minWidth: "1000px",
              legend:
                "Pre/post-test figures are completion rates, not scores. Participants = unique attendees; Both completion % = matched pre- and post-test records ÷ unique attendees —",
            },
          ),
        ] as MockupCard[],
      },
    ]
  }

  // ----- View 3: PAP Overview -----
  private v3() {
    const { A, S, F } = this
    const pct = this.pct.bind(this)
    const procs: [string, number, string][] = [
      ["Classroom Walkthroughs", 44, "KQ10"],
      ["Monthly Assessments", 58, "KQ11"],
      ["Learning-Level Tracking", 49, "KQ12"],
      ["Dakshata Classes", 56, "KQ13"],
      ["Remediation", 46, "KQ15"],
      ["Academic Inchargeship", 43, "KQ16"],
      ["Academic Samvaad", 61, "KQ17"],
    ]
    const d34 = [
      [38, 42, 45, 49, 52, 56, 59],
      [42, 45, 49, 52, 56, 59, 38],
      [45, 49, 52, 56, 59, 38, 42],
      [49, 52, 56, 59, 38, 42, 45],
      [48, 52, 55, 43, 47, 50, 45],
      [56, 59, 38, 42, 45, 49, 52],
      [59, 38, 42, 45, 49, 52, 56],
      [38, 42, 45, 49, 52, 56, 59],
      [45, 49, 52, 56, 59, 38, 42],
    ]
    const d35 = [
      [35, 38, 42, 45, 48, 52, 55],
      [42, 45, 48, 52, 55, 58, 35],
      [48, 52, 55, 58, 35, 38, 42],
      [55, 58, 35, 38, 42, 45, 48],
      [35, 38, 42, 45, 48, 52, 55],
      [42, 45, 48, 52, 55, 58, 35],
      [48, 52, 55, 58, 35, 38, 42],
      [55, 58, 35, 38, 42, 45, 48],
      [35, 38, 42, 45, 48, 52, 55],
      [42, 45, 48, 52, 55, 58, 35],
    ]
    const pcols = [
      "CWT",
      "Monthly Assess.",
      "Learning Tracking",
      "Dakshata",
      "Remediation",
      "Academic Inchargeship",
      "Academic Samvaad",
    ]
    return [
      {
        title: "School visit coverage",
        note: "All data is for the latest School Visit record",
        grid: "1fr 1fr 2fr",
        cards: [
          this.score("3.1a", "Schools observed at least once (%)", A(96) + "%", {
            kq: "KQ10–KQ17",
          }),
          this.score("3.1b", "Schools observed at least once (#)", F(S(264)), {
            kq: "KQ10–KQ17",
          }),
          {
            type: "note",
            kind: "Note",
            num: "—",
            name: "How to read this view",
            kq: "",
            body: "Each priority academic process is a composite: a school counts only where every criterion is met. Use 3.2 to see which process is weakest programme-wide, then 3.4 and 3.5 to find where it is weakest, then move to PAP Detail to see which criterion is failing.",
          } as NoteCard,
        ] as MockupCard[],
      },
      {
        title: "Implementation across the seven processes",
        grid: "1.3fr 1fr",
        cards: [
          {
            type: "bars",
            kind: "Bar chart",
            num: "3.2",
            name: "Schools meeting all criteria by priority academic process",
            kq: "KQ10–KQ17",
            max: 100,
            percent: true,
            legend: [{ label: "% schools meeting all criteria", color: BLUE }],
            groups: procs.map((p) => ({
              label: p[0],
              bars: [{ value: A(p[1]), color: BLUE }],
            })),
          } as BarsCard,
          {
            type: "bars",
            kind: "Bar chart",
            num: "3.3",
            name: "Priority-process implementation level",
            kq: "KQ10–KQ17",
            max: 60,
            percent: true,
            legend: [{ label: "% of schools", color: TEAL }],
            groups: [
              { label: "None", bars: [{ value: 7, color: CORAL }] },
              { label: "Low", bars: [{ value: 28, color: YEL }] },
              { label: "Medium", bars: [{ value: 49, color: TEAL }] },
              { label: "High", bars: [{ value: 16, color: BLUE }] },
            ],
          } as BarsCard,
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "3.4",
            "Priority process implementation by division",
            [...this.dcols, ...pcols.map((c) => pct(c))],
            this.rowsForDiv(d34),
            {
              kq: "KQ10–KQ17",
              minWidth: "860px",
              legend: "Percentages are calculated from schools, not districts —",
            },
          ),
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "3.5",
            "Priority process implementation by district",
            [{ label: "District" }, ...pcols.map((c) => pct(c))],
            this.f.district === ALL_DISTRICTS
              ? DISTRICTS.map((d, i) => [d, ...d35[i]])
              : [
                  [
                    this.f.district,
                    ...d35[Math.max(0, DISTRICTS.indexOf(this.f.district as never))],
                  ],
                ],
            {
              kq: "KQ10–KQ17",
              minWidth: "800px",
              legend: "Outliers: ≥5pp vs peer average —",
              rowsReserve: DISTRICTS.length,
            },
          ),
        ] as MockupCard[],
      },
    ]
  }

  // ----- View 4: PAP Detail -----
  private v4() {
    const { A } = this
    return PAP.map((p) => {
      // Criteria-level scorecards first (4.3–4.5 style), then a single
      // all / some / none summary, then the division table (review feedback).
      const allCard = p.cards.find((c) => /^all criteria met$/i.test(c.name))
      const noneCard = p.cards.find((c) => c.reverse)
      const criteria = p.cards.filter((c) => c !== allCard && c !== noneCard)
      const cards: MockupCard[] = criteria.map((c) =>
        this.score(c.num, c.name, A(c.value, c.reverse) + "%", {
          kq: p.kq,
          sub: c.sub || undefined,
          reverse: !!c.reverse,
        }),
      )
      if (allCard && noneCard) {
        const all = A(allCard.value)
        const none = A(noneCard.value, 1)
        const some = Math.max(0, 100 - all - none)
        cards.push({
          type: "stack",
          kind: "100% stacked bar chart",
          num: allCard.num,
          name: "Criteria met — all / some / none",
          kq: p.kq,
          full: true,
          series: [
            { label: "All criteria", color: TEAL },
            { label: "Some criteria", color: YEL },
            { label: "None", color: CORAL },
          ],
          rows: [{ label: "Schools", values: [all, some, none] }],
        } as StackCard)
      }
      cards.push(
        this.table(
          p.tableNum,
          p.tableName,
          [...this.dcols, ...p.cols.map((c, i) => this.pct(c, p.rev[i]))],
          this.rowsForDiv(p.rows),
          {
            kq: p.kq,
            minWidth: 220 + p.cols.length * 120 + "px",
            legend: "Outliers: ≥5pp vs peers; 'None met' reversed —",
            full: true,
          },
        ),
      )
      return {
        title: p.name,
        note: "All data is for the latest School Visit record",
        grid: "repeat(auto-fit,minmax(220px,1fr))",
        cards,
      }
    })
  }

  // ----- View 5: Teacher Practice -----
  private v5() {
    const { A, S, F } = this
    const pct = this.pct.bind(this)
    const d56 = [
      [94, 56, 48, 35],
      [102, 59, 51, 37],
      [109, 61, 53, 39],
      [116, 64, 56, 41],
      [271, 63, 57, 40],
      [129, 69, 49, 45],
      [136, 56, 51, 47],
      [143, 59, 53, 35],
      [148, 64, 58, 39],
    ]
    const d57 = [
      [95, 55, 47, 34],
      [102, 58, 50, 36],
      [109, 60, 52, 38],
      [116, 63, 55, 40],
      [123, 65, 57, 42],
      [130, 68, 47, 44],
      [137, 55, 50, 46],
      [144, 58, 52, 34],
      [151, 60, 55, 36],
      [158, 63, 57, 38],
    ]
    const d510 = [
      [51, 54, 53, 46],
      [54, 57, 55, 48],
      [56, 59, 58, 50],
      [59, 62, 60, 53],
      [58, 63, 60, 51],
      [64, 54, 65, 57],
      [51, 57, 53, 59],
      [54, 59, 55, 46],
      [59, 64, 60, 50],
    ]
    const d511 = [
      [49, 52, 51, 44],
      [51, 54, 54, 46],
      [54, 57, 56, 48],
      [56, 59, 59, 50],
      [58, 61, 61, 52],
      [61, 64, 51, 55],
      [63, 52, 54, 57],
      [49, 54, 56, 44],
      [51, 57, 59, 46],
      [54, 59, 61, 48],
    ]
    const practiceBars = (
      num: string,
      name: string,
      groups: [string, number, number, number][],
    ): BarsCard => ({
      type: "bars",
      kind: "Grouped bar chart",
      num,
      name,
      kq: "KQ21",
      max: 100,
      percent: true,
      legend: [
        { label: "Questioning", color: BLUE },
        { label: "Student practice", color: TEAL },
        { label: "Differentiation", color: CORAL },
      ],
      groups: groups.map(([label, q, sp, diff]) => ({
        label,
        bars: [
          { value: A(q), color: BLUE },
          { value: A(sp), color: TEAL },
          { value: A(diff), color: CORAL },
        ],
      })),
    })
    return [
      {
        title: "Priority teacher-practice implementation",
        grid: 4,
        cards: [
          this.score("5.1", "Classroom observations", F(S(1248)), { kq: "KQ21" }),
          this.score("5.2", "Effective questioning", A(62) + "%", { kq: "KQ21" }),
          this.score("5.3", "Student practice", A(54) + "%", { kq: "KQ21" }),
          this.score("5.4", "Differentiated instruction", A(41) + "%", { kq: "KQ21" }),
        ] as MockupCard[],
      },
      {
        title: "Practice by subject and by teacher gender",
        grid: "1fr 1fr",
        cards: [
          practiceBars("5.5", "Priority teacher practices by subject", [
            ["English (n=416)", 66, 58, 43],
            ["Hindi (n=403)", 63, 55, 41],
            ["Maths (n=429)", 57, 49, 38],
          ]),
          practiceBars("5.8", "Priority teacher practices by teacher gender", [
            ["Female (n=710)", 65, 57, 43],
            ["Male (n=538)", 59, 51, 38],
          ]),
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "5.6",
            "Priority teacher practices by division",
            [
              ...this.dcols,
              { label: "Classrooms" },
              pct("Questioning"),
              pct("Student practice"),
              pct("Differentiation"),
              pct("All practices"),
              pct("None of the practices", true),
            ],
            withAllNone(this.rowsForDiv(d56), 3),
            {
              kq: "KQ21",
              minWidth: "780px",
              legend: "Percentages are calculated from CROs, not districts —",
            },
          ),
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "5.7",
            "Priority teacher practices by district",
            [
              { label: "District" },
              { label: "Classrooms" },
              pct("Questioning"),
              pct("Student practice"),
              pct("Differentiation"),
              pct("All practices"),
              pct("None of the practices", true),
            ],
            withAllNone(
              this.f.district === ALL_DISTRICTS
                ? DISTRICTS.map((d, i) => [d, ...d57[i]])
                : [
                    [
                      this.f.district,
                      ...d57[
                        Math.max(0, DISTRICTS.indexOf(this.f.district as never))
                      ],
                    ],
                  ],
              2,
            ),
            {
              kq: "KQ21",
              minWidth: "740px",
              legend: "Outliers: ≥5pp vs peer average —",
              rowsReserve: DISTRICTS.length,
            },
          ),
        ] as MockupCard[],
      },
      {
        title: "Student engagement",
        grid: "1fr 2fr",
        cards: [
          this.score("5.9", "Strong student engagement", A(57) + "%", {
            kq: "KQ22",
            sub: "Observed classrooms where at least 50% of students are engaged on CFU and student practice",
          }),
          this.table(
            "5.12",
            "Student engagement by teacher gender and subject",
            [
              { label: "Teacher gender" },
              pct("Overall"),
              pct("English"),
              pct("Hindi"),
              pct("Mathematics"),
            ],
            [
              ["Female", A(60), A(63), A(62), A(55)],
              ["Male", A(53), A(56), A(56), A(48)],
            ],
            { kq: "KQ22", minWidth: "460px" },
          ),
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "5.10",
            "Student engagement by division",
            [
              ...this.dcols,
              pct("Overall"),
              pct("English"),
              pct("Hindi"),
              pct("Mathematics"),
            ],
            this.rowsForDiv(d510),
            {
              kq: "KQ22",
              minWidth: "620px",
              legend: "Outliers: ≥5pp vs peer average —",
            },
          ),
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "5.11",
            "Student engagement by district",
            [
              { label: "District" },
              pct("Overall"),
              pct("English"),
              pct("Hindi"),
              pct("Mathematics"),
            ],
            this.f.district === ALL_DISTRICTS
              ? DISTRICTS.map((d, i) => [d, ...d511[i]])
              : [
                  [
                    this.f.district,
                    ...d511[Math.max(0, DISTRICTS.indexOf(this.f.district as never))],
                  ],
                ],
            {
              kq: "KQ22",
              minWidth: "560px",
              legend: "Outliers: ≥5pp vs peer average —",
              rowsReserve: DISTRICTS.length,
            },
          ),
        ] as MockupCard[],
      },
    ]
  }

  // ----- Views 6a / 6b: Student Learning -----
  private v6(ext: boolean) {
    const { A, S, F } = this
    const N = ext ? "7" : "6"
    const bySub = ext
      ? [
          [21, 25, 33, 21],
          [18, 24, 34, 24],
          [27, 27, 29, 17],
        ]
      : [
          [18, 25, 34, 23],
          [15, 24, 35, 26],
          [23, 28, 31, 18],
        ]
    const byGrade = ext
      ? [
          [20, 25, 34, 21],
          [22, 26, 32, 20],
          [24, 25, 30, 21],
        ]
      : [
          [17, 26, 35, 22],
          [19, 26, 34, 21],
          [21, 26, 31, 22],
        ]
    const byGender = ext
      ? [
          [20, 24, 34, 22],
          [24, 27, 30, 19],
        ]
      : [
          [17, 25, 35, 23],
          [21, 27, 32, 20],
        ]
    const dtabInt = [
      [16, 24, 31, 29, 17, 26, 32, 25, 18, 24, 33, 25],
      [17, 25, 33, 25, 18, 27, 34, 21, 20, 25, 35, 20],
      [18, 26, 35, 21, 20, 24, 31, 25, 21, 26, 32, 21],
      [20, 27, 32, 21, 21, 25, 33, 21, 16, 27, 34, 23],
      [21, 24, 34, 21, 16, 26, 35, 23, 17, 24, 31, 28],
      [16, 25, 31, 28, 17, 27, 32, 24, 18, 25, 33, 24],
      [17, 26, 33, 24, 18, 24, 34, 24, 20, 26, 35, 19],
      [18, 27, 35, 20, 20, 25, 31, 24, 21, 27, 32, 20],
      [21, 25, 34, 20, 16, 27, 35, 22, 17, 25, 31, 27],
    ]
    const dtabExt = [
      [20, 24, 31, 25, 21, 26, 32, 21, 22, 24, 33, 21],
      [21, 25, 33, 21, 22, 27, 34, 17, 24, 25, 35, 16],
      [22, 26, 35, 17, 24, 24, 31, 21, 25, 26, 32, 17],
      [24, 27, 32, 17, 25, 25, 33, 17, 20, 27, 34, 19],
      [25, 24, 34, 17, 20, 26, 35, 19, 21, 24, 31, 24],
      [20, 25, 31, 24, 21, 27, 32, 20, 22, 25, 33, 20],
      [21, 26, 33, 20, 22, 24, 34, 20, 24, 26, 35, 15],
      [22, 27, 35, 16, 24, 25, 31, 20, 25, 27, 32, 16],
      [25, 25, 34, 16, 20, 27, 35, 18, 21, 25, 31, 23],
    ]
    const dtab = ext ? dtabExt : dtabInt
    const lvHead: TableColumn[] = []
    ;["English", "Hindi", "Mathematics"].forEach((s) =>
      LEVELS.forEach((l) =>
        lvHead.push(
          this.pct(
            s.slice(0, 3) +
              " · " +
              (l === "Below Dakshata"
                ? "Below"
                : l === "Grade Level"
                  ? "Grade"
                  : l),
            false,
            2,
          ),
        ),
      ),
    )
    const stack = (
      num: string,
      name: string,
      rows: { label: string; values: number[] }[],
      note?: string,
    ): StackCard => ({
      type: "stack",
      kind: "100% stacked bar chart",
      num,
      name,
      kq: "KQ23",
      note,
      rows,
    })

    const secs: {
      title: string
      note?: string
      grid: string | number
      cards: MockupCard[]
    }[] = []

    if (!ext)
      secs.push({
        title: "",
        grid: 1,
        cards: [
          {
            type: "note",
            kind: "Note",
            num: "—",
            name: "Read these results as indicative only",
            kq: "",
            tone: "warn",
            body: "THE RESULTS HERE ARE BASED ON ASSESSMENT OF ONLY A FEW / LIMITED NUMBER OF GRADE-LEVEL COMPETENCIES AND SHOULD BE READ AS ONLY INDICATIVE AND NOT CONCLUSIVE.",
          } as NoteCard,
        ] as MockupCard[],
      })

    secs.push(
      {
        title:
          "Latest " + (ext ? "external" : "spot") + "-assessment headline results",
        note: ext ? undefined : "All data is for the latest Spot Assessment record",
        grid: 4,
        cards: [
          this.score(N + ".1", "Students assessed", F(S(ext ? 39240 : 42860)), {
            kq: "KQ23",
            splits: [
              {
                value: F(S(ext ? 258 : 264)),
                label: "schools assessed",
              },
            ],
            sub: "Latest " + (ext ? "evaluation round" : "spot-assessment round"),
          }),
          this.score(N + ".2", "English at Dakshata+", A(ext ? 54 : 57) + "%", {
            kq: "KQ23",
            sub: "Dakshata and above",
          }),
          this.score(N + ".3", "Hindi at Dakshata+", A(ext ? 58 : 61) + "%", {
            kq: "KQ23",
            sub: "Dakshata and above",
          }),
          this.score(N + ".4", "Mathematics at Dakshata+", A(ext ? 46 : 49) + "%", {
            kq: "KQ23",
            sub: "Dakshata and above",
          }),
        ],
      },
      {
        title: "Learning-level distribution",
        grid: 3,
        cards: [
          stack(
            N + ".5",
            "Distribution by subject",
            ["English", "Hindi", "Mathematics"].map((s, i) => ({
              label: s,
              values: bySub[i],
            })),
          ),
          stack(
            N + ".6",
            "Distribution by grade",
            ["Grade 6", "Grade 7", "Grade 8"].map((s, i) => ({
              label: s,
              values: byGrade[i],
            })),
            this.f.subject === "All Subjects" ? "All subjects" : this.f.subject,
          ),
          stack(
            N + ".7",
            "Distribution by gender",
            ["Girls", "Boys"].map((s, i) => ({ label: s, values: byGender[i] })),
          ),
        ],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            N + ".8",
            "Learning levels by division",
            [{ label: "Division" }, ...lvHead],
            this.rowsForDiv(dtab).map((r) => [r[0], ...r.slice(2)]),
            {
              kq: "KQ23",
              minWidth: "1180px",
              legend:
                "Red/green: ≥2pp worse/better than peers; lower is better for Below Dakshata —",
            },
          ),
        ],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            N + ".9",
            "Learning levels by district",
            [{ label: "District" }, ...lvHead],
            DISTRICTS.map((d, i) => [d, ...dtab[i % dtab.length]]).filter(
              (r) =>
                this.f.district === ALL_DISTRICTS || r[0] === this.f.district,
            ),
            {
              kq: "KQ23",
              minWidth: "1180px",
              legend: "Red/green: ≥2pp worse/better than peers —",
              rowsReserve: DISTRICTS.length,
            },
          ),
        ],
      },
    )
    if (ext)
      secs.push({
        title: "Change across rounds",
        grid: "1fr",
        cards: [
          {
            type: "stack",
            kind: "100% stacked column chart",
            num: "7.10",
            name: "Learning-level distribution by academic year",
            kq: "KQ23",
            rows: [
              { label: "2023–24", values: [31, 28, 26, 15] },
              { label: "2024–25", values: [26, 27, 29, 18] },
              { label: "2025–26", values: [22, 25, 32, 21] },
            ],
          } as StackCard,
        ],
      })
    return secs
  }

  // ----- View 7: Impact -----
  private v7() {
    const { A, S } = this
    const pct = this.pct.bind(this)
    // Split each band into a teacher-practice table and a student-learning
    // table, with "Developing" as a third practice category, and call out the
    // number of schools assessed (review feedback on 8.1b).
    const band = (
      num: string,
      label: string,
      n: number,
      practice: [string, number][],
      learning: [string, number, number, number][],
    ) => {
      const assessed = Math.round(n * 0.92)
      const share = Math.round((n / TOTAL_SCHOOLS) * 100)
      return {
        title: label,
        note: `Assessment conducted in ${S(assessed)} of ${S(n)} schools in this band`,
        grid: "1fr 1.4fr 1.7fr",
        cards: [
          this.score(num + "a", label + " schools", String(S(n)), {
            kq: "KQ24",
            sub: `${share}% of ${S(TOTAL_SCHOOLS)} SV schools`,
          }),
          this.table(
            num + "b",
            label + ": teacher practice",
            [{ label: "Teacher practice" }, { label: "Schools" }],
            practice.map(([p, s]) => [p, S(s)]),
            { kq: "KQ24", minWidth: "260px", unsorted: true },
          ),
          this.table(
            num + "c",
            label + ": student learning",
            [
              { label: "Teacher practice" },
              pct("English Dakshata+"),
              pct("Hindi Dakshata+"),
              pct("Maths Dakshata+"),
            ],
            learning.map(([p, e, h, m]) => [p, A(e), A(h), A(m)]),
            { kq: "KQ24", minWidth: "420px", unsorted: true },
          ),
        ] as MockupCard[],
      }
    }
    const implBase = [52, 55, 58, 62, 51] // impl, practice, Eng, Hin, Maths
    return [
      {
        title: "Patterns across implementation, teacher practice and learning",
        note: "Latest School Visit record; cumulative CRO records",
        grid: "1fr 1fr",
        cards: [
          {
            type: "note",
            kind: "Note",
            num: "—",
            name: "How to read this view",
            kq: "",
            body: "Implementation = how fully a school runs the priority academic processes. Higher implementation is expected to lead to more teacher adoption of good practices, and then to better student learning. Read down the three bands: if the chain holds, stronger teacher practice carries higher learning within every band, and higher implementation beats lower. Where a band shows strong practice but flat learning, the break is between practice and outcome.",
          } as NoteCard,
          {
            type: "note",
            kind: "Note",
            num: "—",
            name: "What High / Medium / Low mean",
            kq: "",
            body: "Placeholder — final definitions to come from Purty. High = all priority academic processes in place with criteria strongly met. Medium = most processes in place, criteria partly met. Low = few processes in place or criteria weak. Teacher practice: Strong / Developing / Weak, where Developing means practices are emerging but not yet consistent.",
          } as NoteCard,
        ] as MockupCard[],
      },
      band(
        "8.1",
        "High-implementation",
        47,
        [
          ["Strong", 30],
          ["Developing", 11],
          ["Weak", 6],
        ],
        [
          ["Strong", 66, 70, 59],
          ["Developing", 57, 62, 50],
          ["Weak", 49, 54, 42],
        ],
      ),
      band(
        "8.2",
        "Medium-implementation",
        55,
        [
          ["Strong", 24],
          ["Developing", 18],
          ["Weak", 13],
        ],
        [
          ["Strong", 59, 64, 52],
          ["Developing", 51, 56, 44],
          ["Weak", 44, 49, 37],
        ],
      ),
      band(
        "8.3",
        "Low-implementation",
        45,
        [
          ["Strong", 10],
          ["Developing", 14],
          ["Weak", 21],
        ],
        [
          ["Strong", 51, 56, 44],
          ["Developing", 43, 48, 36],
          ["Weak", 37, 42, 31],
        ],
      ),
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "8.4",
            "School-level results-chain comparison",
            [
              { label: "School" },
              { label: "District" },
              { label: "Implementation" },
              { label: "Teacher practice" },
              pct("English"),
              pct("Hindi"),
              pct("Maths"),
              { label: "School page", link: true },
            ],
            [
              ["CM RISE School Govindpura", "Bhopal", "High", "Strong", A(71), A(74), A(64), "View →"],
              ["Sandipani Vidyalaya Rau", "Indore", "High", "Strong", A(68), A(72), A(61), "View →"],
              ["Govt Excellence School Ujjain", "Ujjain", "High", "Strong", A(65), A(69), A(58), "View →"],
              ["CM RISE School Morar", "Gwalior", "High", "Developing", A(58), A(63), A(51), "View →"],
              ["Sandipani Vidyalaya Adhartal", "Jabalpur", "Medium", "Strong", A(60), A(65), A(54), "View →"],
              ["Govt HSS Makronia", "Sagar", "Medium", "Developing", A(53), A(58), A(46), "View →"],
              ["CM RISE School Rewa", "Rewa", "Medium", "Developing", A(51), A(56), A(44), "View →"],
              ["Sandipani Vidyalaya Sohagpur", "Narmadapuram", "Medium", "Weak", A(45), A(50), A(38), "View →"],
              ["Govt Excellence School Morena", "Morena", "Low", "Developing", A(43), A(48), A(36), "View →"],
              ["CM RISE School Shahdol", "Shahdol", "Low", "Weak", A(36), A(41), A(30), "View →"],
              ["Sandipani Vidyalaya Sehore", "Bhopal", "High", "Strong", A(67), A(71), A(60), "View →"],
              ["Govt Model HSS Dewas", "Ujjain", "Medium", "Strong", A(58), A(63), A(51), "View →"],
            ],
            {
              kq: "KQ24",
              minWidth: "940px",
              legend:
                "Outliers: ≥5pp vs peer average, % columns only. School page links open the school-level view on the SVF dashboard. —",
            },
          ),
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "8.5",
            "Division-level results-chain comparison",
            [
              { label: "Division" },
              { label: "Schools" },
              pct("Avg implementation"),
              pct("Avg teacher practice"),
              pct("English"),
              pct("Hindi"),
              pct("Maths"),
            ],
            (this.divIdx() < 0
              ? DIVISIONS
              : [DIVISIONS[this.divIdx()]]
            ).map((d) => [
              d.name,
              d.schools,
              this.A(implBase[0]),
              this.A(implBase[1]),
              this.A(implBase[2]),
              this.A(implBase[3]),
              this.A(implBase[4]),
            ]),
            {
              kq: "KQ24",
              minWidth: "760px",
              legend: "Outliers: ≥5pp vs peer average —",
              rowsReserve: DIVISIONS.length,
            },
          ),
        ] as MockupCard[],
      },
      {
        title: "",
        grid: 1,
        cards: [
          this.table(
            "8.6",
            "High / Medium / Low school counts by division",
            [
              { label: "Division" },
              { label: "Schools" },
              { label: "High" },
              { label: "Medium" },
              { label: "Low" },
            ],
            (this.divIdx() < 0
              ? DIVISIONS
              : [DIVISIONS[this.divIdx()]]
            ).map((d) => {
              const high = Math.round(d.schools * 0.32)
              const med = Math.round(d.schools * 0.4)
              return [d.name, d.schools, high, med, d.schools - high - med]
            }),
            {
              kq: "KQ24",
              minWidth: "520px",
              rowsReserve: DIVISIONS.length,
            },
          ),
        ] as MockupCard[],
      },
    ]
  }
}

// ---------------------------------------------------------------------------
// View 4 process data (from reference `PAP`)
// ---------------------------------------------------------------------------

interface PapProcess {
  key: string
  name: string
  kq: string
  cards: { num: string; name: string; value: number; sub: string; reverse?: number }[]
  tableNum: string
  tableName: string
  cols: string[]
  rev: number[]
  rows: number[][]
}

const PAP: PapProcess[] = [
  {
    key: "cwt",
    name: "Classroom walkthroughs",
    kq: "KQ10",
    cards: [
      { num: "4.1", name: "All criteria met", value: 44, sub: "" },
      { num: "4.2", name: "None met", value: 12, sub: "", reverse: 1 },
      {
        num: "4.3",
        name: "Coverage & documentation",
        value: 72,
        sub: ">50% of middle-grade teachers observed by MSHMs in the last two months, and documented",
      },
      {
        num: "4.4",
        name: "Specific, actionable feedback",
        value: 61,
        sub: "Walkthrough feedback included specific observations and actionable suggestions",
      },
      {
        num: "4.5",
        name: "Teacher-reported feedback",
        value: 55,
        sub: "Interviewed teachers report receiving actionable feedback",
      },
    ],
    tableNum: "4.6",
    tableName: "Classroom walkthrough by division",
    cols: [
      "All criteria met",
      "Coverage & documentation",
      "Specific actionable feedback",
      "Teacher-reported feedback",
      "None met",
    ],
    rev: [0, 0, 0, 0, 1],
    rows: [
      [36, 69, 63, 62, 7],
      [39, 72, 66, 47, 9],
      [41, 74, 68, 50, 12],
      [44, 77, 53, 52, 14],
      [43, 76, 62, 52, 14],
      [49, 64, 58, 57, 19],
      [51, 67, 61, 60, 4],
      [36, 69, 63, 62, 7],
      [41, 74, 68, 50, 12],
    ],
  },
  {
    key: "ma",
    name: "Monthly assessments",
    kq: "KQ11",
    cards: [
      {
        num: "4.7",
        name: "Monthly assessment coverage",
        value: 76,
        sub: "Monthly assessments included Dakshata, Dakshata++, n-1 and Grade Level questions across all middle grades and all three subjects",
      },
    ],
    tableNum: "4.8",
    tableName: "Monthly assessment by division",
    cols: ["Monthly assessment coverage"],
    rev: [0],
    rows: [[73], [76], [78], [81], [80], [68], [71], [73], [78]],
  },
  {
    key: "llt",
    name: "Student learning-level tracking",
    kq: "KQ12",
    cards: [
      { num: "4.9", name: "All criteria met", value: 49, sub: "" },
      {
        num: "4.10",
        name: "Learning levels recorded",
        value: 69,
        sub: "Schools maintaining learning-level categories in school records",
      },
      {
        num: "4.11",
        name: "MSHM uses recent learning data",
        value: 57,
        sub: "MSHM knowledge of learning levels is based on recent assessment data",
      },
      { num: "4.12", name: "None met", value: 14, sub: "", reverse: 1 },
    ],
    tableNum: "4.13",
    tableName: "Learning tracking by division",
    cols: [
      "All criteria met",
      "Learning levels recorded",
      "MSHM uses recent data",
      "None met",
    ],
    rev: [0, 0, 0, 1],
    rows: [
      [41, 66, 59, 21],
      [44, 69, 62, 6],
      [46, 71, 64, 9],
      [49, 74, 49, 11],
      [48, 73, 56, 11],
      [54, 61, 54, 16],
      [56, 64, 57, 19],
      [41, 66, 59, 21],
      [46, 71, 64, 9],
    ],
  },
  {
    key: "dc",
    name: "Dakshata classes",
    kq: "KQ13",
    cards: [
      { num: "4.14", name: "All criteria met", value: 56, sub: "" },
      {
        num: "4.15",
        name: "Students needing support identified",
        value: 74,
        sub: "Schools continuously identifying students requiring Dakshata support after the baseline",
      },
      {
        num: "4.16",
        name: "Structured support mechanism in use",
        value: 63,
        sub: "Zero period, separate section, separate class or another documented mechanism",
      },
      { num: "4.17", name: "None met", value: 11, sub: "", reverse: 1 },
    ],
    tableNum: "4.18",
    tableName: "Dakshata classes by division",
    cols: [
      "All criteria met",
      "Students identified",
      "Structured mechanism",
      "None met",
    ],
    rev: [0, 0, 0, 1],
    rows: [
      [48, 71, 65, 18],
      [51, 74, 68, 3],
      [53, 76, 70, 6],
      [56, 79, 55, 8],
      [55, 78, 62, 8],
      [61, 66, 60, 13],
      [63, 69, 63, 16],
      [48, 71, 65, 18],
      [53, 76, 70, 6],
    ],
  },
  {
    // Remediation has a single indicator — no separate process indicators —
    // so the old "Assessment evidence used" criterion (4.20) is dropped
    // (review feedback).
    key: "rc",
    name: "Remediation",
    kq: "KQ15",
    cards: [
      { num: "4.19", name: "All criteria met", value: 46, sub: "" },
      {
        num: "4.21",
        name: "Support matched to learning gaps",
        value: 58,
        sub: "Schools grouping or supporting students differently according to identified gaps",
      },
      { num: "4.22", name: "None met", value: 16, sub: "", reverse: 1 },
    ],
    tableNum: "4.23",
    tableName: "Remedial support by division",
    cols: ["All criteria met", "Support matched to gaps", "None met"],
    rev: [0, 0, 1],
    rows: [
      [38, 55, 22],
      [41, 58, 7],
      [43, 60, 10],
      [46, 49, 12],
      [45, 56, 12],
      [51, 52, 17],
      [53, 55, 20],
      [38, 55, 22],
      [43, 60, 10],
    ],
  },
  {
    key: "ai",
    name: "Academic Inchargeship",
    kq: "KQ16",
    cards: [
      { num: "4.24", name: "All criteria met", value: 43, sub: "" },
      { num: "4.25", name: "None met", value: 13, sub: "", reverse: 1 },
      {
        num: "4.26",
        name: "MSHM leads academic monitoring",
        value: 77,
        sub: "MSHM manages academic monitoring for middle grades",
      },
      {
        num: "4.27",
        name: "Middle-grade priorities documented",
        value: 59,
        sub: "Middle-grade priorities documented in school goals or plans",
      },
      {
        num: "4.28",
        name: "P/VP provides consistent support",
        value: 51,
        sub: "P/VP consistently supports the MSHM or designated academic lead",
      },
    ],
    tableNum: "4.29",
    tableName: "Academic inchargeship by division",
    cols: [
      "All criteria met",
      "MSHM leads monitoring",
      "Priorities documented",
      "P/VP support",
      "None met",
    ],
    rev: [0, 0, 0, 0, 1],
    rows: [
      [41, 76, 60, 51, 12],
      [45, 80, 64, 49, 10],
      [47, 82, 66, 53, 9],
      [44, 78, 57, 50, 14],
      [46, 81, 62, 52, 11],
      [50, 73, 58, 56, 17],
      [52, 75, 61, 58, 8],
      [42, 77, 59, 50, 13],
      [48, 83, 65, 54, 9],
    ],
  },
  {
    key: "as",
    name: "Academic Samvaad",
    kq: "KQ17",
    cards: [
      {
        num: "4.30",
        name: "Relevant Academic Samvaad",
        value: 79,
        sub: "Academic Samvaad conducted or documented within the last 1–2 months with middle-grade priorities",
      },
    ],
    tableNum: "4.31",
    tableName: "Academic Samvaad by division",
    cols: ["Academic Samvaad implemented"],
    rev: [0],
    rows: [[76], [79], [81], [84], [80], [86], [74], [76], [81]],
  },
]

/**
 * Append "% all practices" and "% none of the practices" columns, derived from
 * the three practice-rate columns starting at `startIdx` (review feedback on
 * 5.6 / 5.7). Deterministic, invented like the rest of the mock data.
 */
function withAllNone(
  rows: (string | number)[][],
  startIdx: number,
): (string | number)[][] {
  return rows.map((r) => {
    const vals = [r[startIdx], r[startIdx + 1], r[startIdx + 2]].map(Number)
    const avg = vals.reduce((a, b) => a + b, 0) / 3
    const all = Math.max(1, Math.min(99, Math.round(avg * 0.5)))
    const none = Math.max(1, Math.min(99, Math.round((100 - avg) * 0.28)))
    return [...r, all, none]
  })
}

// ---------------------------------------------------------------------------
// Table conditional formatting
// ---------------------------------------------------------------------------

export type CellTone = "good" | "warn" | "bad" | "none"

export interface FormattedCell {
  display: string
  tone: CellTone
  /** right-aligned + mono (every column except the first). */
  numeric: boolean
  emphasis: boolean
  /** Render as a dummy drill-through link. */
  link?: boolean
}

/**
 * Colour percentage cells against the column mean across visible rows.
 * Green ≥ threshold above, red ≥ threshold below; `reverse` columns invert.
 * Only colours when more than one row is visible.
 *
 * On top of the peer comparison: any non-reversed percentage ≥ 70% shows
 * green (the dashboard-wide status threshold). An optional `rag` marker
 * column is coloured green/amber/red by an achieved ÷ target ratio.
 */
export function formatTableRows(
  head: TableColumn[],
  rows: (string | number)[][],
  rag?: TableCard["rag"],
): FormattedCell[][] {
  const means = head.map((h, ci) => {
    if (!h.percent) return null
    const vals = rows
      .map((r) => r[ci])
      .filter((v): v is number => typeof v === "number")
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  })

  return rows.map((r) =>
    r.map((v, ci) => {
      const h = head[ci]
      let tone: CellTone = "none"
      let emphasis = false
      if (
        h?.percent &&
        typeof v === "number" &&
        means[ci] !== null &&
        rows.length > 1
      ) {
        const d = v - (means[ci] as number)
        const thr = h.threshold ?? 5
        const worse = h.reverse ? d > 0 : d < 0
        const better = h.reverse ? d < 0 : d > 0
        if (Math.abs(d) >= thr && worse) {
          tone = "bad"
          emphasis = true
        } else if (Math.abs(d) >= thr && better) {
          tone = "good"
          emphasis = true
        }
      }
      // Dashboard-wide rule: ≥70% is green.
      if (h?.percent && typeof v === "number" && !h.reverse && v >= 70) {
        tone = "good"
        emphasis = true
      }
      // RAG marker column, coloured from achieved ÷ target.
      if (rag && ci === rag.markCol) {
        const val = Number(r[rag.valueCol])
        const tgt = Number(r[rag.targetCol])
        if (Number.isFinite(val) && Number.isFinite(tgt) && tgt > 0) {
          const ratio = val / tgt
          tone = ratio >= 0.9 ? "good" : ratio >= 0.5 ? "warn" : "bad"
          emphasis = true
        }
      }
      const display =
        h?.percent && typeof v === "number"
          ? v + "%"
          : typeof v === "number"
            ? formatCount(v)
            : String(v)
      return {
        display,
        tone,
        numeric: ci !== 0 && !h?.link,
        emphasis,
        link: h?.link,
      }
    }),
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function buildView(viewId: string, filters: MockupFilters): Section[] {
  return new ViewBuilder(filters).build(viewId)
}

/** Element inventory for a view (excludes Note cards with num "—"). */
export function elementsForView(
  viewId: string,
  filters: MockupFilters,
): { num: string; name: string; kind: ChartKind; kq: string }[] {
  const out: { num: string; name: string; kind: ChartKind; kq: string }[] = []
  for (const s of buildView(viewId, filters))
    for (const c of s.cards)
      if (c.num !== "—")
        out.push({ num: c.num, name: c.name, kind: c.kind, kq: c.kq })
  return out
}

/** Total reviewable elements across the seven dashboard views. */
export function totalElements(): number {
  return ["v1", "v2", "v3", "v4", "v5", "v6a", "v6b", "v7"].reduce(
    (a, v) => a + elementsForView(v, DEFAULT_FILTERS).length,
    0,
  )
}

/** Stable element metadata, independent of filters (uses default filters). */
export function elementMeta(viewId: string, num: string) {
  const found = elementsForView(viewId, DEFAULT_FILTERS).find(
    (e) => e.num === num,
  )
  return found ?? { num, name: num, kind: "Table" as ChartKind, kq: "" }
}
