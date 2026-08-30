// One-off import of the real Sandipani Vidyalayas (Peepul) key questions
// document into the live database. Not part of the demo seed — this is a
// real client project.
//
// Source: "Peepul Phase 3 - Sandipani KQs - KQs - post prioritization.pdf"
//
// Indicator-type mapping note: the source document uses a 4-level scheme
// (Input, Output, Intermediate Outcome, Outcome) with no separate "Reach"
// tier — reach-type questions (KQ01-04) are typed "Input" in the source.
// The schema's indicator_type enum is fixed to 5 values ending in "impact",
// so the source's top-level "Outcome" is mapped to "impact" here (same
// position in the results chain, different label). No KQ in this project
// uses the "reach" enum value as a result.
//
// Run with: npm run import:sandipani

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
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

// Matches the default set every project gets (see the Phase 6 migration and
// projects/new/actions.ts).
const INDICATOR_LEVELS: {
  key: IndicatorType
  label: string
  number_label: string
  sequence: number
}[] = [
  { key: "reach", label: "Reach", number_label: "1", sequence: 1 },
  { key: "input", label: "Input", number_label: "2", sequence: 2 },
  { key: "output", label: "Output", number_label: "3", sequence: 3 },
  {
    key: "intermediate_outcome",
    label: "Intermediate Outcome",
    number_label: "4",
    sequence: 4,
  },
  { key: "impact", label: "Impact", number_label: "5", sequence: 5 },
]

type DataAvailabilityStatus =
  | "fully_available"
  | "partially_available"
  | "not_available"

function classifyDataAvailability(text: string): {
  status: DataAvailabilityStatus
  note: string
} {
  if (/^available$/i.test(text)) return { status: "fully_available", note: "" }
  if (/^available/i.test(text)) return { status: "fully_available", note: text }
  if (/^partial/i.test(text)) return { status: "partially_available", note: text }
  return { status: "not_available", note: text }
}

interface Kq {
  kqNumber: string
  areaName: string
  indicatorType: IndicatorType
  questionText: string
  indicatorDefinition: string
  actionText: string
  primaryUser: string
  dataAvailability: string
  priority: "high" | "medium" | "low"
  reasonForPriority: string
}

const AREAS = [
  "WHO ARE WE REACHING?",
  "ARE WE EXECUTING OUR PROGRAM AS PER PLAN?",
  "DO WE HAVE THE INTERNAL CAPACITY TO DELIVER WELL?",
  "ARE WE BUILDING CAPACITY?",
  "ARE PRIORITY ACADEMIC PROCESSES BEING IMPLEMENTED?",
  "ARE TEACHERS CHANGING PRACTICE?",
  "ARE STUDENTS BENEFITING?",
  "HOW ARE SCHOOLS PERFORMING ACROSS THE RESULTS CHAIN?",
]

const REACH_ACTION =
  "1. Check right allocation, reach\n2. Quickly report numbers for any report such as funders\n3. Whom are we directly reaching vs indirectly and how do we expand this circle of reach"

