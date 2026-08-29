// Seeds the kq_navigator schema with two realistic demo projects so
// Phases 2-4 can be built and demoed against real-looking data.
//
// Run with: npm run seed
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS).

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with:\n" +
      "  node --env-file=.env.local --experimental-strip-types scripts/seed.ts\n" +
      "or via: npm run seed"
  )
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: "kq_navigator" },
  auth: { autoRefreshToken: false, persistSession: false },
})

type IndicatorType =
  | "reach"
  | "input"
  | "output"
  | "intermediate_outcome"
  | "impact"
type Priority = "high" | "medium" | "low"

interface SeedUser {
  email: string
  role: "facilitator" | "client"
}

interface SeedKq {
  kqNumber: string
  areaName: string
  indicatorType: IndicatorType
  questionText: string
  indicatorDefinition: string
  actionText: string
  primaryUser: string
  dataAvailability: string
  priority: Priority
  reasonForPriority: string
  isLocked?: boolean
}

interface SeedLink {
  from: string
  to: string
  type: "informs" | "depends_on" | "related_to"
}

interface SeedComment {
  kqNumber: string
  authorEmail: string
  commentType: "definition_suggestion" | "general"
  status: "open" | "resolved"
  text: string
}

interface SeedVote {
  indicatorType: IndicatorType
  voterEmail: string
  orderedKqNumbers: string[] // rank 1 = first element
}

interface SeedReview {
  kqNumber: string
  userEmail: string
}

interface SeedProject {
  name: string
  clientName: string
  areas: { name: string; indicatorType: IndicatorType }[]
  keyQuestions: SeedKq[]
  links: SeedLink[]
  comments: SeedComment[]
  votes: SeedVote[]
  reviews: SeedReview[]
  clientEmails: string[]
}

const FACILITATORS: SeedUser[] = [
  { email: "aisha.verma@goalkeep.net", role: "facilitator" },
  { email: "james.okafor@goalkeep.net", role: "facilitator" },
]

const AREAS = [
  { name: "Who Are We Reaching?", indicatorType: "reach" as const },
  { name: "Are We Delivering As Planned?", indicatorType: "input" as const },
  { name: "Is Quality Improving?", indicatorType: "output" as const },
  {
    name: "Are Behaviours Changing?",
    indicatorType: "intermediate_outcome" as const,
  },
  { name: "Are We Seeing Impact?", indicatorType: "impact" as const },
]

