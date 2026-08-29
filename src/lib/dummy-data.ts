export type IndicatorType =
  | "reach"
  | "input"
  | "output"
  | "intermediate_outcome"
  | "impact"

export type Priority = "high" | "medium" | "low"

export const INDICATOR_LEVELS: {
  value: IndicatorType
  label: string
  chart: 1 | 2 | 3 | 4 | 5
}[] = [
  { value: "reach", label: "Reach", chart: 1 },
  { value: "input", label: "Input", chart: 2 },
  { value: "output", label: "Output", chart: 3 },
  { value: "intermediate_outcome", label: "Intermediate Outcome", chart: 4 },
  { value: "impact", label: "Impact", chart: 5 },
]

export interface DummyComment {
  id: string
  authorName: string
  authorRole: "facilitator" | "client"
  commentType: "definition_suggestion" | "general"
  status: "open" | "resolved"
  text: string
  createdAt: string
}

export interface DummyKeyQuestion {
  id: string
  areaOfEnquiry: string
  questionText: string
  indicatorType: IndicatorType
  indicatorDefinition: string
  actionText: string
  primaryUser: string
  dataAvailability: string
  priority: Priority
  reasonForPriority: string
  isLocked: boolean
  verifiedByCount: number
  comments: DummyComment[]
}