const KQS: Kq[] = [
  {
    kqNumber: "KQ01",
    areaName: "WHO ARE WE REACHING?",
    indicatorType: "input",
    questionText: "How many Sandipani schools are covered?",
    indicatorDefinition: "Count of Sandipani schools",
    actionText: REACH_ACTION,
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "Core programme denominator",
  },
  {
    kqNumber: "KQ02",
    areaName: "WHO ARE WE REACHING?",
    indicatorType: "input",
    questionText: "How many students in Grades 6–8 are covered? (by gender)",
    indicatorDefinition:
      "Count of enrolled students in Grades 6–8 in Sandipani schools",
    actionText: REACH_ACTION,
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "Agreed middle-grade scope",
  },
  {
    kqNumber: "KQ03",
    areaName: "WHO ARE WE REACHING?",
    indicatorType: "input",
    questionText:
      "How many middle-grade teachers are supported through the Peepul-Sandipani programme? (by gender)",
    indicatorDefinition:
      "Count of current middle-grade teachers in Sandipani schools at the latest twice-yearly count",
    actionText: REACH_ACTION,
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "Core programme denominator",
  },
  {
    kqNumber: "KQ04",
    areaName: "WHO ARE WE REACHING?",
    indicatorType: "input",
    questionText: "How many School Leaders and MSHMs are covered?",
    indicatorDefinition:
      "Count of School Leaders and MSHMs covered, disaggregated by role",
    actionText: REACH_ACTION,
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "MSHMs are a key coaching lever",
  },
  {
    kqNumber: "KQ05",
    areaName: "ARE WE EXECUTING OUR PROGRAM AS PER PLAN?",
    indicatorType: "input",
    questionText:
      "Which activities are off track/delayed against the annual programme plan at each quarter?",
    indicatorDefinition:
      "list of activities where status = 'off track' or 'delayed' by quarter",
    actionText:
      "1) Take DLs to task\n2) Identify risks, bottlenecks, challenges and take actions to support implementation\n3) Get better understanding of the capacity/ resources needed to implement effectively/ comprehensively",
    primaryUser: "Program Leadership & PMU",
    dataAvailability:
      "Partial: Individual planning sheets exist; dashboard mapping and update cadence are to be established",
    priority: "high",
    reasonForPriority:
      "Shashvat identified planning and progress tracking as a core PMU responsibility. Howver, this may not be the most actionable.",
  },
  {
    kqNumber: "KQ06",
    areaName: "DO WE HAVE THE INTERNAL CAPACITY TO DELIVER WELL?",
    indicatorType: "output",
    questionText:
      "How is the quality of Sandipani training sessions for SLs, MSHMs and teachers?",
    indicatorDefinition:
      "Composite of -\n% of Peepul-led observed Training session where facilitator rated at least Beginning Proficiency or higher\n% of Peepul-led observed Trainings where >50% participants rated the session 3 or higher on usefulness for content\n% of Peepul-led observed Trainings where >50% participants rated the session 3 or higher on usefulness of delivery",
    actionText:
      "1. Internal Capacity Building\n2. Strategising on content and delivery based on teacher's feedback",
    primaryUser: "Program Leadership",
    dataAvailability:
      "Available through existing observation tools; calculation methodology to be confirmed",
    priority: "high",
    reasonForPriority:
      "Only a one-time observation, might not indicate ability to provide coaching/feedback",
  },
  {
    kqNumber: "KQ07",
    areaName: "ARE WE BUILDING CAPACITY?",
    indicatorType: "output",
    questionText:
      "What proportion of School Leaders and MSHMs completed trainings?",
    indicatorDefinition:
      "School Leaders and MSHMs completing training ÷ total relevant School Leaders and MSHMs\ntargeted School Leaders and MSHMs completing training ÷ total relevant School Leaders and MSHMs",
    actionText:
      "1. Design and implement trainings/other support mechanisms for absentees.\n2. Diagnose reasons for abseentism\n3. Refine selection processes off SL/MSHMs for trainings",
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "School Leaders and MSHMs are a critical lever for transformation",
  },
  {
    kqNumber: "KQ08",
    areaName: "ARE WE BUILDING CAPACITY?",
    indicatorType: "output",
    questionText:
      "What proportion of relevant teachers completed planned trainings, by subject? (by gender)",
    indicatorDefinition:
      "total teachers completing planned training ÷ Teachers relevant for training, by subject\nrelevant teachers completing planned training ÷ Teachers relevant for training, by subject",
    actionText:
      "1. Design and implement trainings/other support mechanisms for absentees.\n2. Diagnose reasons for abseentism\n3. Refine selection processes off SL/MSHMs for trainings",
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "Training must be reviewed subject-wise",
  },
  {
    kqNumber: "KQ10",
    areaName: "ARE PRIORITY ACADEMIC PROCESSES BEING IMPLEMENTED?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools implement classroom walkthroughs with sufficient coverage, documentation and actionable feedback?",
    indicatorDefinition:
      "Key indicator: % of schools where the following criteria are met:\n1. More than 50% of middle-grade teachers were observed by MSHMs in the last two months and the observations were documented.\n2. Feedback included specific observations and actionable suggestions.\n3. % of schools where interviewed teachers report receiving actionable feedback after a classroom walkthrough.",
    actionText:
      "1. Targeted coaching of MSHMs.\n2. Develop and implement plans for priority vists and VCs in concerning schools\n3. Involve officials for accountability mechanisms\n4. Develop and implement rewards and recognition strategies for well-performing schools; highlight their good practices.",
    primaryUser: "District Leads",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "One of the five priority academic processes; CWs ensure MSHM is actively providing academic mentoring to the teachers",
  },
  {
    kqNumber: "KQ11",
    areaName: "ARE PRIORITY ACADEMIC PROCESSES BEING IMPLEMENTED?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools conduct and analyse monthly assessments to understand Dakshata & other learning levels?",
    indicatorDefinition:
      "Key indicator: % of schools where the following criteria are met:\n1. Monthly assessments included Dakshata, Dakshata++, n-1 and Grade Level competency-based questions across all middle grades, for all 3 subjects.",
    actionText:
      "1. Coaching support for low-performing schools (Visits + VCs)\n2. Provide resources (eg question banks, including Dakshata Questions)\n3. Develop and implement rewards and recognition strategies for well-performing schools; highlight their good practices.",
    primaryUser: "District Leads",
    dataAvailability:
      "Available; exact qiestion numbers & response options to be noted post finalising the definition",
    priority: "high",
    reasonForPriority:
      "One of the five priority academic processes; formative assessments enforced by the govt based on Peepul's recommendation",
  },
  {
    kqNumber: "KQ12",
    areaName: "ARE PRIORITY ACADEMIC PROCESSES BEING IMPLEMENTED?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools have institutionalised system to track student learning levels?",
    indicatorDefinition:
      "Key indicator: % of schools where the following criteria are met:\n1. School records maintain learning-level categories—Dakshata, Dakshata++, n-1 and Grade Level.\n2. MSHM knowledge of learning levels is based on recent Dakshata BL/EL, monthly assessment or spot-check data.",
    actionText:
      "1. Design and share school-level trackers for low-performing schools\n2. Give demos and orientations to low-performing schools\n3. Drive focused conversations around SL data for all touch points.\n4. Develop and implement rewards and recognition strategies for well-performing schools; highlight their good practices.",
    primaryUser: "District Leads",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "One of the five priority academic processes; ensures school's focus on SLO is evidence-based",
  },
  {
    kqNumber: "KQ13",
    areaName: "ARE PRIORITY ACADEMIC PROCESSES BEING IMPLEMENTED?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools conduct Dakshata classes consistently?",
    indicatorDefinition:
      "% of schools where\n1. Students requiring Dakshata support are continuously identified after the baseline\n2. at least one structured Dakshata support mechanism is in use—zero period, separate section, separate class or another documented mechanism.",
    actionText:
      "1. Influences/contributes to what we pitch in the training for both MSHMs and teachers\n2. Coaching DLs on how to give feedback for these specific issues.\n3. District level refreshers/CBI for teachers and SLs.",
    primaryUser: "District Leads",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "One of the five priority academic processes; influences/contributes to what we pitch in the training for both MSHMs and teachers",
  },
  {
    kqNumber: "KQ15",
    areaName: "ARE PRIORITY ACADEMIC PROCESSES BEING IMPLEMENTED?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools conduct remediation consistently, regardless of whether it is delivered through a zero period, separate classes, timetable-integrated periods or differentiated support within the classroom?",
    indicatorDefinition:
      "Key indicator: % of schools conducting remediation where the following criteria are met:\n1. Competencies or concepts for remediation are identified using assessment evidence.\n2. Students are grouped or supported differently according to identified learning gaps.",
    actionText:
      "1. Consider creating assessment resources mapped to competencies and chapters that can be used by the schools/ teachers.\n2. Identify whether schools have set up zero period, separate class, etc for differentiated support to students.",
    primaryUser: "District Leads",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "One of the five priority academic processes; remediation addresses grade-specific gaps to help improve grade-level aachievement",
  },
  {
    kqNumber: "KQ16",
    areaName: "ARE PRIORITY ACADEMIC PROCESSES BEING IMPLEMENTED?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools have an effective Academic Inchargeship in place?",
    indicatorDefinition:
      "Key indicator: % of schools where the following Academic Inchargeship criteria are met:\n1. MSHM is managing academic monitoring for middle grades\n2. Middle-grade priorities are documented in school goals or plans.\n3. The P/VP provides consistent support to the MSHM or designated academic lead.",
    actionText:
      "1. Training and refreshers for MSHMs and P/VPs.\n2. Influencing policy and circulars of the State on MSHM roles and responsibilities, middle grade specific focus on learning levels etc.\n3. Strengthen follow-up activities for the schools in need of support.\n4. Influences school-visit plan and the SoP for school visits.\n5. Influences coaching strategies for SLs.",
    primaryUser: "District Leads",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "Influences school-visit plan and the SoP for school visits.\nInfluences coaching strategies for SLs.\nInfluencing policy and circulars of the State on MSHM roles and responsibilities, middle grade specific focus on learning levels etc.",
  },
  {
    kqNumber: "KQ17",
    areaName: "ARE PRIORITY ACADEMIC PROCESSES BEING IMPLEMENTED?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools conduct Academic Samvaad that is relevant to middle-grade student learning levels?",
    indicatorDefinition:
      "Key indicator: % of schools where Academic Samvaad was conducted or documented within the last 1–2 months with middle-grade priorities (either directly observed or referenced)",
    actionText:
      "1. Infleunce circulars and policies of State to reinforce inclusion of middle grades in Academic Samvad.\n2. Influences follow-up activities of DLs for a division or a group of their schools to strengthen Academic Samvad.",
    primaryUser: "District Leads",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "The discussion noted that high uptake can still be low-value when meetings focus on board grades rather than middle-grade learning needs",
  },
  {
    kqNumber: "KQ21",
    areaName: "ARE TEACHERS CHANGING PRACTICE?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of observed regular classes demonstrate priority teacher practices—questioning, student practice and differentiated instruction—by subject? (by gender)",
    indicatorDefinition:
      "For each subject, observed classes demonstrating questioning, student practice and differentiated instruction ÷ classes observed; percentage distribution across the agreed combined teacher-practice rubric",
    actionText:
      "1. Subject-specific resources that need to be provided to teachers\n2. Influence teacher training and refresher planning\n3. Influence follow-up activities of DL, SoP for CRO and feedback to MSHMs.",
    primaryUser: "District Leads",
    dataAvailability:
      "Available; exact qiestion numbers & response options to be noted post finalising the definition",
    priority: "high",
    reasonForPriority: "Tracks the classroom change pathway",
  },
  {
    kqNumber: "KQ22",
    areaName: "ARE TEACHERS CHANGING PRACTICE?",
    indicatorType: "impact",
    questionText:
      "What proportion of observed classes demonstrate strong student engagement, by subject? (by gender of teacher)",
    indicatorDefinition:
      "Observed classes meeting the agreed student-engagement rubric ÷ classes observed, by subject",
    actionText:
      "1) Understand teacher practices that are likely driving student engagement\n2) Understand lack of which practices are driving low engagement\n3) Look at other parts of the dashboard (e.g. training etc.) to diagnose what is working or not.",
    primaryUser: "District Leads",
    dataAvailability:
      "Available; exact qiestion numbers & response options to be noted post finalising the definition",
    priority: "high",
    reasonForPriority:
      "Student engagement is a primary focus & direct result of chnaging teacher practice",
  },
  {
    kqNumber: "KQ23",
    areaName: "ARE STUDENTS BENEFITING?",
    indicatorType: "impact",
    questionText:
      "What is the distribution of students across below Dakshata, Dakshata, Dakshata++, n-1 and Grade Level in internal & external assessments, by grade and subject? (by gender)",
    indicatorDefinition:
      "Percentage of assessed students at Dakshata minus, Dakshata, Dakshata++ and Grade Level, by grade and subject; the four categories must total 100% of assessed students\nData for English spot assessments to be kept separate",
    actionText:
      "1) Specific sharing of strategies with teachers\n2) Re-think distribution of our efforts on different levels of students\n3) Show data to SLs, gov stakeholders, funders",
    primaryUser: "Program Leadership",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "Spot assessments are the agreed primary learning source for understanding SLO in an ongoing way. External assessments will show year on year growth",
  },
  {
    kqNumber: "KQ24",
    areaName: "HOW ARE SCHOOLS PERFORMING ACROSS THE RESULTS CHAIN?",
    indicatorType: "impact",
    questionText:
      "How do schools compare across priority academic-process implementation, teacher practice and student learning?",
    indicatorDefinition:
      "School-level heatmap displaying:\n1. Priority academic-process implementation: High, Medium or Low, based on the KQ18 rubric.\n2. Teacher practice: % of observed classrooms with Strong teacher practice and % with Weak teacher practice, using the agreed CRO rubric.\n3. Student learning: students at Dakshata level ÷ assessed students, with grade and subject filters.",
    actionText:
      "1) Make changes to TOC elements/ assumptions\n2) Where chain is breaking down, diagnose further",
    primaryUser: "Program Leadership & District Leads",
    dataAvailability:
      "Partial: requires aligned school-level SVF, CRO and assessment data for the same reporting period",
    priority: "high",
    reasonForPriority: "Provides a school-level heatmap across the results chain",
  },
]