const PROJECTS: SeedProject[] = [
  {
    name: "Sunrise Community Health Initiative",
    clientName: "Sunrise Foundation",
    areas: AREAS,
    clientEmails: [
      "renu.kapoor@sunrisefoundation.org",
      "devansh.rao@sunrisefoundation.org",
    ],
    keyQuestions: [
      {
        kqNumber: "KQ01",
        areaName: "Who Are We Reaching?",
        indicatorType: "reach",
        questionText:
          "How many unique households has the program reached in the current cycle, and how does this compare to the target population?",
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
      },
      {
        kqNumber: "KQ02",
        areaName: "Who Are We Reaching?",
        indicatorType: "reach",
        questionText:
          "What proportion of reached households belong to the priority vulnerability segments defined in the program design?",
        indicatorDefinition:
          "Count of households tagged with at least one priority vulnerability flag (female-headed, below poverty line, disability present) divided by total households reached, expressed as a percentage.",
        actionText:
          "Used to check targeting accuracy against the program's original equity commitments each quarter.",
        primaryUser: "District Leads",
        dataAvailability: "Partial — vulnerability flags missing for ~18% of records",
        priority: "medium",
        reasonForPriority:
          "Important for equity reporting but data completeness needs to improve before this can drive decisions confidently.",
      },
      {
        kqNumber: "KQ07",
        areaName: "Are We Delivering As Planned?",
        indicatorType: "input",
        questionText:
          "Are field staff completing the required number of household visits per month against the staffing plan?",
        indicatorDefinition:
          "Sum of completed household visits logged by field staff per calendar month, divided by the planned visit target for that staff cohort as defined in the annual operating plan.",
        actionText:
          "If completion falls below 80% for two consecutive months, escalate to district-level staffing review.",
        primaryUser: "Program Leadership",
        dataAvailability: "Available",
        priority: "high",
        reasonForPriority:
          "Early warning indicator — delivery shortfalls here predict downstream output and outcome shortfalls by 1-2 quarters.",
      },
      {
        kqNumber: "KQ08",
        areaName: "Are We Delivering As Planned?",
        indicatorType: "input",
        questionText:
          "Are field staff completing required refresher training on the updated household survey tool?",
        indicatorDefinition:
          "Count of field staff who completed the refresher training module in the system, divided by total active field staff, per quarter.",
        actionText:
          "Staff below 90% completion are blocked from conducting surveys until refresher training is finished.",
        primaryUser: "District Leads",
        dataAvailability: "Available",
        priority: "low",
        reasonForPriority:
          "An operational gate rather than a leading indicator, but necessary for data quality.",
      },
      {
        kqNumber: "KQ09",
        areaName: "Are We Delivering As Planned?",
        indicatorType: "input",
        questionText:
          "What is the average training hours delivered per field staff member, relative to the certification requirement?",
        indicatorDefinition:
          "Total logged training hours per staff member in the training management system, divided by the minimum certification threshold (40 hours/year).",
        actionText:
          "Flag staff below 75% of the requirement for mandatory catch-up sessions before the next review cycle.",
        primaryUser: "District Leads",
        dataAvailability: "Available",
        priority: "low",
        reasonForPriority:
          "Useful operationally but not a strong predictor of program outcomes on its own.",
      },
      {
        kqNumber: "KQ12",
        areaName: "Is Quality Improving?",
        indicatorType: "output",
        questionText:
          "What percentage of household visits meet the minimum quality checklist score during spot-check audits?",
        indicatorDefinition:
          "Count of spot-checked visits scoring at or above 80% on the standardized quality checklist, divided by total spot-checked visits in the period.",
        actionText:
          "Below 75% pass rate in a district triggers a refresher training and a repeat audit the following month.",
        primaryUser: "Program Leadership",
        dataAvailability: "Available",
        priority: "high",
        reasonForPriority:
          "Directly tied to the program's core quality commitment and is the leading indicator most sensitive to staff performance changes.",
      },
      {
        kqNumber: "KQ13",
        areaName: "Is Quality Improving?",
        indicatorType: "output",
        questionText:
          "What percentage of household referrals to partner clinics result in a completed visit within 30 days?",
        indicatorDefinition:
          "Count of referrals with a confirmed clinic visit within 30 days of referral, divided by total referrals made in that period.",
        actionText:
          "If completion falls below 60%, the referral follow-up team increases reminder call frequency.",
        primaryUser: "Program Leadership",
        dataAvailability: "Partial — clinic confirmation data delayed by up to 6 weeks",
        priority: "medium",
        reasonForPriority:
          "A meaningful quality signal once the clinic-side reporting lag is resolved.",
      },
      {
        kqNumber: "KQ15",
        areaName: "Is Quality Improving?",
        indicatorType: "output",
        questionText:
          "How many households report their concerns being resolved within the committed 7-day window?",
        indicatorDefinition:
          "Count of grievances with a logged resolution timestamp within 7 days of the logged submission timestamp, divided by total grievances submitted in the period.",
        actionText:
          "Used to hold the grievance redressal team accountable to the client-facing service standard.",
        primaryUser: "Program Leadership",
        dataAvailability: "Partial — resolution timestamps inconsistently logged before March",
        priority: "medium",
        reasonForPriority:
          "Meaningful for client trust, but historical data gaps limit trend analysis until the logging fix takes effect.",
      },
      {
        kqNumber: "KQ21",
        areaName: "Are Behaviours Changing?",
        indicatorType: "intermediate_outcome",
        questionText:
          "What proportion of reached caregivers demonstrate the target childcare practice at the 6-month follow-up survey?",
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
      },
      {
        kqNumber: "KQ26",
        areaName: "Are We Seeing Impact?",
        indicatorType: "impact",
        questionText:
          "Has the target population shown a statistically significant improvement in the core wellbeing index compared to baseline?",
        indicatorDefinition:
          "Difference between the current-cycle wellbeing index score (composite of 12 validated survey items) and the baseline score for the same panel of households, tested for statistical significance at p<0.05.",
        actionText:
          "Reported annually to the funder as the primary evidence of program impact; informs whether the program model is renewed or revised.",
        primaryUser: "Program Leadership",
        dataAvailability: "Available",
        priority: "high",
        reasonForPriority:
          "This is the headline impact claim the entire program is accountable for.",
      },
    ],
    links: [
      { from: "KQ01", to: "KQ07", type: "informs" },
      { from: "KQ07", to: "KQ12", type: "depends_on" },
      { from: "KQ08", to: "KQ12", type: "depends_on" },
      { from: "KQ09", to: "KQ12", type: "depends_on" },
      { from: "KQ12", to: "KQ21", type: "informs" },
      { from: "KQ13", to: "KQ21", type: "informs" },
      { from: "KQ15", to: "KQ21", type: "related_to" },
      { from: "KQ21", to: "KQ26", type: "informs" },
    ],
    comments: [
      {
        kqNumber: "KQ01",
        authorEmail: "renu.kapoor@sunrisefoundation.org",
        commentType: "definition_suggestion",
        status: "resolved",
        text: "Can we clarify whether 'eligible household population' uses census data or our own baseline survey figures? These two sources gave us different denominators last year.",
      },
      {
        kqNumber: "KQ01",
        authorEmail: "aisha.verma@goalkeep.net",
        commentType: "general",
        status: "resolved",
        text: "Updated the definition to specify baseline survey as the source of truth for the denominator, per client feedback.",
      },
      {
        kqNumber: "KQ02",
        authorEmail: "renu.kapoor@sunrisefoundation.org",
        commentType: "general",
        status: "open",
        text: "Worth noting this on the dashboard with a data-quality caveat until the missing flags are backfilled.",
      },
      {
        kqNumber: "KQ09",
        authorEmail: "devansh.rao@sunrisefoundation.org",
        commentType: "definition_suggestion",
        status: "open",
        text: "Should refresher training for existing staff count the same as onboarding training for new hires? Right now they're combined.",
      },
      {
        kqNumber: "KQ21",
        authorEmail: "renu.kapoor@sunrisefoundation.org",
        commentType: "general",
        status: "resolved",
        text: "This is the one we care about most for the board update — glad it's flagged high priority.",
      },
      {
        kqNumber: "KQ26",
        authorEmail: "devansh.rao@sunrisefoundation.org",
        commentType: "definition_suggestion",
        status: "open",
        text: "Can we also show the effect size, not just significance? A p-value alone won't mean much to our board.",
      },
    ],
    votes: [
      {
        indicatorType: "reach",
        voterEmail: "aisha.verma@goalkeep.net",
        orderedKqNumbers: ["KQ01", "KQ02"],
      },
      {
        indicatorType: "reach",
        voterEmail: "renu.kapoor@sunrisefoundation.org",
        orderedKqNumbers: ["KQ01", "KQ02"],
      },
      {
        indicatorType: "input",
        voterEmail: "aisha.verma@goalkeep.net",
        orderedKqNumbers: ["KQ07", "KQ09", "KQ08"],
      },
      {
        indicatorType: "input",
        voterEmail: "james.okafor@goalkeep.net",
        orderedKqNumbers: ["KQ07", "KQ08", "KQ09"],
      },
      {
        indicatorType: "output",
        voterEmail: "aisha.verma@goalkeep.net",
        orderedKqNumbers: ["KQ12", "KQ15", "KQ13"],
      },
      {
        indicatorType: "output",
        voterEmail: "devansh.rao@sunrisefoundation.org",
        orderedKqNumbers: ["KQ12", "KQ13", "KQ15"],
      },
    ],
    reviews: [
      { kqNumber: "KQ01", userEmail: "renu.kapoor@sunrisefoundation.org" },
      { kqNumber: "KQ01", userEmail: "devansh.rao@sunrisefoundation.org" },
      { kqNumber: "KQ02", userEmail: "renu.kapoor@sunrisefoundation.org" },
      { kqNumber: "KQ21", userEmail: "renu.kapoor@sunrisefoundation.org" },
      { kqNumber: "KQ21", userEmail: "devansh.rao@sunrisefoundation.org" },
      { kqNumber: "KQ26", userEmail: "renu.kapoor@sunrisefoundation.org" },
    ],
  },
  {
    name: "Riverside Youth Employment Program",
    clientName: "Riverside Trust",
    areas: AREAS,
    clientEmails: [
      "priya.nair@riversidetrust.org",
      "marcus.webb@riversidetrust.org",
    ],
    keyQuestions: [
      {
        kqNumber: "RY-KQ01",
        areaName: "Who Are We Reaching?",
        indicatorType: "reach",
        questionText:
          "How many unemployed young people (18-24) has the program enrolled this quarter, relative to the intake target?",
        indicatorDefinition:
          "Count of unique youth participant IDs with a completed intake form in the reporting period, divided by the quarterly intake target set in the program plan.",
        actionText:
          "If enrollment falls below 80% of target for two consecutive months, escalate to the outreach team for a recruitment push.",
        primaryUser: "Program Leadership",
        dataAvailability: "Available",
        priority: "high",
        reasonForPriority:
          "Directly tracks whether the program is on pace to meet its annual placement commitments.",
      },
      {
        kqNumber: "RY-KQ02",
        areaName: "Who Are We Reaching?",
        indicatorType: "reach",
        questionText:
          "What proportion of enrolled youth come from the priority under-resourced neighbourhoods targeted by the program?",
        indicatorDefinition:
          "Count of enrolled youth whose registered address falls within the five priority postal codes, divided by total enrolled youth.",
        actionText:
          "Used to check whether outreach efforts are reaching the intended neighbourhoods each quarter.",
        primaryUser: "District Leads",
        dataAvailability: "Partial — address data missing for ~10% of early cohort records",
        priority: "medium",
        reasonForPriority:
          "Important for equity reporting, though early records need backfilling before trends are reliable.",
      },
      {
        kqNumber: "RY-KQ03",
        areaName: "Are We Delivering As Planned?",
        indicatorType: "input",
        questionText:
          "Are job coaches completing the required number of one-on-one coaching sessions per participant per month?",
        indicatorDefinition:
          "Sum of completed one-on-one sessions logged per coach per month, divided by the target of 4 sessions per active participant.",
        actionText:
          "Coaches below 75% completion for a month are flagged for a caseload review with their supervisor.",
        primaryUser: "Program Leadership",
        dataAvailability: "Available",
        priority: "high",
        reasonForPriority:
          "Coaching intensity is the strongest input-level predictor of participant retention.",
      },
      {
        kqNumber: "RY-KQ04",
        areaName: "Are We Delivering As Planned?",
        indicatorType: "input",
        questionText:
          "What is the average number of employer partnerships actively hosting placements each quarter?",
        indicatorDefinition:
          "Count of distinct employer partners with at least one active work placement in the quarter.",
        actionText:
          "If active partnerships drop below 15, the employer engagement team runs a targeted outreach campaign.",
        primaryUser: "District Leads",
        dataAvailability: "Available",
        priority: "low",
        reasonForPriority:
          "A useful operational signal, but not itself evidence that placements are leading to real jobs.",
      },
      {
        kqNumber: "RY-KQ05",
        areaName: "Is Quality Improving?",
        indicatorType: "output",
        questionText:
          "What percentage of participants complete the full 8-week job-readiness training module?",
        indicatorDefinition:
          "Count of participants who attended at least 90% of the 8-week training sessions, divided by total enrolled participants for that cohort.",
        actionText:
          "Cohorts below 70% completion trigger a review of session scheduling and transport support.",
        primaryUser: "Program Leadership",
        dataAvailability: "Available",
        priority: "high",
        reasonForPriority:
          "Training completion is the clearest output-level checkpoint before placement begins.",
      },
      {
        kqNumber: "RY-KQ06",
        areaName: "Is Quality Improving?",
        indicatorType: "output",
        questionText:
          "What proportion of completed resumes and mock interviews meet the coach-assessed readiness bar?",
        indicatorDefinition:
          "Count of participants scoring at or above the readiness threshold on the standardized coach assessment, divided by total participants assessed that month.",
        actionText:
          "Used to identify which coaching cohorts need additional readiness support before placement.",
        primaryUser: "District Leads",
        dataAvailability: "Partial — assessment scores not consistently logged before June",
        priority: "medium",
        reasonForPriority:
          "Meaningful quality signal, but historical gaps limit trend analysis for now.",
      },
      {
        kqNumber: "RY-KQ10",
        areaName: "Is Quality Improving?",
        indicatorType: "output",
        questionText:
          "What proportion of participants report feeling 'confident' or 'very confident' in job interview skills after training?",
        indicatorDefinition:
          "Count of participants selecting 'confident' or 'very confident' on the post-training self-assessment survey, divided by total survey respondents.",
        actionText:
          "Used alongside the coach-assessed readiness bar to triangulate training quality each cohort.",
        primaryUser: "District Leads",
        dataAvailability: "Available",
        priority: "low",
        reasonForPriority:
          "A useful self-reported complement to the coach assessment, though less objective on its own.",
      },
      {
        kqNumber: "RY-KQ07",
        areaName: "Are Behaviours Changing?",
        indicatorType: "intermediate_outcome",
        questionText:
          "What proportion of job-ready participants secure a placement interview within 30 days of training completion?",
        indicatorDefinition:
          "Count of participants with at least one logged interview within 30 days of training completion, divided by total participants who completed training that month.",
        actionText:
          "If conversion falls below 50%, review the employer-matching process with the placement team.",
        primaryUser: "Program Leadership",
        dataAvailability: "Available",
        priority: "high",
        reasonForPriority:
          "This is the strongest early signal that training is translating into real employer interest.",
      },
      {
        kqNumber: "RY-KQ08",
        areaName: "Are Behaviours Changing?",
        indicatorType: "intermediate_outcome",
        questionText:
          "Of participants placed in jobs, what proportion remain employed at the 90-day mark?",
        indicatorDefinition:
          "Count of placed participants still employed (self-reported or employer-confirmed) at 90 days post-placement, divided by total participants placed in that cohort.",
        actionText:
          "Retention below 60% at 90 days triggers a review of post-placement support and employer fit.",
        primaryUser: "Program Leadership",
        dataAvailability: "Available",
        priority: "high",
        reasonForPriority:
          "Retention, not just placement, is what the funder and participants ultimately care about.",
        isLocked: true,
      },
      {
        kqNumber: "RY-KQ09",
        areaName: "Are We Seeing Impact?",
        indicatorType: "impact",
        questionText:
          "Has the program's target cohort shown a statistically significant increase in average monthly income compared to baseline?",
        indicatorDefinition:
          "Difference between current self-reported average monthly income and baseline income for the same panel of participants, tested for statistical significance at p<0.05.",
        actionText:
          "Reported annually to the funder as the primary evidence of the program's economic impact.",
        primaryUser: "Program Leadership",
        dataAvailability: "Available",
        priority: "high",
        reasonForPriority:
          "This is the headline economic outcome the program is ultimately accountable for.",
      },
    ],
    links: [
      { from: "RY-KQ01", to: "RY-KQ03", type: "informs" },
      { from: "RY-KQ03", to: "RY-KQ05", type: "depends_on" },
      { from: "RY-KQ04", to: "RY-KQ05", type: "depends_on" },
      { from: "RY-KQ05", to: "RY-KQ07", type: "informs" },
      { from: "RY-KQ06", to: "RY-KQ07", type: "related_to" },
      { from: "RY-KQ10", to: "RY-KQ07", type: "related_to" },
      { from: "RY-KQ07", to: "RY-KQ08", type: "related_to" },
      { from: "RY-KQ08", to: "RY-KQ09", type: "informs" },
    ],
    comments: [
      {
        kqNumber: "RY-KQ02",
        authorEmail: "priya.nair@riversidetrust.org",
        commentType: "general",
        status: "open",
        text: "Can we flag this on the dashboard as provisional until the address backfill is complete?",
      },
      {
        kqNumber: "RY-KQ06",
        authorEmail: "marcus.webb@riversidetrust.org",
        commentType: "definition_suggestion",
        status: "open",
        text: "What's the readiness threshold exactly? Worth spelling out the score cutoff in the definition itself.",
      },
      {
        kqNumber: "RY-KQ08",
        authorEmail: "priya.nair@riversidetrust.org",
        commentType: "general",
        status: "resolved",
        text: "Retention is what our board asks about most — glad this is locked in as high priority.",
      },
      {
        kqNumber: "RY-KQ09",
        authorEmail: "james.okafor@goalkeep.net",
        commentType: "general",
        status: "resolved",
        text: "Confirmed with the client this uses self-reported income only for now — administrative payroll data isn't accessible yet.",
      },
    ],
    votes: [
      {
        indicatorType: "output",
        voterEmail: "james.okafor@goalkeep.net",
        orderedKqNumbers: ["RY-KQ05", "RY-KQ06", "RY-KQ10"],
      },
      {
        indicatorType: "output",
        voterEmail: "priya.nair@riversidetrust.org",
        orderedKqNumbers: ["RY-KQ05", "RY-KQ10", "RY-KQ06"],
      },
      {
        indicatorType: "intermediate_outcome",
        voterEmail: "james.okafor@goalkeep.net",
        orderedKqNumbers: ["RY-KQ08", "RY-KQ07"],
      },
      {
        indicatorType: "intermediate_outcome",
        voterEmail: "marcus.webb@riversidetrust.org",
        orderedKqNumbers: ["RY-KQ07", "RY-KQ08"],
      },
    ],
    reviews: [
      { kqNumber: "RY-KQ08", userEmail: "priya.nair@riversidetrust.org" },
      { kqNumber: "RY-KQ08", userEmail: "marcus.webb@riversidetrust.org" },
      { kqNumber: "RY-KQ09", userEmail: "priya.nair@riversidetrust.org" },
    ],
  },
]

