const INK = "#313032",
  SEC = "#5B6472",
  BOR = "#E8E6E6",
  BLUE = "#17479E",
  TEAL = "#81C2B2",
  CORAL = "#EA9D93",
  YEL = "#E9E626",
  MUT = "#9AA1AC";
const GOOD_BG = "#E7F2EE",
  GOOD_FG = "#2F6B5B",
  BAD_BG = "#FBEEEC",
  BAD_FG = "#B4564A";
const RAMP = [CORAL, YEL, TEAL, BLUE];
const LEVELS = ["Below Dakshata", "Dakshata", "Dakshata++", "Grade Level"];
const MONO = "'IBM Plex Mono',monospace";

const DIV = [
  ["Bhopal", 5, 34, 30820, 55, 34, 29],
  ["Indore", 8, 31, 28540, 52, 31, 26],
  ["Ujjain", 7, 28, 24910, 47, 28, 23],
  ["Jabalpur", 8, 33, 29880, 56, 33, 28],
  ["Gwalior", 8, 47, 43841, 83, 47, 40],
  ["Sagar", 6, 30, 26950, 49, 30, 25],
  ["Rewa", 6, 26, 22860, 43, 26, 21],
  ["Narmadapuram", 3, 24, 21180, 39, 24, 20],
  ["Shahdol", 3, 22, 18740, 36, 22, 18],
];
const DISTRICTS = [
  "Betul",
  "Dewas",
  "Dhar",
  "Harda",
  "Mandsaur",
  "Neemuch",
  "Raisen",
  "Ratlam",
  "Sehore",
  "Vidisha",
];
const GROUPS = [
  ["Group 1", ["Kanishka", "Shil", "Ashish"], "1. Input & Reach · 7. Impact"],
  [
    "Group 2",
    ["Jay", "Sharmishta", "Surya"],
    "6a. Learning (Internal) · 6b. Learning (External)",
  ],
  ["Group 3", ["Manju", "Ambika", "Purty"], "3. PAP Overview · 4. PAP Detail"],
  [
    "Group 4",
    ["Anisha", "Ramesh", "Shashwat"],
    "2. Delivery & Quality · 5. Teacher Practice",
  ],
];

const KQ = {
  KQ01: [
    "How many Sandipani schools are covered?",
    "Check right allocation and reach · report numbers to funders · decide direct vs indirect reach",
  ],
  KQ02: [
    "How many students in Grades 6–8 are covered? (by gender)",
    "Check right allocation and reach · report numbers to funders · decide direct vs indirect reach",
  ],
  KQ03: [
    "How many middle-grade teachers are supported through the Peepul-Sandipani programme? (by gender & subject)",
    "Check right allocation and reach · report numbers to funders · decide direct vs indirect reach",
  ],
  KQ04: [
    "How many School Leaders and MSHMs are covered?",
    "Check allocation against MSHMs as the key coaching lever",
  ],
  KQ05: [
    "Which activities are off track or delayed against the annual programme plan at each quarter?",
    "Take District Leads to task · identify risks and bottlenecks · understand the capacity needed to implement",
  ],
  KQ06: [
    "How is the quality of Sandipani training sessions for SLs, MSHMs and teachers?",
    "Build internal capacity · strategise on content and delivery from participant feedback",
  ],
  KQ07: [
    "What proportion of School Leaders and MSHMs completed trainings?",
    "Design support for absentees · diagnose reasons · refine selection for trainings",
  ],
  KQ08: [
    "What proportion of relevant teachers completed planned trainings, by subject? (by gender)",
    "Design support for absentees · diagnose reasons · refine selection for trainings",
  ],
  KQ10: [
    "What proportion of schools implement classroom walkthroughs with sufficient coverage, documentation and actionable feedback?",
    "Targeted coaching of MSHMs · priority visits and VCs in concerning schools · involve officials · recognise strong schools",
  ],
  KQ11: [
    "What proportion of schools conduct and analyse monthly assessments to understand Dakshata and other learning levels?",
    "Coaching for low-performing schools · provide question banks · recognise strong schools",
  ],
  KQ12: [
    "What proportion of schools have an institutionalised system to track student learning levels?",
    "Share school-level trackers · demos for low performers · drive SL-data conversations at every touchpoint",
  ],
  KQ13: [
    "What proportion of schools conduct Dakshata classes consistently?",
    "Shapes training pitch for MSHMs and teachers · coach DLs on feedback · district refreshers",
  ],
  KQ15: [
    "What proportion of schools conduct remediation consistently, however it is delivered?",
    "Create assessment resources mapped to competencies · check whether schools have set up differentiated support",
  ],
  KQ16: [
    "What proportion of schools have an effective Academic Inchargeship in place?",
    "Training for MSHMs and P/VPs · influence state circulars on MSHM roles · strengthen follow-up · shape visit SoP",
  ],
  KQ17: [
    "What proportion of schools conduct Academic Samvaad relevant to middle-grade learning levels?",
    "Influence state circulars to include middle grades · shape DL follow-up for a division or school group",
  ],
  KQ21: [
    "What proportion of observed regular classes demonstrate priority teacher practices — questioning, student practice and differentiated instruction — by subject?",
    "Subject-specific resources for teachers · shape teacher training and refreshers · shape DL follow-up and CRO SoP",
  ],
  KQ22: [
    "What proportion of observed classes demonstrate strong student engagement, by subject? (by teacher gender)",
    "Understand which practices drive engagement · diagnose low engagement against training data",
  ],
  KQ23: [
    "What is the distribution of students across below Dakshata, Dakshata, Dakshata++, n-1 and Grade Level in internal and external assessments?",
    "Share strategies with teachers · re-think effort distribution across levels · show data to SLs, government and funders",
  ],
  KQ24: [
    "How do schools compare across priority academic-process implementation, teacher practice and student learning?",
    "Revisit ToC elements and assumptions · diagnose further where the chain is breaking",
  ],
};

const SCEN = {
  asis: ["Programme as-is", null],
  hold: [
    "Chain holding",
    "Districts where the results chain holds: process implementation, teacher practice and learning move together in the same direction.",
  ],
  break: [
    "Chain breaking",
    "A struggling picture: processes are recorded as done, but teacher practice and student learning do not follow — the chain breaks between output and outcome.",
  ],
};

const VIEWS = [
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
  },
  {
    id: "v2",
    label: "2. Delivery & Quality",
    kind: "view",
    title: "Delivery & Quality",
    purpose:
      "Ensure our trainings are high quality and that most stakeholders complete them.",
    kqs: ["KQ06", "KQ07", "KQ08"],
  },
  {
    id: "v3",
    label: "3. PAP Overview",
    kind: "view",
    title: "Priority Academic Processes — Overview",
    purpose:
      "Identify which priority academic processes are strongest or weakest across schools.",
    kqs: ["KQ10", "KQ11", "KQ12", "KQ13", "KQ15", "KQ16", "KQ17"],
  },
  {
    id: "v4",
    label: "4. PAP Detail",
    kind: "view",
    title: "Priority Academic Processes — Detail",
    purpose:
      "Diagnose gaps within each academic process criterion, one process at a time.",
    kqs: ["KQ10", "KQ11", "KQ12", "KQ13", "KQ15", "KQ16", "KQ17"],
  },
  {
    id: "v5",
    label: "5. Teacher Practice",
    kind: "view",
    title: "Teacher Practice",
    purpose:
      "Track classroom practice and student engagement, including differences by teacher gender.",
    kqs: ["KQ21", "KQ22"],
  },
  {
    id: "v6a",
    label: "6a. Learning (Internal)",
    kind: "view",
    title: "Student Learning (Internal)",
    purpose:
      "Review current learning levels from the latest spot assessments, including grade comparisons within a selected subject.",
    kqs: ["KQ23"],
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
];