async function main() {
  console.log("Creating project: Sandipani Vidyalayas (Peepul)")
  const { data: project, error: projectError } = await admin
    .from("projects")
    .insert({
      name: "Sandipani Vidyalayas",
      client_name: "Peepul",
      slug: "sandipani-vidyalayas",
    })
    .select("id")
    .single()
  if (projectError) throw projectError
  const projectId = project.id as string

  const { data: levelRows, error: levelsError } = await admin
    .from("indicator_levels")
    .insert(INDICATOR_LEVELS.map((l) => ({ ...l, project_id: projectId })))
    .select("id, key")
  if (levelsError) throw levelsError
  const indicatorLevelIdByKey = new Map<string, string>(
    levelRows.map((l) => [l.key as string, l.id as string])
  )

  const areaIdByName = new Map<string, string>()
  for (const [index, name] of AREAS.entries()) {
    const { data, error } = await admin
      .from("areas_of_enquiry")
      .insert({ project_id: projectId, name, sequence: index })
      .select("id")
      .single()
    if (error) throw error
    areaIdByName.set(name, data.id as string)
  }
  console.log(`  ${AREAS.length} areas of enquiry`)

  for (const [index, kq] of KQS.entries()) {
    const { status, note } = classifyDataAvailability(kq.dataAvailability)
    const { error } = await admin.from("key_questions").insert({
      project_id: projectId,
      area_of_enquiry_id: areaIdByName.get(kq.areaName),
      kq_number: kq.kqNumber,
      question_text: kq.questionText,
      indicator_level_id: indicatorLevelIdByKey.get(kq.indicatorType),
      indicator_definition: kq.indicatorDefinition,
      action_text: kq.actionText,
      primary_user: kq.primaryUser,
      data_availability_status: status,
      data_availability_note: note,
      priority: kq.priority,
      reason_for_priority: kq.reasonForPriority,
      sequence: index,
    })
    if (error) throw error
  }
  console.log(`  ${KQS.length} key questions`)

  console.log(`\nDone. Project id: ${projectId}`)
}

main().catch((err) => {
  console.error("Import failed:", err)
  process.exit(1)
})