async function ensureUser(email: string): Promise<string> {
  const { data: list, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })
  if (listError) throw listError
  const existing = list.users.find((u) => u.email === email)
  if (existing) return existing.id

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
  })
  if (error) throw error
  return data.user.id
}

async function seedProject(project: SeedProject, userIdByEmail: Map<string, string>) {
  console.log(`\nSeeding project: ${project.name}`)

  const { data: projectRow, error: projectError } = await admin
    .from("projects")
    .insert({ name: project.name, client_name: project.clientName })
    .select("id")
    .single()
  if (projectError) throw projectError
  const projectId = projectRow.id as string

  const areaIdByName = new Map<string, string>()
  for (const [index, area] of project.areas.entries()) {
    const { data, error } = await admin
      .from("areas_of_enquiry")
      .insert({ project_id: projectId, name: area.name, sequence: index })
      .select("id")
      .single()
    if (error) throw error
    areaIdByName.set(area.name, data.id as string)
  }

  const kqIdByNumber = new Map<string, string>()
  for (const [index, kq] of project.keyQuestions.entries()) {
    const { data, error } = await admin
      .from("key_questions")
      .insert({
        project_id: projectId,
        area_of_enquiry_id: areaIdByName.get(kq.areaName),
        kq_number: kq.kqNumber,
        question_text: kq.questionText,
        indicator_type: kq.indicatorType,
        indicator_definition: kq.indicatorDefinition,
        action_text: kq.actionText,
        primary_user: kq.primaryUser,
        data_availability: kq.dataAvailability,
        priority: kq.priority,
        reason_for_priority: kq.reasonForPriority,
        is_locked: kq.isLocked ?? false,
        sequence: index,
      })
      .select("id")
      .single()
    if (error) throw error
    kqIdByNumber.set(kq.kqNumber, data.id as string)
  }
  console.log(`  ${project.keyQuestions.length} key questions`)

  if (project.links.length > 0) {
    const { error } = await admin.from("key_question_links").insert(
      project.links.map((l) => ({
        key_question_id_a: kqIdByNumber.get(l.from),
        key_question_id_b: kqIdByNumber.get(l.to),
        relationship_type: l.type,
      }))
    )
    if (error) throw error
    console.log(`  ${project.links.length} links`)
  }

  if (project.comments.length > 0) {
    const { error } = await admin.from("key_question_comments").insert(
      project.comments.map((c) => ({
        key_question_id: kqIdByNumber.get(c.kqNumber),
        author_id: userIdByEmail.get(c.authorEmail),
        comment_text: c.text,
        comment_type: c.commentType,
        status: c.status,
      }))
    )
    if (error) throw error
    console.log(`  ${project.comments.length} comments`)
  }

  const voteRows = project.votes.flatMap((v) =>
    v.orderedKqNumbers.map((kqNumber, i) => ({
      key_question_id: kqIdByNumber.get(kqNumber),
      voter_id: userIdByEmail.get(v.voterEmail),
      rank_within_type: i + 1,
    }))
  )
  if (voteRows.length > 0) {
    const { error } = await admin.from("key_question_priority_votes").insert(voteRows)
    if (error) throw error
    console.log(`  ${voteRows.length} priority votes`)
  }

  if (project.reviews.length > 0) {
    const { error } = await admin.from("key_question_client_reviews").insert(
      project.reviews.map((r) => ({
        key_question_id: kqIdByNumber.get(r.kqNumber),
        user_id: userIdByEmail.get(r.userEmail),
      }))
    )
    if (error) throw error
    console.log(`  ${project.reviews.length} client reviews`)
  }

  const { error: accessError } = await admin.from("project_access").insert(
    project.clientEmails.map((email) => ({
      project_id: projectId,
      user_id: userIdByEmail.get(email),
      invited_email: email,
    }))
  )
  if (accessError) throw accessError
  console.log(`  ${project.clientEmails.length} client access grants`)
}

async function main() {
  const allEmails = new Set<string>()
  for (const f of FACILITATORS) allEmails.add(f.email)
  for (const p of PROJECTS) {
    for (const email of p.clientEmails) allEmails.add(email)
    for (const c of p.comments) allEmails.add(c.authorEmail)
    for (const v of p.votes) allEmails.add(v.voterEmail)
    for (const r of p.reviews) allEmails.add(r.userEmail)
  }

  console.log(`Ensuring ${allEmails.size} demo auth users exist…`)
  const userIdByEmail = new Map<string, string>()
  for (const email of allEmails) {
    const id = await ensureUser(email)
    userIdByEmail.set(email, id)
  }

  for (const project of PROJECTS) {
    await seedProject(project, userIdByEmail)
  }

  console.log("\nSeed complete.")
}

main().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