const PAP = [
  {
    k: "cwt",
    t: "Classroom walkthroughs",
    kq: "KQ10",
    cards: [
      ["4.1", "All criteria met", 44, ""],
      ["4.2", "None met", 12, "", 1],
      [
        "4.3",
        "Coverage & documentation",
        72,
        ">50% of middle-grade teachers observed by MSHMs in the last two months, and documented",
      ],
      [
        "4.4",
        "Specific, actionable feedback",
        61,
        "Walkthrough feedback included specific observations and actionable suggestions",
      ],
      [
        "4.5",
        "Teacher-reported feedback",
        55,
        "Interviewed teachers report receiving actionable feedback",
      ],
    ],
    tn: "4.6",
    tname: "Classroom walkthrough by division",
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
    k: "ma",
    t: "Monthly assessments",
    kq: "KQ11",
    cards: [
      [
        "4.7",
        "Monthly assessment coverage",
        76,
        "Monthly assessments included Dakshata, Dakshata++, n-1 and Grade Level questions across all middle grades and all three subjects",
      ],
    ],
    tn: "4.8",
    tname: "Monthly assessment by division",
    cols: ["Monthly assessment coverage"],
    rev: [0],
    rows: [[73], [76], [78], [81], [80], [68], [71], [73], [78]],
  },
  {
    k: "llt",
    t: "Student learning-level tracking",
    kq: "KQ12",
    cards: [
      ["4.9", "All criteria met", 49, ""],
      [
        "4.10",
        "Learning levels recorded",
        69,
        "Schools maintaining learning-level categories in school records",
      ],
      [
        "4.11",
        "MSHM uses recent learning data",
        57,
        "MSHM knowledge of learning levels is based on recent assessment data",
      ],
      ["4.12", "None met", 14, "", 1],
    ],
    tn: "4.13",
    tname: "Learning tracking by division",
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
    k: "dc",
    t: "Dakshata classes",
    kq: "KQ13",
    cards: [
      ["4.14", "All criteria met", 56, ""],
      [
        "4.15",
        "Students needing support identified",
        74,
        "Schools continuously identifying students requiring Dakshata support after the baseline",
      ],
      [
        "4.16",
        "Structured support mechanism in use",
        63,
        "Zero period, separate section, separate class or another documented mechanism",
      ],
      ["4.17", "None met", 11, "", 1],
    ],
    tn: "4.18",
    tname: "Dakshata classes by division",
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
    k: "rc",
    t: "Remediation",
    kq: "KQ15",
    cards: [
      ["4.19", "All criteria met", 46, ""],
      [
        "4.20",
        "Assessment evidence used",
        67,
        "Schools using assessment evidence to identify competencies requiring remediation",
      ],
      [
        "4.21",
        "Support matched to learning gaps",
        58,
        "Schools grouping or supporting students differently according to identified gaps",
      ],
      ["4.22", "None met", 16, "", 1],
    ],
    tn: "4.23",
    tname: "Remedial support by division",
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
    k: "ai",
    t: "Academic Inchargeship",
    kq: "KQ16",
    cards: [
      ["4.24", "All criteria met", 43, ""],
      ["4.25", "None met", 13, "", 1],
      [
        "4.26",
        "MSHM leads academic monitoring",
        77,
        "MSHM manages academic monitoring for middle grades",
      ],
      [
        "4.27",
        "Middle-grade priorities documented",
        59,
        "Middle-grade priorities documented in school goals or plans",
      ],
      [
        "4.28",
        "P/VP provides consistent support",
        51,
        "P/VP consistently supports the MSHM or designated academic lead",
      ],
    ],
    tn: "4.29",
    tname: "Academic inchargeship by division",
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
    k: "as",
    t: "Academic Samvaad",
    kq: "KQ17",
    cards: [
      [
        "4.30",
        "Relevant Academic Samvaad",
        79,
        "Academic Samvaad conducted or documented within the last 1–2 months with middle-grade priorities",
      ],
    ],
    tn: "4.31",
    tname: "Academic Samvaad by division",
    cols: ["Academic Samvaad implemented"],
    rev: [0],
    rows: [[76], [79], [81], [84], [80], [86], [74], [76], [81]],
  },
];

class Component extends DCLogic {
  state = {
    page: "brief",
    reviewer: null,
    pending: null,
    year: "2025–26",
    division: "All Divisions",
    district: "All Districts",
    subject: "All Subjects",
    scenarios: {},
    focus: null,
    comments: {},
    answers: {},
    resolved: {},
    drafts: {},
    replyTo: null,
    pageDraft: "",
    pageConf: 0,
    pageFb: {},
    overallDraft: "",
    overallConf: 0,
    overall: [],
    logReviewer: "All reviewers",
    needsDecision: false,
    showResolved: false,
    copied: false,
  };

  componentDidMount() {
    try {
      const raw = localStorage.getItem("sandipani-review-v1");
      if (raw) {
        const s = JSON.parse(raw);
        this.setState((p) => ({
          ...p,
          ...s,
          page: s.reviewer ? "v1" : "brief",
          focus: null,
          drafts: {},
          replyTo: null,
          copied: false,
        }));
      } else this.setState({ comments: this.seed() });
    } catch (e) {
      this.setState({ comments: this.seed() });
    }
  }
  seed() {
    const t = Date.now() - 2 * 864e5;
    return {
      "v1:1.3": [
        {
          id: "seed1",
          author: "Shil",
          text: "Subject split is in KQ03 but not on this card — we can't tell whether Maths teacher coverage is the gap without leaving the view.",
          ts: t,
          example: true,
        },
        {
          id: "seed2",
          author: "Ashish",
          text: "Agreed. 1.7 covers it, but it should sit next to the scorecard rather than below the table.",
          ts: t + 864e5,
          parent: "seed1",
        },
      ],
    };
  }
  persist(patch) {
    this.setState((p) => {
      const n = { ...p, ...patch };
      try {
        localStorage.setItem(
          "sandipani-review-v1",
          JSON.stringify({
            reviewer: n.reviewer,
            year: n.year,
            division: n.division,
            district: n.district,
            subject: n.subject,
            scenarios: n.scenarios,
            comments: n.comments,
            answers: n.answers,
            resolved: n.resolved,
            pageFb: n.pageFb,
            overall: n.overall,
          }),
        );
      } catch (e) {}
      return n;
    });
  }
  view() {
    return VIEWS.find((v) => v.id === this.state.page) || VIEWS[1];
  }
  scen() {
    return this.state.scenarios[this.state.page] || "asis";
  }
  delta() {
    const s = this.scen();
    return s === "hold" ? 11 : s === "break" ? -14 : 0;
  }
  divIdx() {
    const i = DIV.findIndex((d) => d[0] === this.state.division);
    return i;
  }
  off() {
    const i = this.divIdx();
    if (i < 0) return 0;
    return [-3, 1, 3, 5, 4, -1, -4, -2, 2][i];
  }
  adj(v, rev) {
    const d = (this.delta() + this.off()) * (rev ? -1 : 1);
    return Math.max(1, Math.min(99, Math.round(v + d)));
  }
  scale(n) {
    const i = this.divIdx();
    if (i < 0) return n;
    const tot = DIV.reduce((a, d) => a + d[2], 0);
    return Math.max(1, Math.round((n * DIV[i][2]) / tot));
  }
  fmt(n) {
    return n.toLocaleString("en-US");
  }
  rowsForDiv(rows) {
    const i = this.divIdx();
    return i < 0
      ? rows.map((r, j) => [DIV[j][0], DIV[j][1], ...r])
      : [[DIV[i][0], DIV[i][1], ...rows[i]]];
  }

  // ---------- element builders ----------
  score(num, name, value, opts) {
    const o = opts || {};
    return { kind: "Scorecard", num, name, value, ...o };
  }
  mkTable(num, name, head, rows, opts) {
    const o = opts || {};
    return { kind: "Table", num, name, head, rows, ...o };
  }

  cellStyles(head, rows) {
    const means = head.map((h, ci) => {
      if (!h.pct) return null;
      const vals = rows.map((r) => r[ci]).filter((v) => typeof v === "number");
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    });
    return rows.map((r) => ({
      cells: r.map((v, ci) => {
        const h = head[ci];
        let bg = "",
          fg = INK,
          fw = ci === 0 ? "500" : "400";
        if (
          h.pct &&
          typeof v === "number" &&
          means[ci] !== null &&
          rows.length > 1
        ) {
          const d = v - means[ci],
            thr = h.thr || 5,
            worse = h.rev ? d > 0 : d < 0,
            better = h.rev ? d < 0 : d > 0;
          if (Math.abs(d) >= thr && worse) {
            bg = BAD_BG;
            fg = BAD_FG;
            fw = "600";
          } else if (Math.abs(d) >= thr && better) {
            bg = GOOD_BG;
            fg = GOOD_FG;
            fw = "600";
          }
        }
        const align = ci === 0 ? "left" : "right";
        return {
          v:
            h.pct && typeof v === "number"
              ? v + "%"
              : typeof v === "number"
                ? this.fmt(v)
                : v,
          style: `padding:7px 8px;border-bottom:1px solid #F4F3F2;text-align:${align};font-weight:${fw};color:${fg};background:${bg || "transparent"};font-family:${ci === 0 ? "inherit" : MONO};font-size:${ci === 0 ? "12px" : "11.5px"};white-space:nowrap`,
        };
      }),
    }));
  }