export const DUMMY_KEY_QUESTIONS: DummyKeyQuestion[] = [
  {
    id: "KQ01",
    areaOfEnquiry: "Who Are We Reaching?",
    questionText:
      "How many unique households has the program reached in the current cycle, and how does this compare to the target population?",
    indicatorType: "reach",
    indicatorDefinition:
      "Count of unique household IDs with at least one recorded touchpoint in the reporting period, divided by the estimated eligible household population in the same geography. Deduplicated on household ID, not individual beneficiary ID.",
    actionText:
      "If reach falls below 70% of target in a given district, flag for a targeted outreach push the following quarter.",
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "Directly informs whether the program is on track to meet its scale commitments to the funder.",
    isLocked: true,
    verifiedByCount: 3,
    comments: [
      {
        id: "c1",
        authorName: "Renu Kapoor",
        authorRole: "client",
        commentType: "definition_suggestion",
        status: "resolved",
        text: "Can we clarify whether 'eligible household population' uses census data or our own baseline survey figures? These two sources gave us different denominators last year.",
        createdAt: "2026-08-12",
      },
      {
        id: "c2",
        authorName: "Aisha Verma",
        authorRole: "facilitator",
        commentType: "general",
        status: "resolved",
        text: "Updated the definition to specify baseline survey as the source of truth for the denominator, per client feedback.",
        createdAt: "2026-08-14",
      },
    ],
  },
  {
    id: "KQ02",
    areaOfEnquiry: "Who Are We Reaching?",
    questionText:
      "What proportion of reached households belong to the priority vulnerability segments defined in the program design?",
    indicatorType: "reach",
    indicatorDefinition:
      "Count of households tagged with at least one priority vulnerability flag (female-headed, below poverty line, disability present) divided by total households reached, expressed as a percentage.",
    actionText:
      "Used to check targeting accuracy against the program's original equity commitments each quarter.",
    primaryUser: "District Leads",
    dataAvailability: "Partial — vulnerability flags missing for ~18% of records",
    priority: "medium",
    reasonForPriority:
      "Important for equity reporting but data completeness needs to improve before this can drive decisions confidently.",
    isLocked: false,
    verifiedByCount: 1,
    comments: [
      {
        id: "c3",
        authorName: "Renu Kapoor",
        authorRole: "client",
        commentType: "general",
        status: "open",
        text: "Worth noting this on the dashboard with a data-quality caveat until the missing flags are backfilled.",
        createdAt: "2026-08-20",
      },
    ],
  },
  {
    id: "KQ07",
    areaOfEnquiry: "Are We Delivering As Planned?",
    questionText:
      "Are field staff completing the required number of household visits per month against the staffing plan?",
    indicatorType: "input",
    indicatorDefinition:
      "Sum of completed household visits logged by field staff per calendar month, divided by the planned visit target for that staff cohort as defined in the annual operating plan.",
    actionText:
      "If completion falls below 80% for two consecutive months, escalate to district-level staffing review.",
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "Early warning indicator — delivery shortfalls here predict downstream output and outcome shortfalls by 1-2 quarters.",
    isLocked: false,
    verifiedByCount: 0,
    comments: [],
  },
  {
    id: "KQ09",
    areaOfEnquiry: "Are We Delivering As Planned?",
    questionText:
      "What is the average training hours delivered per field staff member, relative to the certification requirement?",
    indicatorType: "input",
    indicatorDefinition:
      "Total logged training hours per staff member in the training management system, divided by the minimum certification threshold (40 hours/year).",
    actionText:
      "Flag staff below 75% of the requirement for mandatory catch-up sessions before the next review cycle.",
    primaryUser: "District Leads",
    dataAvailability: "Available",
    priority: "low",
    reasonForPriority:
      "Useful operationally but not a strong predictor of program outcomes on its own.",
    isLocked: false,
    verifiedByCount: 0,
    comments: [
      {
        id: "c4",
        authorName: "Devansh Rao",
        authorRole: "client",
        commentType: "definition_suggestion",
        status: "open",
        text: "Should refresher training for existing staff count the same as onboarding training for new hires? Right now they're combined.",
        createdAt: "2026-08-22",
      },
    ],
  },
  {
    id: "KQ12",
    areaOfEnquiry: "Is Quality Improving?",
    questionText:
      "What percentage of household visits meet the minimum quality checklist score during spot-check audits?",
    indicatorType: "output",
    indicatorDefinition:
      "Count of spot-checked visits scoring at or above 80% on the standardized quality checklist, divided by total spot-checked visits in the period.",
    actionText:
      "Below 75% pass rate in a district triggers a refresher training and a repeat audit the following month.",
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "Directly tied to the program's core quality commitment and is the leading indicator most sensitive to staff performance changes.",
    isLocked: false,
    verifiedByCount: 2,
    comments: [],
  },
  {
    id: "KQ15",
    areaOfEnquiry: "Is Quality Improving?",
    questionText:
      "How many households report their concerns being resolved within the committed 7-day window?",
    indicatorType: "output",
    indicatorDefinition:
      "Count of grievances with a logged resolution timestamp within 7 days of the logged submission timestamp, divided by total grievances submitted in the period.",
    actionText:
      "Used to hold the grievance redressal team accountable to the client-facing service standard.",
    primaryUser: "Program Leadership",
    dataAvailability: "Partial — resolution timestamps inconsistently logged before March",
    priority: "medium",
    reasonForPriority:
      "Meaningful for client trust, but historical data gaps limit trend analysis until the logging fix takes effect.",
    isLocked: false,
    verifiedByCount: 0,
    comments: [],
  },
  {
    id: "KQ21",
    areaOfEnquiry: "Are Behaviours Changing?",
    questionText:
      "What proportion of reached caregivers demonstrate the target childcare practice at the 6-month follow-up survey?",
    indicatorType: "intermediate_outcome",
    indicatorDefinition:
      "Count of caregivers observed or self-reporting the target practice at the 6-month follow-up, divided by total caregivers surveyed at that milestone. Follow-up survey uses the validated behavioural observation tool.",
    actionText:
      "If adoption is below 50% at 6 months, review the behaviour-change messaging and frequency of household touchpoints in that segment.",
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "This is the strongest early signal of whether the program logic is translating into real behaviour change ahead of the longer-term impact survey.",
    isLocked: true,
    verifiedByCount: 3,
    comments: [
      {
        id: "c5",
        authorName: "Renu Kapoor",
        authorRole: "client",
        commentType: "general",
        status: "resolved",
        text: "This is the one we care about most for the board update — glad it's flagged high priority.",
        createdAt: "2026-08-10",
      },
    ],
  },
  {
    id: "KQ26",
    areaOfEnquiry: "Are We Seeing Impact?",
    questionText:
      "Has the target population shown a statistically significant improvement in the core wellbeing index compared to baseline?",
    indicatorType: "impact",
    indicatorDefinition:
      "Difference between the current-cycle wellbeing index score (composite of 12 validated survey items) and the baseline score for the same panel of households, tested for statistical significance at p<0.05.",
    actionText:
      "Reported annually to the funder as the primary evidence of program impact; informs whether the program model is renewed or revised.",
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "This is the headline impact claim the entire program is accountable for.",
    isLocked: false,
    verifiedByCount: 1,
    comments: [
      {
        id: "c6",
        authorName: "Devansh Rao",
        authorRole: "client",
        commentType: "definition_suggestion",
        status: "open",
        text: "Can we also show the effect size, not just significance? A p-value alone won't mean much to our board.",
        createdAt: "2026-08-25",
      },
    ],
  },
]

export const DUMMY_LINKS: {
  from: string
  to: string
  type: "informs" | "depends_on" | "related_to"
}[] = [
  { from: "KQ01", to: "KQ07", type: "informs" },
  { from: "KQ07", to: "KQ12", type: "depends_on" },
  { from: "KQ09", to: "KQ12", type: "depends_on" },
  { from: "KQ12", to: "KQ21", type: "informs" },
  { from: "KQ15", to: "KQ21", type: "related_to" },
  { from: "KQ21", to: "KQ26", type: "informs" },
]

export const DUMMY_PROJECT = {
  name: "Sunrise Community Health Initiative",
  clientName: "Sunrise Foundation",
}
