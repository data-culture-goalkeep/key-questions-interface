// Pure port of the design mockup's `buildCards()` — given a view id and the
// active filters, produce the sections/cards to render. No React, no styling:
// components in src/app/mockups/sandipani/_components render these shapes.
//
// Source of truth: docs/mockup-navigator/reference-implementation.js.

import {
  ALL_DISTRICTS,
  ALL_DIVISIONS,
  DISTRICTS,
  DIVISIONS,
  divisionIndex,
} from "./content/dimensions"
import { COLOR, LEVELS } from "./content/palette"
import {
  adjustRate,
  formatCount,
  scaleCount,
  type MockupFilters,
} from "./content/scenarios"

const { blue: BLUE, teal: TEAL, coral: CORAL, yellow: YEL, ink: INK } = COLOR

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
  rows: { label: string; values: number[] }[]
}

export interface NoteCard extends CardBase {
  type: "note"
  body: string
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
      opts.kind === "Action list"
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
    const teach = [
      [92, 64],
      [88, 61],
      [82, 73],
    ]
    const subj = ["English", "Hindi", "Mathematics"]
    return [
      {
        title: "Reach of key stakeholders",
        note: "Scorecards 1.1–1.5 · school leaders include MSHMs; do not add the two counts",
        grid: 5,
        cards: [
          this.score("1.1", "Schools reached", F(S(275)), {
            kq: "KQ01",
            sub: "Sandipani Vidyalayas",
          }),
          this.score("1.2", "Middle-grade students", F(S(247721)), {
            kq: "KQ02",
            splits: [
              { value: F(S(121626)), label: "Girls" },
              { value: F(S(121095)), label: "Boys" },
            ],
          }),
          this.score("1.3", "Middle-grade teachers", F(S(460)), {
            kq: "KQ03",
            splits: [
              { value: F(S(262)), label: "Female" },
              { value: F(S(198)), label: "Male" },
            ],
          }),
          this.score("1.4", "School leaders reached", F(S(275)), {
            kq: "KQ04",
            sub: "3–4 per school",
          }),
          this.score("1.5", "MSHMs reached", F(S(230)), {
            kq: "KQ04",
            sub: "One per school",
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
          {
            type: "bars",
            kind: "Grouped bar chart",
            num: "1.7",
            name: "Middle-grade teachers by subject and gender",
            kq: "KQ03",
            max: 100,
            legend: [
              { label: "Female", color: BLUE },
              { label: "Male", color: TEAL },
            ],
            groups: subj.map((s, i) => ({
              label: s,
              bars: [
                { value: S(teach[i][0]), color: BLUE },
                { value: S(teach[i][1]), color: TEAL },
              ],
            })),
          } as BarsCard,
        ] as MockupCard[],
      },
      {
        title: "Annual activity plan: quarterly target vs achieved",
        note: "State-level data · Division and District filters do not apply",
        grid: 3,
        cards: [
          this.columnChart("1.8", "School implementation", "KQ05", 300, [
            ["Q2", 275, 67],
            ["Q3", 275, 0],
          ]),
          this.columnChart("1.9", "State interventions", "KQ05", 20, [
            ["Q1", 17, 17],
            ["Q2", 15, 12],
          ]),
          this.columnChart("1.10", "Internal team activities", "KQ05", 12, [
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
            { kind: "Action list", kq: "KQ05", minWidth: "760px" },
          ),
        ] as MockupCard[],
      },
    ]
  }

  private columnChart(
    num: string,
    name: string,
    kq: string,
    max: number,
    groups: [string, number, number][],
  ): BarsCard {
    return {
      type: "bars",
      kind: "Grouped column chart",
      num,
      name,
      kq,
      max,
      legend: [
        { label: "Target", color: INK },
        { label: "Achieved", color: TEAL },
      ],
      groups: groups.map(([label, t, a]) => ({
        label,
        bars: [
          { value: t, color: INK },
          { value: a, color: TEAL },
        ],
      })),
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
        note: "School leaders include MSHMs; MSHMs are a subset and should not be added separately",
        grid: 6,
        cards: [
          this.score("2.1", "% School Leaders trained", A(78) + "%", { kq: "KQ07" }),
          this.score("2.2", "% MSHMs trained", A(73) + "%", { kq: "KQ07" }),
          this.score("2.3", "% Teachers trained", A(73) + "%", { kq: "KQ08" }),
          this.score("2.4", "School leaders trained", F(S(214)), { kq: "KQ07" }),
          this.score("2.5", "MSHMs trained", F(S(168)), { kq: "KQ07" }),
          this.score("2.6", "Teachers trained", F(S(336)), { kq: "KQ08" }),
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
          this.score("2.15", "Pre-test completed", A(86) + "%", { kq: "KQ06" }),
          this.score("2.16", "Post-test completed", A(74) + "%", { kq: "KQ06" }),
          this.score("2.17", "Both completed", A(70) + "%", { kq: "KQ06" }),
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
              pct("Pre-test"),
              pct("Post-test"),
              pct("Both"),
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
                "Participants = unique attendees; Both tests % = matched pre- and post-test records ÷ unique attendees —",
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
      "Academic Incharge",
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
            name: "Number of priority academic processes implemented",
            kq: "KQ10–KQ17",
            max: 60,
            percent: true,
            legend: [{ label: "% of schools", color: TEAL }],
            groups: [
              { label: "0 processes", bars: [{ value: 7, color: CORAL }] },
              { label: "1–3", bars: [{ value: 28, color: YEL }] },
              { label: "4–6", bars: [{ value: 49, color: TEAL }] },
              { label: "7 processes", bars: [{ value: 16, color: BLUE }] },
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
    return PAP.map((p) => ({
      title: p.name,
      note: "All data is for the latest School Visit record",
      grid:
        p.cards.length >= 4
          ? "repeat(auto-fit,minmax(200px,1fr))"
          : "repeat(auto-fit,minmax(240px,1fr))",
      cards: [
        ...p.cards.map((c) =>
          this.score(c.num, c.name, A(c.value, c.reverse) + "%", {
            kq: p.kq,
            sub: c.sub || undefined,
            reverse: !!c.reverse,
          }),
        ),
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
      ] as MockupCard[],
    }))
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
            ],
            this.rowsForDiv(d56),
            {
              kq: "KQ21",
              minWidth: "640px",
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
            ],
            this.f.district === ALL_DISTRICTS
              ? DISTRICTS.map((d, i) => [d, ...d57[i]])
              : [
                  [
                    this.f.district,
                    ...d57[Math.max(0, DISTRICTS.indexOf(this.f.district as never))],
                  ],
                ],
            {
              kq: "KQ21",
              minWidth: "600px",
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
            sub: "Observed classrooms where at least 75% of students are actively on task (definition TBD)",
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
    }[] = [
      {
        title:
          "Latest " + (ext ? "external" : "spot") + "-assessment headline results",
        note: ext ? undefined : "All data is for the latest Spot Assessment record",
        grid: 4,
        cards: [
          this.score(N + ".1", "Students assessed", F(S(ext ? 39240 : 42860)), {
            kq: "KQ23",
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
    ]
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
    const band = (
      num: string,
      label: string,
      n: number,
      rows: (string | number)[][],
    ) => ({
      title: label,
      grid: "1fr 2.4fr",
      cards: [
        this.score(num + "a", label + " schools (#)", String(S(n)), {
          kq: "KQ24",
          sub: "Schools in analysis",
        }),
        this.table(
          num + "b",
          label + ": teacher practice and learning",
          [
            { label: "Teacher practice" },
            { label: "Schools" },
            pct("English Dakshata+"),
            pct("Hindi Dakshata+"),
            pct("Maths Dakshata+"),
          ],
          rows,
          { kq: "KQ24", minWidth: "520px" },
        ),
      ] as MockupCard[],
    })
    return [
      {
        title: "Patterns across implementation, teacher practice and learning",
        note: "Latest School Visit record; cumulative CRO records",
        grid: 1,
        cards: [
          {
            type: "note",
            kind: "Note",
            num: "—",
            name: "Where the chain holds and where it breaks",
            kq: "",
            body: "Read down the three implementation bands. If the chain holds, strong teacher practice should carry higher learning outcomes within every band — and high implementation should beat low. Where a band shows strong practice but flat learning, the break is between practice and outcome, not between process and practice.",
          } as NoteCard,
        ] as MockupCard[],
      },
      band("8.1", "High-implementation", 47, [
        ["Strong", S(38), A(66), A(70), A(59)],
        ["Weak", S(9), A(49), A(54), A(42)],
      ]),
      band("8.2", "Medium-implementation", 55, [
        ["Strong", S(31), A(59), A(64), A(52)],
        ["Weak", S(24), A(44), A(49), A(37)],
      ]),
      band("8.3", "Low-implementation", 45, [
        ["Strong", S(12), A(51), A(56), A(44)],
        ["Weak", S(33), A(37), A(42), A(31)],
      ]),
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
            ],
            [
              ["CM RISE School Govindpura", "Bhopal", "High", "Strong", A(71), A(74), A(64)],
              ["Sandipani Vidyalaya Rau", "Indore", "High", "Strong", A(68), A(72), A(61)],
              ["Govt Excellence School Ujjain", "Ujjain", "High", "Strong", A(65), A(69), A(58)],
              ["CM RISE School Morar", "Gwalior", "High", "Developing", A(58), A(63), A(51)],
              ["Sandipani Vidyalaya Adhartal", "Jabalpur", "Medium", "Strong", A(60), A(65), A(54)],
              ["Govt HSS Makronia", "Sagar", "Medium", "Developing", A(53), A(58), A(46)],
              ["CM RISE School Rewa", "Rewa", "Medium", "Developing", A(51), A(56), A(44)],
              ["Sandipani Vidyalaya Sohagpur", "Narmadapuram", "Medium", "Weak", A(45), A(50), A(38)],
              ["Govt Excellence School Morena", "Morena", "Low", "Developing", A(43), A(48), A(36)],
              ["CM RISE School Shahdol", "Shahdol", "Low", "Weak", A(36), A(41), A(30)],
              ["Sandipani Vidyalaya Sehore", "Bhopal", "High", "Strong", A(67), A(71), A(60)],
              ["Govt Model HSS Dewas", "Ujjain", "Medium", "Strong", A(58), A(63), A(51)],
            ],
            {
              kq: "KQ24",
              minWidth: "860px",
              legend: "Outliers: ≥5pp vs peer average, % columns only —",
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
    key: "rc",
    name: "Remediation",
    kq: "KQ15",
    cards: [
      { num: "4.19", name: "All criteria met", value: 46, sub: "" },
      {
        num: "4.20",
        name: "Assessment evidence used",
        value: 67,
        sub: "Schools using assessment evidence to identify competencies requiring remediation",
      },
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
    cols: [
      "All criteria met",
      "Assessment evidence used",
      "Support matched to gaps",
      "None met",
    ],
    rev: [0, 0, 0, 1],
    rows: [
      [38, 64, 55, 22],
      [41, 67, 58, 7],
      [43, 69, 60, 10],
      [46, 72, 49, 12],
      [45, 71, 56, 12],
      [51, 59, 52, 17],
      [53, 62, 55, 20],
      [38, 64, 55, 22],
      [43, 69, 60, 10],
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

// ---------------------------------------------------------------------------
// Table conditional formatting
// ---------------------------------------------------------------------------

export type CellTone = "good" | "bad" | "none"

export interface FormattedCell {
  display: string
  tone: CellTone
  /** right-aligned + mono (every column except the first). */
  numeric: boolean
  emphasis: boolean
}

/**
 * Colour percentage cells against the column mean across visible rows.
 * Green ≥ threshold above, red ≥ threshold below; `reverse` columns invert.
 * Only colours when more than one row is visible.
 */
export function formatTableRows(
  head: TableColumn[],
  rows: (string | number)[][],
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
      const display =
        h?.percent && typeof v === "number"
          ? v + "%"
          : typeof v === "number"
            ? formatCount(v)
            : String(v)
      return { display, tone, numeric: ci !== 0, emphasis }
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

/** Stable element metadata, independent of filters (uses default filters). */
export function elementMeta(viewId: string, num: string) {
  const found = elementsForView(viewId, {
    year: "2025–26",
    division: ALL_DIVISIONS,
    district: "All Districts",
    subject: "All Subjects",
    scenario: "asis",
  }).find((e) => e.num === num)
  return found ?? { num, name: num, kind: "Table" as ChartKind, kq: "" }
}
