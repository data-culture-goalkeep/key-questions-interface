// Prioritised key questions and the action each should enable, from the
// "KQs - final" workbook sheet (via the design handoff). `action` is the
// raw " · "-separated string as authored.

export interface KeyQuestion {
  question: string
  action: string
}

export const KEY_QUESTIONS: Record<string, KeyQuestion> = {
  KQ01: {
    question: "How many Sandipani schools are covered?",
    action:
      "Check right allocation and reach · report numbers to funders · decide direct vs indirect reach",
  },
  KQ02: {
    question: "How many students in Grades 6–8 are covered? (by gender)",
    action:
      "Check right allocation and reach · report numbers to funders · decide direct vs indirect reach",
  },
  KQ03: {
    question:
      "How many middle-grade teachers are supported through the Peepul-Sandipani programme? (by gender & subject)",
    action:
      "Check right allocation and reach · report numbers to funders · decide direct vs indirect reach",
  },
  KQ04: {
    question: "How many School Leaders and MSHMs are covered?",
    action: "Check allocation against MSHMs as the key coaching lever",
  },
  KQ05: {
    question:
      "Which activities are off track or delayed against the annual programme plan at each quarter?",
    action:
      "Take District Leads to task · identify risks and bottlenecks · understand the capacity needed to implement",
  },
  KQ06: {
    question:
      "How is the quality of Sandipani training sessions for SLs, MSHMs and teachers?",
    action:
      "Build internal capacity · strategise on content and delivery from participant feedback",
  },
  KQ07: {
    question:
      "What proportion of School Leaders and MSHMs completed trainings?",
    action:
      "Design support for absentees · diagnose reasons · refine selection for trainings",
  },
  KQ08: {
    question:
      "What proportion of relevant teachers completed planned trainings, by subject? (by gender)",
    action:
      "Design support for absentees · diagnose reasons · refine selection for trainings",
  },
  KQ10: {
    question:
      "What proportion of schools implement classroom walkthroughs with sufficient coverage, documentation and actionable feedback?",
    action:
      "Targeted coaching of MSHMs · priority visits and VCs in concerning schools · involve officials · recognise strong schools",
  },
  KQ11: {
    question:
      "What proportion of schools conduct and analyse monthly assessments to understand Dakshata and other learning levels?",
    action:
      "Coaching for low-performing schools · provide question banks · recognise strong schools",
  },
  KQ12: {
    question:
      "What proportion of schools have an institutionalised system to track student learning levels?",
    action:
      "Share school-level trackers · demos for low performers · drive SL-data conversations at every touchpoint",
  },
  KQ13: {
    question: "What proportion of schools conduct Dakshata classes consistently?",
    action:
      "Shapes training pitch for MSHMs and teachers · coach DLs on feedback · district refreshers",
  },
  KQ15: {
    question:
      "What proportion of schools conduct remediation consistently, however it is delivered?",
    action:
      "Create assessment resources mapped to competencies · check whether schools have set up differentiated support",
  },
  KQ16: {
    question:
      "What proportion of schools have an effective Academic Inchargeship in place?",
    action:
      "Training for MSHMs and P/VPs · influence state circulars on MSHM roles · strengthen follow-up · shape visit SoP",
  },
  KQ17: {
    question:
      "What proportion of schools conduct Academic Samvaad relevant to middle-grade learning levels?",
    action:
      "Influence state circulars to include middle grades · shape DL follow-up for a division or school group",
  },
  KQ21: {
    question:
      "What proportion of observed regular classes demonstrate priority teacher practices — questioning, student practice and differentiated instruction — by subject?",
    action:
      "Subject-specific resources for teachers · shape teacher training and refreshers · shape DL follow-up and CRO SoP",
  },
  KQ22: {
    question:
      "What proportion of observed classes demonstrate strong student engagement, by subject? (by teacher gender)",
    action:
      "Understand which practices drive engagement · diagnose low engagement against training data",
  },
  KQ23: {
    question:
      "What is the distribution of students across below Dakshata, Dakshata, Dakshata++, n-1 and Grade Level in internal and external assessments?",
    action:
      "Share strategies with teachers · re-think effort distribution across levels · show data to SLs, government and funders",
  },
  KQ24: {
    question:
      "How do schools compare across priority academic-process implementation, teacher practice and student learning?",
    action:
      "Revisit ToC elements and assumptions · diagnose further where the chain is breaking",
  },
}

export const OUT_OF_SCOPE_KQS = ["KQ09", "KQ14", "KQ18", "KQ19", "KQ20"]

/** Expand a card's `kq` label (e.g. "KQ10–KQ17" or "KQ07–KQ08" or "KQ03") into ids. */
export function kqIdsFor(label: string): string[] {
  if (!label) return []
  const range = label.match(/KQ(\d+)\s*–\s*KQ(\d+)/)
  if (range) {
    const out: string[] = []
    for (let n = parseInt(range[1], 10); n <= parseInt(range[2], 10); n++) {
      const id = "KQ" + String(n).padStart(2, "0")
      if (KEY_QUESTIONS[id]) out.push(id)
    }
    return out
  }
  return label
    .split(/[,·]/)
    .map((s) => s.trim())
    .filter((s) => KEY_QUESTIONS[s])
}

/** Does a card's `kq` label cover a given KQ id (handles ranges)? */
export function kqLabelCovers(label: string, id: string): boolean {
  if (!label) return false
  if (label.includes(id)) return true
  const range = label.match(/KQ(\d+)–KQ(\d+)/)
  if (!range) return false
  const n = parseInt(id.slice(2), 10)
  return n >= parseInt(range[1], 10) && n <= parseInt(range[2], 10)
}