  buildCards() {
    const v = this.state.page,
      A = (x, r) => this.adj(x, r),
      S = (n) => this.scale(n),
      F = (n) => this.fmt(n);
    const dcols = [{ label: "Division" }, { label: "Districts" }];
    const pctc = (l, rev, thr) => ({
      label: l,
      pct: true,
      rev: !!rev,
      thr: thr || 5,
    });

    if (v === "v1") {
      const teach = [
          [92, 64],
          [88, 61],
          [82, 73],
        ],
        subj = ["English", "Hindi", "Mathematics"];
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
                [F(S(121626)), "Girls"],
                [F(S(121095)), "Boys"],
              ],
            }),
            this.score("1.3", "Middle-grade teachers", F(S(460)), {
              kq: "KQ03",
              splits: [
                [F(S(262)), "Female"],
                [F(S(198)), "Male"],
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
          ],
        },
        {
          title: "Reach by geography and subject",
          grid: "1.4fr 1fr",
          cards: [
            this.mkTable(
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
              (this.divIdx() < 0 ? DIV : [DIV[this.divIdx()]]).map((d) => [
                d[0],
                d[2],
                d[3],
                d[4],
                d[5],
                d[6],
              ]),
              { kq: "KQ01–KQ04", minWidth: "440px" },
            ),
            {
              kind: "Grouped bar chart",
              num: "1.7",
              name: "Middle-grade teachers by subject and gender",
              kq: "KQ03",
              bars: {
                max: 100,
                legend: [
                  ["Female", BLUE],
                  ["Male", TEAL],
                ],
                groups: subj.map((s, i) => ({
                  label: s,
                  bars: [
                    [S(teach[i][0]), BLUE],
                    [S(teach[i][1]), TEAL],
                  ],
                })),
              },
            },
          ],
        },
        {
          title: "Annual activity plan: quarterly target vs achieved",
          note: "State-level data · Division and District filters do not apply",
          grid: 3,
          cards: [
            {
              kind: "Grouped column chart",
              num: "1.8",
              name: "School implementation",
              kq: "KQ05",
              bars: {
                max: 300,
                legend: [
                  ["Target", INK],
                  ["Achieved", TEAL],
                ],
                groups: [
                  {
                    label: "Q2",
                    bars: [
                      [275, INK],
                      [67, TEAL],
                    ],
                  },
                  {
                    label: "Q3",
                    bars: [
                      [275, INK],
                      [0, TEAL],
                    ],
                  },
                ],
              },
            },
            {
              kind: "Grouped column chart",
              num: "1.9",
              name: "State interventions",
              kq: "KQ05",
              bars: {
                max: 20,
                legend: [
                  ["Target", INK],
                  ["Achieved", TEAL],
                ],
                groups: [
                  {
                    label: "Q1",
                    bars: [
                      [17, INK],
                      [17, TEAL],
                    ],
                  },
                  {
                    label: "Q2",
                    bars: [
                      [15, INK],
                      [12, TEAL],
                    ],
                  },
                ],
              },
            },
            {
              kind: "Grouped column chart",
              num: "1.10",
              name: "Internal team activities",
              kq: "KQ05",
              bars: {
                max: 12,
                legend: [
                  ["Target", INK],
                  ["Achieved", TEAL],
                ],
                groups: [
                  {
                    label: "Q1",
                    bars: [
                      [10, INK],
                      [3, TEAL],
                    ],
                  },
                  {
                    label: "Q2",
                    bars: [
                      [9, INK],
                      [4, TEAL],
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          title: "",
          grid: 1,
          cards: [
            this.mkTable(
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
                [
                  "Q1",
                  "Internal Team",
                  "Monitoring Tool Creation",
                  2,
                  1,
                  "Delayed",
                  "—",
                ],
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
                [
                  "Q2",
                  "Internal Team",
                  "Friyay Cadence",
                  3,
                  2,
                  "In Progress",
                  "—",
                ],
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
          ],
        },
      ];
    }

    if (v === "v2") {
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
      ];
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
      ];
      return [
        {
          title: "Stakeholders completing training",
          note: "School leaders include MSHMs; MSHMs are a subset and should not be added separately",
          grid: 6,
          cards: [
            this.score("2.1", "% School Leaders trained", A(78) + "%", {
              kq: "KQ07",
            }),
            this.score("2.2", "% MSHMs trained", A(73) + "%", { kq: "KQ07" }),
            this.score("2.3", "% Teachers trained", A(73) + "%", {
              kq: "KQ08",
            }),
            this.score("2.4", "School leaders trained", F(S(214)), {
              kq: "KQ07",
            }),
            this.score("2.5", "MSHMs trained", F(S(168)), { kq: "KQ07" }),
            this.score("2.6", "Teachers trained", F(S(336)), { kq: "KQ08" }),
          ],
        },
        {
          title: "Training completion detail",
          grid: "1fr 1.4fr",
          cards: [
            {
              kind: "Grouped bar chart",
              num: "2.7",
              name: "Teacher training completion by subject and gender",
              kq: "KQ08",
              bars: {
                max: 100,
                pct: true,
                legend: [
                  ["Female", BLUE],
                  ["Male", TEAL],
                ],
                groups: [
                  {
                    label: "English",
                    bars: [
                      [A(76), BLUE],
                      [A(69), TEAL],
                    ],
                  },
                  {
                    label: "Hindi",
                    bars: [
                      [A(79), BLUE],
                      [A(72), TEAL],
                    ],
                  },
                  {
                    label: "Mathematics",
                    bars: [
                      [A(73), BLUE],
                      [A(66), TEAL],
                    ],
                  },
                ],
              },
            },
            this.mkTable(
              "2.8",
              "Training reach by division",
              [
                { label: "Division" },
                { label: "SL #" },
                pctc("SL %"),
                { label: "MSHM #" },
                pctc("MSHM %"),
                { label: "Teacher #" },
                pctc("Teacher %"),
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
          ],
        },
        {
          title: "",
          grid: 1,
          cards: [
            this.mkTable(
              "2.9",
              "Training reach by district",
              [
                { label: "District" },
                { label: "SL #" },
                pctc("SL %"),
                { label: "MSHM #" },
                pctc("MSHM %"),
                { label: "Teacher #" },
                pctc("Teacher %"),
              ],
              this.state.district === "All Districts"
                ? DISTRICTS.map((d, i) => [d, ...dtr[i]])
                : [
                    [
                      this.state.district,
                      ...dtr[
                        Math.max(0, DISTRICTS.indexOf(this.state.district))
                      ],
                    ],
                  ],
              {
                kq: "KQ07–KQ08",
                minWidth: "560px",
                legend: "Outliers: ≥5pp vs peer average, % columns only —",
              },
            ),
          ],
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
              rev: true,
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
          ],
        },
        {
          title: "Assessment participation",
          grid: "1fr 1fr 1fr 1.6fr",
          cards: [
            this.score("2.15", "Pre-test completed", A(86) + "%", {
              kq: "KQ06",
            }),
            this.score("2.16", "Post-test completed", A(74) + "%", {
              kq: "KQ06",
            }),
            this.score("2.17", "Both completed", A(70) + "%", { kq: "KQ06" }),
            {
              kind: "Grouped bar chart",
              num: "2.18",
              name: "Training quality by stakeholder type",
              kq: "KQ06",
              bars: {
                max: 100,
                pct: true,
                legend: [
                  ["All criteria", BLUE],
                  ["Facilitation", TEAL],
                  ["Content", CORAL],
                  ["Delivery", YEL],
                ],
                groups: [
                  {
                    label: "Teachers",
                    bars: [
                      [49, BLUE],
                      [70, TEAL],
                      [76, CORAL],
                      [71, YEL],
                    ],
                  },
                  {
                    label: "School Leaders",
                    bars: [
                      [46, BLUE],
                      [67, TEAL],
                      [73, CORAL],
                      [68, YEL],
                    ],
                  },
                  {
                    label: "MSHMs",
                    bars: [
                      [52, BLUE],
                      [72, TEAL],
                      [78, CORAL],
                      [74, YEL],
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          title: "",
          grid: 1,
          cards: [
            this.mkTable(
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
                pctc("Pre-test"),
                pctc("Post-test"),
                pctc("Both"),
              ],
              [
                [
                  "School Leader Induction",
                  "School leaders",
                  46,
                  "Yes",
                  "No",
                  "Yes",
                  "Yes",
                  "Yes",
                  93,
                  89,
                  85,
                ],
                [
                  "MSHM Academic Leadership",
                  "MSHMs",
                  38,
                  "Yes",
                  "No",
                  "Yes",
                  "Yes",
                  "Yes",
                  95,
                  92,
                  89,
                ],
                [
                  "English Pedagogy Workshop",
                  "Teachers",
                  112,
                  "No",
                  "No",
                  "Yes",
                  "Yes",
                  "No",
                  88,
                  82,
                  76,
                ],
                [
                  "Hindi Pedagogy Workshop",
                  "Teachers",
                  104,
                  "Yes",
                  "No",
                  "Yes",
                  "Yes",
                  "Yes",
                  91,
                  87,
                  84,
                ],
                [
                  "Mathematics Pedagogy Workshop",
                  "Teachers",
                  108,
                  "No",
                  "Yes",
                  "No",
                  "Yes",
                  "No",
                  84,
                  78,
                  72,
                ],
                [
                  "CWT Refresher",
                  "School leaders",
                  52,
                  "Yes",
                  "No",
                  "Yes",
                  "Yes",
                  "Yes",
                  96,
                  94,
                  91,
                ],
                [
                  "Assessment & Data Use",
                  "MSHMs",
                  34,
                  "No",
                  "No",
                  "Yes",
                  "No",
                  "Yes",
                  89,
                  81,
                  77,
                ],
                [
                  "Remediation Planning",
                  "Teachers",
                  96,
                  "Yes",
                  "No",
                  "Yes",
                  "Yes",
                  "Yes",
                  90,
                  86,
                  82,
                ],
              ],
              {
                kq: "KQ06",
                minWidth: "1000px",
                legend:
                  "Participants = unique attendees; Both tests % = matched pre- and post-test records ÷ unique attendees —",
              },
            ),
          ],
        },
      ];
    }

    if (v === "v3") {
      const procs = [
        ["Classroom Walkthroughs", 44, "KQ10"],
        ["Monthly Assessments", 58, "KQ11"],
        ["Learning-Level Tracking", 49, "KQ12"],
        ["Dakshata Classes", 56, "KQ13"],
        ["Remediation", 46, "KQ15"],
        ["Academic Inchargeship", 43, "KQ16"],
        ["Academic Samvaad", 61, "KQ17"],
      ];
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
      ];
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
      ];
      const pcols = [
        "CWT",
        "Monthly Assess.",
        "Learning Tracking",
        "Dakshata",
        "Remediation",
        "Academic Incharge",
        "Academic Samvaad",
      ];
      return [
        {
          title: "School visit coverage",
          note: "All data is for the latest School Visit record",
          grid: "1fr 1fr 2fr",
          cards: [
            this.score(
              "3.1a",
              "Schools observed at least once (%)",
              A(96) + "%",
              { kq: "KQ10–KQ17" },
            ),
            this.score(
              "3.1b",
              "Schools observed at least once (#)",
              F(S(264)),
              { kq: "KQ10–KQ17" },
            ),
            {
              kind: "Note",
              num: "—",
              name: "How to read this view",
              body: "Each priority academic process is a composite: a school counts only where every criterion is met. Use 3.2 to see which process is weakest programme-wide, then 3.4 and 3.5 to find where it is weakest, then move to PAP Detail to see which criterion is failing.",
            },
          ],
        },
        {
          title: "Implementation across the seven processes",
          grid: "1.3fr 1fr",
          cards: [
            {
              kind: "Bar chart",
              num: "3.2",
              name: "Schools meeting all criteria by priority academic process",
              kq: "KQ10–KQ17",
              bars: {
                max: 100,
                pct: true,
                legend: [["% schools meeting all criteria", BLUE]],
                groups: procs.map((p) => ({
                  label: p[0],
                  bars: [[A(p[1]), BLUE]],
                })),
              },
            },
            {
              kind: "Bar chart",
              num: "3.3",
              name: "Number of priority academic processes implemented",
              kq: "KQ10–KQ17",
              bars: {
                max: 60,
                pct: true,
                legend: [["% of schools", TEAL]],
                groups: [
                  { label: "0 processes", bars: [[7, CORAL]] },
                  { label: "1–3", bars: [[28, YEL]] },
                  { label: "4–6", bars: [[49, TEAL]] },
                  { label: "7 processes", bars: [[16, BLUE]] },
                ],
              },
            },
          ],
        },
        {
          title: "",
          grid: 1,
          cards: [
            this.mkTable(
              "3.4",
              "Priority process implementation by division",
              [...dcols, ...pcols.map((c) => pctc(c))],
              this.rowsForDiv(d34),
              {
                kq: "KQ10–KQ17",
                minWidth: "860px",
                legend:
                  "Percentages are calculated from schools, not districts —",
              },
            ),
          ],
        },
        {
          title: "",
          grid: 1,
          cards: [
            this.mkTable(
              "3.5",
              "Priority process implementation by district",
              [{ label: "District" }, ...pcols.map((c) => pctc(c))],
              this.state.district === "All Districts"
                ? DISTRICTS.map((d, i) => [d, ...d35[i]])
                : [
                    [
                      this.state.district,
                      ...d35[
                        Math.max(0, DISTRICTS.indexOf(this.state.district))
                      ],
                    ],
                  ],
              {
                kq: "KQ10–KQ17",
                minWidth: "800px",
                legend: "Outliers: ≥5pp vs peer average —",
              },
            ),
          ],
        },
      ];
    }

    if (v === "v4") {
      return PAP.map((p) => ({
        title: p.t,
        note: "All data is for the latest School Visit record",
        grid:
          p.cards.length >= 4
            ? "repeat(auto-fit,minmax(200px,1fr))"
            : "repeat(auto-fit,minmax(240px,1fr))",
        cards: [
          ...p.cards.map((c) =>
            this.score(c[0], c[1], A(c[2], c[4]) + "%", {
              kq: p.kq,
              sub: c[3],
              rev: !!c[4],
            }),
          ),
          this.mkTable(
            p.tn,
            p.tname,
            [...dcols, ...p.cols.map((c, i) => pctc(c, p.rev[i]))],
            this.rowsForDiv(p.rows),
            {
              kq: p.kq,
              minWidth: 220 + p.cols.length * 120 + "px",
              legend: "Outliers: ≥5pp vs peers; 'None met' reversed —",
              full: true,
            },
          ),
        ],
      }));
    }

    if (v === "v5") {
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
      ];
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
      ];
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
      ];
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
      ];
      return [
        {
          title: "Priority teacher-practice implementation",
          grid: 4,
          cards: [
            this.score("5.1", "Classroom observations", F(S(1248)), {
              kq: "KQ21",
            }),
            this.score("5.2", "Effective questioning", A(62) + "%", {
              kq: "KQ21",
            }),
            this.score("5.3", "Student practice", A(54) + "%", { kq: "KQ21" }),
            this.score("5.4", "Differentiated instruction", A(41) + "%", {
              kq: "KQ21",
            }),
          ],
        },
        {
          title: "Practice by subject and by teacher gender",
          grid: "1fr 1fr",
          cards: [
            {
              kind: "Grouped bar chart",
              num: "5.5",
              name: "Priority teacher practices by subject",
              kq: "KQ21",
              bars: {
                max: 100,
                pct: true,
                legend: [
                  ["Questioning", BLUE],
                  ["Student practice", TEAL],
                  ["Differentiation", CORAL],
                ],
                groups: [
                  {
                    label: "English (n=416)",
                    bars: [
                      [A(66), BLUE],
                      [A(58), TEAL],
                      [A(43), CORAL],
                    ],
                  },
                  {
                    label: "Hindi (n=403)",
                    bars: [
                      [A(63), BLUE],
                      [A(55), TEAL],
                      [A(41), CORAL],
                    ],
                  },
                  {
                    label: "Maths (n=429)",
                    bars: [
                      [A(57), BLUE],
                      [A(49), TEAL],
                      [A(38), CORAL],
                    ],
                  },
                ],
              },
            },
            {
              kind: "Grouped bar chart",
              num: "5.8",
              name: "Priority teacher practices by teacher gender",
              kq: "KQ21",
              bars: {
                max: 100,
                pct: true,
                legend: [
                  ["Questioning", BLUE],
                  ["Student practice", TEAL],
                  ["Differentiation", CORAL],
                ],
                groups: [
                  {
                    label: "Female (n=710)",
                    bars: [
                      [A(65), BLUE],
                      [A(57), TEAL],
                      [A(43), CORAL],
                    ],
                  },
                  {
                    label: "Male (n=538)",
                    bars: [
                      [A(59), BLUE],
                      [A(51), TEAL],
                      [A(38), CORAL],
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          title: "",
          grid: 1,
          cards: [
            this.mkTable(
              "5.6",
              "Priority teacher practices by division",
              [
                ...dcols,
                { label: "Classrooms" },
                pctc("Questioning"),
                pctc("Student practice"),
                pctc("Differentiation"),
              ],
              this.rowsForDiv(d56),
              {
                kq: "KQ21",
                minWidth: "640px",
                legend: "Percentages are calculated from CROs, not districts —",
              },
            ),
          ],
        },
        {
          title: "",
          grid: 1,
          cards: [
            this.mkTable(
              "5.7",
              "Priority teacher practices by district",
              [
                { label: "District" },
                { label: "Classrooms" },
                pctc("Questioning"),
                pctc("Student practice"),
                pctc("Differentiation"),
              ],
              this.state.district === "All Districts"
                ? DISTRICTS.map((d, i) => [d, ...d57[i]])
                : [
                    [
                      this.state.district,
                      ...d57[
                        Math.max(0, DISTRICTS.indexOf(this.state.district))
                      ],
                    ],
                  ],
              {
                kq: "KQ21",
                minWidth: "600px",
                legend: "Outliers: ≥5pp vs peer average —",
              },
            ),
          ],
        },
        {
          title: "Student engagement",
          grid: "1fr 2fr",
          cards: [
            this.score("5.9", "Strong student engagement", A(57) + "%", {
              kq: "KQ22",
              sub: "Observed classrooms where at least 75% of students are actively on task (definition TBD)",
            }),
            this.mkTable(
              "5.12",
              "Student engagement by teacher gender and subject",
              [
                { label: "Teacher gender" },
                pctc("Overall"),
                pctc("English"),
                pctc("Hindi"),
                pctc("Mathematics"),
              ],
              [
                ["Female", A(60), A(63), A(62), A(55)],
                ["Male", A(53), A(56), A(56), A(48)],
              ],
              { kq: "KQ22", minWidth: "460px" },
            ),
          ],
        },
        {
          title: "",
          grid: 1,
          cards: [
            this.mkTable(
              "5.10",
              "Student engagement by division",
              [
                ...dcols,
                pctc("Overall"),
                pctc("English"),
                pctc("Hindi"),
                pctc("Mathematics"),
              ],
              this.rowsForDiv(d510),
              {
                kq: "KQ22",
                minWidth: "620px",
                legend: "Outliers: ≥5pp vs peer average —",
              },
            ),
          ],
        },
        {
          title: "",
          grid: 1,
          cards: [
            this.mkTable(
              "5.11",
              "Student engagement by district",
              [
                { label: "District" },
                pctc("Overall"),
                pctc("English"),
                pctc("Hindi"),
                pctc("Mathematics"),
              ],
              this.state.district === "All Districts"
                ? DISTRICTS.map((d, i) => [d, ...d511[i]])
                : [
                    [
                      this.state.district,
                      ...d511[
                        Math.max(0, DISTRICTS.indexOf(this.state.district))
                      ],
                    ],
                  ],
              {
                kq: "KQ22",
                minWidth: "560px",
                legend: "Outliers: ≥5pp vs peer average —",
              },
            ),
          ],
        },
      ];
    }

    if (v === "v6a" || v === "v6b") {
      const ext = v === "v6b";
      const N = ext ? "7" : "6";
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
          ];
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
          ];
      const byGender = ext
        ? [
            [20, 24, 34, 22],
            [24, 27, 30, 19],
          ]
        : [
            [17, 25, 35, 23],
            [21, 27, 32, 20],
          ];
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
      ];
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
      ];
      const dtab = ext ? dtabExt : dtabInt;
      const lvHead = [];
      ["English", "Hindi", "Mathematics"].forEach((s) =>
        LEVELS.forEach((l) =>
          lvHead.push(
            pctc(
              s.slice(0, 3) +
                " · " +
                (l === "Below Dakshata"
                  ? "Below"
                  : l === "Grade Level"
                    ? "Grade"
                    : l),
            ),
            false,
          ),
        ),
      );
      const secs = [
        {
          title:
            "Latest " +
            (ext ? "external" : "spot") +
            "-assessment headline results",
          note: ext
            ? null
            : "All data is for the latest Spot Assessment record",
          grid: 4,
          cards: [
            this.score(
              N + ".1",
              "Students assessed",
              F(S(ext ? 39240 : 42860)),
              {
                kq: "KQ23",
                sub:
                  "Latest " +
                  (ext ? "evaluation round" : "spot-assessment round"),
              },
            ),
            this.score(
              N + ".2",
              "English at Dakshata+",
              A(ext ? 54 : 57) + "%",
              { kq: "KQ23", sub: "Dakshata and above" },
            ),
            this.score(N + ".3", "Hindi at Dakshata+", A(ext ? 58 : 61) + "%", {
              kq: "KQ23",
              sub: "Dakshata and above",
            }),
            this.score(
              N + ".4",
              "Mathematics at Dakshata+",
              A(ext ? 46 : 49) + "%",
              { kq: "KQ23", sub: "Dakshata and above" },
            ),
          ],
        },
        {
          title: "Learning-level distribution",
          grid: 3,
          cards: [
            {
              kind: "100% stacked bar chart",
              num: N + ".5",
              name: "Distribution by subject",
              kq: "KQ23",
              stack: {
                rows: ["English", "Hindi", "Mathematics"].map((s, i) => ({
                  label: s,
                  vals: bySub[i],
                })),
              },
            },
            {
              kind: "100% stacked bar chart",
              num: N + ".6",
              name: "Distribution by grade",
              kq: "KQ23",
              stack: {
                note:
                  this.state.subject === "All Subjects"
                    ? "All subjects"
                    : this.state.subject,
                rows: ["Grade 6", "Grade 7", "Grade 8"].map((s, i) => ({
                  label: s,
                  vals: byGrade[i],
                })),
              },
            },
            {
              kind: "100% stacked bar chart",
              num: N + ".7",
              name: "Distribution by gender",
              kq: "KQ23",
              stack: {
                rows: ["Girls", "Boys"].map((s, i) => ({
                  label: s,
                  vals: byGender[i],
                })),
              },
            },
          ],
        },
        {
          title: "",
          grid: 1,
          cards: [
            this.mkTable(
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
            this.mkTable(
              N + ".9",
              "Learning levels by district",
              [{ label: "District" }, ...lvHead],
              DISTRICTS.map((d, i) => [d, ...dtab[i % dtab.length]]).filter(
                (r) =>
                  this.state.district === "All Districts" ||
                  r[0] === this.state.district,
              ),
              {
                kq: "KQ23",
                minWidth: "1180px",
                legend: "Red/green: ≥2pp worse/better than peers —",
              },
            ),
          ],
        },
      ];
      if (ext)
        secs.push({
          title: "Change across rounds",
          grid: "1fr",
          cards: [
            {
              kind: "100% stacked column chart",
              num: "7.10",
              name: "Learning-level distribution by academic year",
              kq: "KQ23",
              stack: {
                rows: [
                  { label: "2023–24", vals: [31, 28, 26, 15] },
                  { label: "2024–25", vals: [26, 27, 29, 18] },
                  { label: "2025–26", vals: [22, 25, 32, 21] },
                ],
              },
            },
          ],
        });
      return secs;
    }

    if (v === "v7") {
      const band = (num, label, n, rows) => ({
        title: label,
        grid: "1fr 2.4fr",
        cards: [
          this.score(num + "a", label + " schools (#)", String(S(n)), {
            kq: "KQ24",
            sub: "Schools in analysis",
          }),
          this.mkTable(
            num + "b",
            label + ": teacher practice and learning",
            [
              { label: "Teacher practice" },
              { label: "Schools" },
              pctc("English Dakshata+"),
              pctc("Hindi Dakshata+"),
              pctc("Maths Dakshata+"),
            ],
            rows,
            { kq: "KQ24", minWidth: "520px" },
          ),
        ],
      });
      return [
        {
          title:
            "Patterns across implementation, teacher practice and learning",
          note: "Latest School Visit record; cumulative CRO records",
          grid: 1,
          cards: [
            {
              kind: "Note",
              num: "—",
              name: "Where the chain holds and where it breaks",
              body: "Read down the three implementation bands. If the chain holds, strong teacher practice should carry higher learning outcomes within every band — and high implementation should beat low. Where a band shows strong practice but flat learning, the break is between practice and outcome, not between process and practice.",
            },
          ],
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
            this.mkTable(
              "8.4",
              "School-level results-chain comparison",
              [
                { label: "School" },
                { label: "District" },
                { label: "Implementation" },
                { label: "Teacher practice" },
                pctc("English"),
                pctc("Hindi"),
                pctc("Maths"),
              ],
              [
                [
                  "CM RISE School Govindpura",
                  "Bhopal",
                  "High",
                  "Strong",
                  A(71),
                  A(74),
                  A(64),
                ],
                [
                  "Sandipani Vidyalaya Rau",
                  "Indore",
                  "High",
                  "Strong",
                  A(68),
                  A(72),
                  A(61),
                ],
                [
                  "Govt Excellence School Ujjain",
                  "Ujjain",
                  "High",
                  "Strong",
                  A(65),
                  A(69),
                  A(58),
                ],
                [
                  "CM RISE School Morar",
                  "Gwalior",
                  "High",
                  "Developing",
                  A(58),
                  A(63),
                  A(51),
                ],
                [
                  "Sandipani Vidyalaya Adhartal",
                  "Jabalpur",
                  "Medium",
                  "Strong",
                  A(60),
                  A(65),
                  A(54),
                ],
                [
                  "Govt HSS Makronia",
                  "Sagar",
                  "Medium",
                  "Developing",
                  A(53),
                  A(58),
                  A(46),
                ],
                [
                  "CM RISE School Rewa",
                  "Rewa",
                  "Medium",
                  "Developing",
                  A(51),
                  A(56),
                  A(44),
                ],
                [
                  "Sandipani Vidyalaya Sohagpur",
                  "Narmadapuram",
                  "Medium",
                  "Weak",
                  A(45),
                  A(50),
                  A(38),
                ],
                [
                  "Govt Excellence School Morena",
                  "Morena",
                  "Low",
                  "Developing",
                  A(43),
                  A(48),
                  A(36),
                ],
                [
                  "CM RISE School Shahdol",
                  "Shahdol",
                  "Low",
                  "Weak",
                  A(36),
                  A(41),
                  A(30),
                ],
                [
                  "Sandipani Vidyalaya Sehore",
                  "Bhopal",
                  "High",
                  "Strong",
                  A(67),
                  A(71),
                  A(60),
                ],
                [
                  "Govt Model HSS Dewas",
                  "Ujjain",
                  "Medium",
                  "Strong",
                  A(58),
                  A(63),
                  A(51),
                ],
              ],
              {
                kq: "KQ24",
                minWidth: "860px",
                legend: "Outliers: ≥5pp vs peer average, % columns only —",
              },
            ),
          ],
        },
      ];
    }
    return [];
  }

  // ---------- rendering ----------
  allElements() {
    const out = [],
      prev = this.state.page;
    return out;
  }
  countReviewed() {
    const a = this.state.answers;
    let n = 0;
    Object.keys(a).forEach((k) => {
      if (a[k] && a[k].kq) n++;
    });
    return n;
  }
  key(num) {
    return this.state.page + ":" + num;
  }
  threadOf(k) {
    return this.state.comments[k] || [];
  }
  initial(n) {
    return (n || "?").charAt(0).toUpperCase();
  }
  avatar(n, sz) {
    const cols = [TEAL, CORAL, YEL, "#B9C6E4"],
      i = (n || "").length % 4;
    return `width:${sz}px;height:${sz}px;border-radius:50%;background:${cols[i]};color:${INK};display:flex;align-items:center;justify-content:center;font-size:${sz * 0.46}px;font-weight:700;flex:none`;
  }
  when(ts) {
    const d = Math.floor((Date.now() - ts) / 864e5);
    return d <= 0 ? "today" : d === 1 ? "1d" : d + "d";
  }

  renderVals() {
    const st = this.state,
      v = this.view(),
      self = this;
    const set = (patch) => this.persist(patch);
    const isDash = st.page !== "brief";
    const scenId = this.scen();

    // brief
    const groups = GROUPS.map((g) => ({
      name: g[0],
      views: g[2],
      members: g[1].map((m) => ({
        name: m,
        initial: this.initial(m),
        pick: () => this.setState({ pending: m }),
        style: `display:flex;align-items:center;gap:8px;padding:7px 12px 7px 8px;border:1.5px solid ${st.pending === m ? BLUE : BOR};border-radius:22px;background:${st.pending === m ? "#EEF1F8" : "#fff"};cursor:pointer`,
        avatarStyle: this.avatar(m, 22),
      })),
    }));

    // tabs
    const tabs = VIEWS.map((t) => ({
      label: t.label,
      go: () =>
        this.setState({
          page: t.id,
          focus: null,
          replyTo: null,
          copied: false,
        }),
      style: `padding:0 12px;height:34px;display:flex;align-items:center;font-size:12px;font-weight:${st.page === t.id ? "600" : "500"};color:${st.page === t.id ? BLUE : SEC};border-bottom:2px solid ${st.page === t.id ? BLUE : "transparent"};${t.ref ? "border-left:1px solid " + BOR + ";margin-left:8px;" : ""}white-space:nowrap;cursor:pointer`,
    }));

    // sections
    const rawSections = isDash ? this.buildCards() : [];
    const inventory = [];
    const sections = rawSections.map((s) => {
      const grid =
        typeof s.grid === "number"
          ? `repeat(auto-fit,minmax(${s.grid >= 5 ? 168 : 212}px,1fr))`
          : s.grid;
      return {
        title: s.title || "",
        note: s.note || "",
        gridStyle: `display:grid;grid-template-columns:${grid};gap:11px;align-items:start`,
        cards: s.cards.map((c) => {
          const k = this.key(c.num);
          const thread = this.threadOf(k);
          const ans = st.answers[k];
          if (c.num !== "—")
            inventory.push({
              num: c.num,
              name: c.name,
              kind: c.kind,
              kq: c.kq,
            });
          const focusedHere = st.focus === c.num;
          const base = {
            num: c.num,
            name: c.name,
            kqLabel: c.kq || "",
            commentCount: thread.length || null,
            reviewed: !!(ans && ans.kq),
            focus: () => this.setState({ focus: c.num, replyTo: null }),
            cardStyle: `background:#fff;border:${focusedHere ? "2px solid " + BLUE : "1px solid " + BOR};border-radius:11px;padding:${focusedHere ? "12px 13px" : "13px 14px"};cursor:pointer;min-width:0;${focusedHere ? "box-shadow:0 0 0 3px rgba(23,71,158,.1);" : ""}${c.full ? "grid-column:1/-1;" : ""}`,
            numStyle: `font-family:${MONO};font-size:10px;font-weight:${focusedHere ? "700" : "600"};color:${focusedHere ? BLUE : SEC};flex:none`,
            nameStyle:
              c.kind === "Scorecard"
                ? "display:none"
                : `font-size:13px;font-weight:600;color:${INK};line-height:1.3;min-width:0`,
            isScore: false,
            isTable: false,
            isBars: false,
            isStack: false,
            isNote: false,
          };

          if (c.kind === "Scorecard")
            return {
              ...base,
              isScore: true,
              value: c.value,
              valueStyle: `font-size:${String(c.value).length > 6 ? "23px" : String(c.value).length > 4 ? "26px" : "29px"};font-weight:700;letter-spacing:-.025em;line-height:1;color:${c.rev ? BAD_FG : INK};white-space:nowrap`,
              splits: c.splits
                ? c.splits.map((sp) => ({ v: sp[0], k: sp[1] }))
                : null,
              sub: c.sub || null,
            };

          if (c.kind === "Note") return { ...base, isNote: true, body: c.body };

          if (c.bars) {
            const b = c.bars;
            return {
              ...base,
              isBars: true,
              legendItems: b.legend.map((l) => ({
                label: l[0],
                swatch: `width:9px;height:9px;border-radius:2px;background:${l[1]};flex:none`,
              })),
              groups: b.groups.map((g) => ({
                label: g.label,
                bars: g.bars.map((bar) => ({
                  v: b.pct ? bar[0] + "%" : this.fmt(bar[0]),
                  style: `width:100%;max-width:34px;height:${Math.max(1, (bar[0] / b.max) * 100)}%;background:${bar[1]};border-radius:3px 3px 0 0;position:relative`,
                })),
              })),
            };
          }

          if (c.stack) {
            return {
              ...base,
              isStack: true,
              legendItems: LEVELS.map((l, i) => ({
                label: l,
                swatch: `width:9px;height:9px;border-radius:2px;background:${RAMP[i]};flex:none`,
              })),
              stacks: c.stack.rows.map((r) => ({
                label: r.label,
                note: c.stack.note || "",
                segs: r.vals.map((val, i) => ({
                  v: val >= 9 ? val + "%" : "",
                  style: `width:${val}%;background:${RAMP[i]};display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:600;font-family:${MONO};color:${i >= 2 ? (i === 3 ? "#fff" : INK) : INK}`,
                })),
              })),
            };
          }

          const head = c.head.map((h, i) => ({
            label: h.label,
            style: `text-align:${i === 0 ? "left" : "right"};padding:0 8px 8px;font-size:9.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${SEC};border-bottom:1px solid ${BOR};white-space:nowrap`,
          }));
          return {
            ...base,
            isTable: true,
            head,
            rows: this.cellStyles(c.head, c.rows),
            minWidth: c.minWidth || "420px",
            legend: c.legend || null,
          };
        }),
      };
    });

    // focused element
    const focusCard = (() => {
      if (!st.focus) return null;
      let found = null;
      rawSections.forEach((s) =>
        s.cards.forEach((c) => {
          if (c.num === st.focus) found = c;
        }),
      );
      if (!found) return null;
      const k = this.key(found.num),
        thread = this.threadOf(k);
      const label = (found.kq || "").trim();
      const ids = this.kqIdsFor(label);
      const multi = ids.length > 1;
      const open = st.kqOpen || {};
      const kqList = ids.length
        ? ids.map((id) => {
            const ok = `${found.num}:${id}`,
              exp = !multi || !!open[ok];
            return {
              id,
              q: KQ[id][0],
              action: KQ[id][1],
              showId: multi,
              showAction: exp,
              chevron: multi ? (exp ? "▾" : "▸") : null,
              toggle: multi
                ? () => {
                    const o = { ...open };
                    o[ok] = !o[ok];
                    this.setState({ kqOpen: o });
                  }
                : () => {},
              style: multi
                ? `padding:8px 9px;border-radius:7px;background:#fff;border:1px solid ${BOR}`
                : "",
              headStyle: `display:flex;align-items:${multi ? "flex-start" : "baseline"};gap:7px;${multi ? "cursor:pointer;" : ""}`,
              qStyle: `font-size:12px;line-height:1.45;color:${INK};min-width:0;${multi && !exp ? "display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;" : ""}`,
            };
          })
        : [
            {
              id: "—",
              q: "No key question is mapped to this element.",
              action: "—",
              showId: false,
              showAction: false,
              chevron: null,
              toggle: () => {},
              style: "",
              headStyle: "display:flex;gap:7px",
              qStyle: `font-size:12px;line-height:1.45;color:${SEC}`,
            },
          ];
      return {
        num: found.num,
        name: found.name,
        kind: found.kind,
        kqLabel: label || "—",
        kqShort: label || "this question",
        kqList,
        threadCount: thread.length ? String(thread.length) : "0",
      };
    })();

    const fk = focusCard ? this.key(focusCard.num) : null;
    const fAns = fk ? st.answers[fk] || {} : {};
    const mkAns = (field) =>
      ["Yes", "Partly", "No"].map((l) => {
        const val = l.toLowerCase(),
          on = fAns[field] === val;
        const col = val === "yes" ? BLUE : val === "partly" ? CORAL : "#C23934";
        return {
          label: l,
          pick: () => {
            const a = { ...st.answers };
            a[fk] = { ...(a[fk] || {}), [field]: val };
            set({ answers: a });
          },
          style: `flex:1;text-align:center;padding:7px 0;border:1px solid ${on ? col : BOR};border-radius:7px;background:${on ? (val === "yes" ? BLUE : val === "partly" ? "#FBEEEC" : "#FBEEEC") : "#fff"};color:${on ? (val === "yes" ? "#fff" : BAD_FG) : SEC};font-size:12px;font-weight:${on ? "600" : "500"};cursor:pointer`,
        };
      });

    const thread = fk
      ? this.threadOf(fk).map((cm) => ({
          author: cm.author,
          initial: this.initial(cm.author),
          when: this.when(cm.ts),
          text: cm.text,
          isExample: !!cm.example,
          canReply: !cm.parent,
          reply: () => this.setState({ replyTo: cm.author }),
          avatarStyle: this.avatar(cm.author, 20),
          style: `padding:10px 11px;border:1px solid ${BOR};border-radius:9px;${cm.parent ? "margin-left:14px;background:#F7F6F6;" : ""}`,
        }))
      : [];

    const pageKey = "page:" + st.page;
    const pageEntries = (st.pageFb[pageKey] || []).map((p) => ({
      author: p.author,
      initial: this.initial(p.author),
      when: this.when(p.ts),
      text: p.text,
      conf: p.conf,
      avatarStyle: this.avatar(p.author, 20),
    }));

    const mkScale = (cur, onPick) =>
      [1, 2, 3, 4, 5].map((n) => ({
        v: String(n),
        pick: () => onPick(n),
        style: `width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid ${cur === n ? BLUE : BOR};border-radius:7px;background:${cur === n ? BLUE : "#fff"};color:${cur === n ? "#fff" : SEC};font-size:12.5px;font-weight:600;cursor:pointer`,
      }));

    // log
    const logGroups = (() => {
      const byView = {};
      Object.keys(st.comments).forEach((k) => {
        const [vid, num] = k.split(":");
        if (vid === "page") return;
        let items = st.comments[k] || [];
        if (st.logReviewer !== "All reviewers")
          items = items.filter((c) => c.author === st.logReviewer);
        if (!items.length) return;
        const ans = st.answers[k] || {};
        const needs =
          (ans.kq && ans.kq !== "yes") || (ans.action && ans.action !== "yes");
        if (st.needsDecision && !needs) return;
        if (!st.showResolved && st.resolved[k]) return;
        (byView[vid] = byView[vid] || []).push({ k, num, items, ans });
      });
      return Object.keys(byView)
        .sort()
        .map((vid) => {
          const vw = VIEWS.find((x) => x.id === vid);
          const items = byView[vid]
            .sort((a, b) =>
              a.num.localeCompare(b.num, undefined, { numeric: true }),
            )
            .map((e) => {
              const meta = this.metaFor(vid, e.num);
              const res = !!st.resolved[e.k];
              return {
                num: e.num,
                name: meta.name,
                kind: meta.kind,
                kqs: meta.kq || "",
                answered: !!(e.ans.kq || e.ans.action),
                kqAns: e.ans.kq ? e.ans.kq : "—",
                actAns: e.ans.action ? e.ans.action : "—",
                kqAnsStyle: `color:${e.ans.kq === "yes" ? GOOD_FG : e.ans.kq ? BAD_FG : SEC};text-transform:capitalize`,
                actAnsStyle: `color:${e.ans.action === "yes" ? GOOD_FG : e.ans.action ? BAD_FG : SEC};text-transform:capitalize`,
                cardStyle: `background:#fff;border:1px solid ${BOR};border-radius:11px;padding:13px 15px;${res ? "opacity:.6;" : ""}`,
                resolveLabel: res ? "Resolved" : "Mark resolved",
                resolveStyle: `padding:3px 9px;border:1px solid ${res ? GOOD_FG : BOR};border-radius:12px;font-size:10.5px;font-weight:600;color:${res ? GOOD_FG : SEC};background:${res ? GOOD_BG : "#fff"};cursor:pointer;white-space:nowrap`,
                toggleResolved: () => {
                  const r = { ...st.resolved };
                  r[e.k] = !r[e.k];
                  set({ resolved: r });
                },
                go: () =>
                  this.setState({ page: vid, focus: e.num, replyTo: null }),
                comments: e.items.map((cm) => ({
                  author: cm.author,
                  initial: this.initial(cm.author),
                  when: this.when(cm.ts),
                  text: cm.text,
                  isExample: !!cm.example,
                  avatarStyle: this.avatar(cm.author, 20),
                  style: `padding:10px 11px;border-radius:9px;background:#F7F6F6;${cm.parent ? "margin-left:16px;" : ""}`,
                })),
              };
            });
          return {
            view: vw ? vw.title : vid,
            count:
              items.length + (items.length === 1 ? " element" : " elements"),
            items,
          };
        });
    })();

    const totalComments = Object.keys(st.comments).reduce(
      (a, k) => a + (st.comments[k] || []).length,
      0,
    );

    // coverage
    const coverageRows = Object.keys(KQ).map((id) => {
      const els = this.elementsForKq(id);
      const reviewed = els.filter((e) => {
        const a = st.answers[e.vid + ":" + e.num];
        return a && a.kq;
      }).length;
      const badge =
        els.length === 0 ? "no chart" : reviewed + " of " + els.length;
      const ok = els.length > 0 && reviewed === els.length;
      return {
        id,
        q: KQ[id][0],
        els: els.length ? els.map((e) => e.num).join(" · ") : "—",
        badge,
        badgeStyle: `padding:3px 8px;border-radius:5px;font-size:10.5px;font-weight:600;white-space:nowrap;background:${els.length === 0 ? BAD_BG : ok ? GOOD_BG : "#F0EFEE"};color:${els.length === 0 ? BAD_FG : ok ? GOOD_FG : SEC}`,
      };
    });

    return {
      isBrief: st.page === "brief",
      isDash,
      groups,
      start: () => {
        if (st.pending) set({ reviewer: st.pending, page: "v1" });
      },
      startStyle: `padding:9px 19px;border-radius:8px;background:${st.pending ? INK : "#D8D6D6"};color:#fff;font-size:13px;font-weight:600;cursor:${st.pending ? "pointer" : "default"}`,
      startLabel: st.pending
        ? "Start reviewing as " + st.pending
        : "Pick your name",
      startHint: st.pending
        ? "You can switch reviewer any time from the header."
        : "Comments are attributed and saved in this browser.",

      tabs,
      reviewer: st.reviewer || "Reviewer",
      reviewerInitial: this.initial(st.reviewer),
      reviewerAvatar: this.avatar(st.reviewer, 22),
      doneCount: String(this.countReviewed()),
      goBrief: () =>
        this.setState({ page: "brief", pending: st.reviewer, focus: null }),
      goLog: () => this.setState({ page: "log", focus: null }),
      goCoverage: () => this.setState({ page: "coverage", focus: null }),
      toggleRail: () => this.setState({ railClosed: !st.railClosed }),
      railToggleLabel: st.railClosed ? "Show review rail" : "Hide review rail",
      railOpen: !st.railClosed,
      layoutStyle: `display:grid;grid-template-columns:minmax(0,1fr)${st.railClosed ? "" : " 320px"};align-items:start`,

      viewTitle: v.title,
      viewPurpose: v.purpose,
      viewKqs: v.kqs,
      hasKqs: v.kqs.length > 0,
      viewKindLabel: v.kind === "ref" ? "Reference material" : "Dashboard view",
      viewKindChipStyle: `font-family:${MONO};font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;padding:3px 7px;border-radius:4px;background:${v.kind === "ref" ? "#F0EFEE" : BLUE};color:${v.kind === "ref" ? SEC : "#fff"};font-weight:600;white-space:nowrap`,
      isGuide: st.page === "guide",
      isCoverage: st.page === "coverage",
      isLog: st.page === "log",
      isLastView: !!v.last,
      hasFilters: v.filters !== false,
      hasSubject: !!v.subject,
      years: ["2025–26", "2024–25", "2023–24"],
      year: st.year,
      setYear: (e) => set({ year: e.target.value }),
      divisionOptions: ["All Divisions", ...DIV.map((d) => d[0])],
      division: st.division,
      setDivision: (e) =>
        set({ division: e.target.value, district: "All Districts" }),
      districtOptions: ["All Districts", ...DISTRICTS],
      district: st.district,
      setDistrict: (e) => set({ district: e.target.value }),
      subjectOptions: ["All Subjects", "English", "Hindi", "Mathematics"],
      subject: st.subject,
      setSubject: (e) => set({ subject: e.target.value }),
      divisionFilterStyle: `display:flex;align-items:center;gap:6px;padding:4px 9px;border:1px solid ${st.division === "All Divisions" ? BOR : BLUE};border-radius:7px;font-size:12px;cursor:pointer;background:${st.division === "All Divisions" ? "#fff" : "#EEF1F8"}`,
      districtFilterStyle: `display:flex;align-items:center;gap:6px;padding:4px 9px;border:1px solid ${st.district === "All Districts" ? BOR : BLUE};border-radius:7px;font-size:12px;cursor:pointer;background:${st.district === "All Districts" ? "#fff" : "#EEF1F8"}`,
      filtersDirty:
        st.division !== "All Divisions" ||
        st.district !== "All Districts" ||
        st.subject !== "All Subjects" ||
        scenId !== "asis",
      resetFilters: () => {
        const s = { ...st.scenarios };
        s[st.page] = "asis";
        set({
          division: "All Divisions",
          district: "All Districts",
          subject: "All Subjects",
          scenarios: s,
        });
      },
      scenarioOptions: Object.keys(SCEN).map((k) => ({
        id: k,
        label: SCEN[k][0],
      })),
      scenario: scenId,
      setScenario: (e) => {
        const s = { ...st.scenarios };
        s[st.page] = e.target.value;
        set({ scenarios: s });
      },
      scenarioNote: SCEN[scenId][1],

      sections,
      guideRows: VIEWS.filter((x) => x.kind === "view").map((x) => ({
        name: x.label,
        does: x.purpose,
        users: this.usersFor(x.id),
        go: () => this.setState({ page: x.id, focus: null }),
      })),
      coverageRows,

      focused: focusCard,
      clearFocus: () => this.setState({ focus: null, replyTo: null }),
      showPagePanel: !focusCard,
      hasPageFeedback: v.kind === "view",
      railHint: focusCard
        ? ""
        : v.kind === "view"
          ? "Click any element on the left to review it against its key question. Or leave feedback on the whole view below."
          : "This is reference material — no element-level review needed here.",
      viewProgress: (() => {
        const nums = inventory.map((i) => this.key(i.num));
        const done = nums.filter(
          (k) => st.answers[k] && st.answers[k].kq,
        ).length;
        return nums.length ? done + "/" + nums.length : "—";
      })(),
      kqAnswerButtons: mkAns("kq"),
      actionAnswerButtons: mkAns("action"),
      thread,
      replyingTo: st.replyTo,
      cancelReply: () => this.setState({ replyTo: null }),
      commentDraft: fk ? st.drafts[fk] || "" : "",
      setCommentDraft: (e) => {
        const d = { ...st.drafts };
        d[fk] = e.target.value;
        this.setState({ drafts: d });
      },
      submitCommentStyle: `padding:6px 13px;border-radius:7px;background:${fk && st.drafts[fk] ? INK : "#D8D6D6"};color:#fff;font-size:12px;font-weight:600;cursor:pointer`,
      submitComment: () => {
        if (!fk || !st.drafts[fk]) return;
        const parentName = st.replyTo;
        const list = this.threadOf(fk);
        const parent = parentName
          ? (list.find((c) => c.author === parentName && !c.parent) || {}).id
          : null;
        const entry = {
          id: "c" + Date.now(),
          author: st.reviewer || "Reviewer",
          text: st.drafts[fk],
          ts: Date.now(),
          parent,
        };
        const c = { ...st.comments };
        c[fk] = [...list, entry];
        const d = { ...st.drafts };
        d[fk] = "";
        set({ comments: c, drafts: d, replyTo: null });
      },

      pageDraft: st.pageDraft,
      setPageDraft: (e) => this.setState({ pageDraft: e.target.value }),
      pageScale: mkScale(st.pageConf, (n) => this.setState({ pageConf: n })),
      submitPageStyle: `padding:8px 14px;border-radius:8px;background:${st.pageDraft ? INK : "#D8D6D6"};color:#fff;font-size:12px;font-weight:600;cursor:pointer;text-align:center`,
      submitPage: () => {
        if (!st.pageDraft) return;
        const f = { ...st.pageFb };
        f[pageKey] = [
          ...(f[pageKey] || []),
          {
            author: st.reviewer || "Reviewer",
            text: st.pageDraft,
            conf: st.pageConf || 0,
            ts: Date.now(),
          },
        ];
        set({ pageFb: f, pageDraft: "", pageConf: 0 });
      },
      pageEntries: pageEntries.length ? pageEntries : null,

      overallDraft: st.overallDraft,
      setOverallDraft: (e) => this.setState({ overallDraft: e.target.value }),
      overallScale: mkScale(st.overallConf, (n) =>
        this.setState({ overallConf: n }),
      ),
      overallConfidenceLabel: st.overallConf
        ? ["", "not at all", "a little", "somewhat", "mostly", "fully"][
            st.overallConf
          ]
        : "1 = not at all · 5 = fully",
      overallSubmitLabel: "Submit overall feedback",
      submitOverall: () => {
        if (!st.overallDraft) return;
        set({
          overall: [
            ...st.overall,
            {
              author: st.reviewer || "Reviewer",
              text: st.overallDraft,
              conf: st.overallConf || 0,
              ts: Date.now(),
            },
          ],
          overallDraft: "",
          overallConf: 0,
        });
      },
      overallSaved: st.overall.length > 0,
      overallEntries: st.overall.map((o) => ({
        author: o.author,
        text: o.text,
        conf: String(o.conf),
        when: this.when(o.ts),
      })),

      logGroups,
      logEmpty: logGroups.length === 0,
      logCount: ((n) =>
        n === 1 ? "1 element with feedback" : n + " elements with feedback")(
        logGroups.reduce((a, g) => a + g.items.length, 0),
      ),
      reviewerOptions: ["All reviewers", ...GROUPS.flatMap((g) => g[1])],
      logReviewer: st.logReviewer,
      setLogReviewer: (e) => this.setState({ logReviewer: e.target.value }),
      toggleNeedsDecision: () =>
        this.setState({ needsDecision: !st.needsDecision }),
      needsDecisionStyle: `padding:5px 10px;border:1px solid ${st.needsDecision ? BLUE : BOR};border-radius:7px;background:${st.needsDecision ? "#EEF1F8" : "#fff"};color:${st.needsDecision ? BLUE : SEC};font-size:12px;font-weight:${st.needsDecision ? "600" : "500"};cursor:pointer`,
      toggleShowResolved: () =>
        this.setState({ showResolved: !st.showResolved }),
      showResolvedStyle: `padding:5px 10px;border:1px solid ${st.showResolved ? BLUE : BOR};border-radius:7px;background:${st.showResolved ? "#EEF1F8" : "#fff"};color:${st.showResolved ? BLUE : SEC};font-size:12px;font-weight:${st.showResolved ? "600" : "500"};cursor:pointer`,
      copyLabel: st.copied ? "Copied ✓" : "Copy for the feedback sheet",
      copyAll: () => {
        const rows = [
          [
            "View",
            "Element #",
            "Element",
            "Type",
            "Related KQs",
            "Answers the KQ?",
            "Enables action?",
            "What works",
            "What needs to change",
            "What's missing",
            "Decision",
          ],
        ];
        Object.keys(st.comments).forEach((k) => {
          const [vid, num] = k.split(":");
          if (vid === "page") return;
          const vw = VIEWS.find((x) => x.id === vid),
            meta = this.metaFor(vid, num),
            a = st.answers[k] || {};
          const text = (st.comments[k] || [])
            .map((c) => c.author + ": " + c.text)
            .join(" | ");
          rows.push([
            vw ? vw.label : vid,
            num,
            meta.name,
            meta.kind,
            meta.kq || "",
            a.kq || "",
            a.action || "",
            text,
            "",
            "",
            st.resolved[k] ? "Resolved" : "",
          ]);
        });
        ((st.pageFb && Object.keys(st.pageFb)) || []).forEach((k) => {
          const vid = k.split(":")[1],
            vw = VIEWS.find((x) => x.id === vid);
          (st.pageFb[k] || []).forEach((p) =>
            rows.push([
              vw ? vw.label : vid,
              "—",
              "Whole view",
              "Page",
              "",
              "",
              "",
              p.author + ": " + p.text + " (confidence " + p.conf + "/5)",
              "",
              "",
              "",
            ]),
          );
        });
        st.overall.forEach((o) =>
          rows.push([
            "All views",
            "—",
            "Whole dashboard",
            "Overall",
            "",
            "",
            "",
            o.author + ": " + o.text + " (confidence " + o.conf + "/5)",
            "",
            "",
            "",
          ]),
        );
        const tsv = rows.map((r) => r.join("\t")).join("\n");
        try {
          navigator.clipboard.writeText(tsv);
        } catch (e) {}
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2200);
      },
      totalComments: String(totalComments),
    };
  }

  usersFor(id) {
    return (
      {
        v1: "Programme Leadership, PMU",
        v2: "Programme Leadership, Training Team",
        v3: "Programme Leadership, District Leads",
        v4: "District Leads, PMU",
        v5: "District Leads, Training & Content Team",
        v6a: "Programme Leadership, District Leads",
        v6b: "Programme Leadership, Funders",
        v7: "Programme Leadership",
      }[id] || ""
    );
  }
  metaFor(vid, num) {
    const prev = this.state.page;
    if (this._metaCache && this._metaCache[vid] && this._metaCache[vid][num])
      return this._metaCache[vid][num];
    this._metaCache = this._metaCache || {};
    this.state.page = vid;
    let secs = [];
    try {
      secs = this.buildCards();
    } catch (e) {}
    this.state.page = prev;
    const m = {};
    secs.forEach((s) =>
      s.cards.forEach((c) => {
        m[c.num] = { name: c.name, kind: c.kind, kq: c.kq };
      }),
    );
    this._metaCache[vid] = m;
    return m[num] || { name: num, kind: "Element", kq: "" };
  }
  elementsForKq(id) {
    const out = [];
    VIEWS.filter((v) => v.kind === "view").forEach((v) => {
      if (!v.kqs.includes(id)) return;
      const prev = this.state.page;
      this.state.page = v.id;
      let secs = [];
      try {
        secs = this.buildCards();
      } catch (e) {}
      this.state.page = prev;
      secs.forEach((s) =>
        s.cards.forEach((c) => {
          if (c.num === "—") return;
          const kqs = c.kq || "";
          if (kqs.includes(id) || (kqs.includes("–") && this.inRange(kqs, id)))
            out.push({ vid: v.id, num: c.num });
        }),
      );
    });
    return out;
  }
  kqIdsFor(label) {
    if (!label) return [];
    const m = label.match(/KQ(\d+)\s*–\s*KQ(\d+)/);
    if (m) {
      const out = [];
      for (let n = parseInt(m[1], 10); n <= parseInt(m[2], 10); n++) {
        const id = "KQ" + String(n).padStart(2, "0");
        if (KQ[id]) out.push(id);
      }
      return out;
    }
    return label
      .split(/[,·]/)
      .map((s) => s.trim())
      .filter((s) => KQ[s]);
  }
  inRange(label, id) {
    const m = label.match(/KQ(\d+)–KQ(\d+)/);
    if (!m) return false;
    const n = parseInt(id.slice(2), 10);
    return n >= parseInt(m[1], 10) && n <= parseInt(m[2], 10);
  }
}
