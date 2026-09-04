// Shared data for the PM SHRI (Peepul) project — single source of truth for
// both the initial import (import-pm-shri.ts) and the depends-on-links /
// markdown-formatting backfill (backfill-pm-shri.ts) that followed it.
//
// Source: "KQs Template - PMSHRI _ July 2026 - Surya's Copy.pdf"
//
// Renumbering note: the source PDF's own KQ IDs (KQ_01..KQ_22) skip three
// rows that have no ID printed at all (two under "Who are we reaching?" —
// ADPC/DEO reach and DAMs with DLs — and one under "Do we have internal
// capacity to deliver well?" — training quality for MTs, right after the
// SLs row). Per client direction, the sequence was renumbered in document
// order instead of inserting sub-letter IDs, so kq_number here (KQ01..KQ25)
// does not line up 1:1 with the PDF's own KQ_NN labels from KQ_05 onward —
// e.g. KQ07 here is the PDF's KQ_05.
//
// Depends-on note: the app's "depends on" picker only allows a KQ to depend
// on another KQ at a strictly earlier indicator-level stage (see
// kq-form-dialog.tsx's dependsOnCandidatesByLevel). This PDF only uses
// Input/Output/Intermediate Outcome, so every dependsOnKqNumbers entry below
// points at an earlier-stage KQ under that constraint — these are a
// best-guess results-chain reading of the PDF's own narrative (training
// completion/quality feeding process adoption, coverage feeding output),
// not values stated explicitly in the source document.

export type IndicatorType =
  | "reach"
  | "input"
  | "output"
  | "intermediate_outcome"
  | "impact"

export const AREAS = [
  "Who are we reaching?",
  "Do we have internal capacity to deliver well?",
  "Are we building capacity?",
  "Are the priority academic processes being driven?",
  "Are teachers changing practice?",
  "Are Students Benefiting?",
  "What are the early warning signs?",
]

// Renders the indicator definition as markdown: the related-indicator
// description, then a bolded "Calculation" block (a bullet list when the
// source PDF's calculation was itself a composite of multiple parts), then
// optional KPI/Target paragraphs — rendered via the KQ form's
// ReactMarkdown preview.
export function md(
  relatedIndicator: string,
  calculation: string | string[],
  kpi?: string,
  target?: string
): string {
  const calcBlock = Array.isArray(calculation)
    ? calculation.map((c) => `- ${c}`).join("\n")
    : calculation
  let text = `${relatedIndicator}\n\n**Calculation:**\n${calcBlock}`
  if (kpi) text += `\n\n**KPI:** ${kpi}`
  if (target) text += `\n\n**Target:** ${target}`
  return text
}

export interface Kq {
  kqNumber: string
  areaName: string
  indicatorType: IndicatorType
  questionText: string
  shortName: string
  indicatorDefinition: string
  actionText: string
  dataAvailability: string
  priority: "high" | "medium" | "low"
  reasonForPriority: string
  // kq_number values (within this array) this KQ depends on — must all be
  // at a strictly earlier indicator level, matching the app's picker.
  dependsOnKqNumbers: string[]
}

export const KQS: Kq[] = [
  {
    kqNumber: "KQ01",
    areaName: "Who are we reaching?",
    indicatorType: "input",
    questionText: "How many PMSHRI schools are covered?",
    shortName: "PMSHRI school coverage",
    indicatorDefinition: md(
      "Total Schools under programme intervention",
      "Count of PMSHRI schools reached",
      "No",
      "No"
    ),
    actionText: "To understand the scale and reach of the target numbers",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "To understand the volume of the programme will act as denominator for later indicators",
    dependsOnKqNumbers: [],
  },
  {
    kqNumber: "KQ02",
    areaName: "Who are we reaching?",
    indicatorType: "input",
    questionText: "How many students in Grades 6–8 are covered?",
    shortName: "Student coverage (Grades 6–8)",
    indicatorDefinition: md(
      "Total students under programme intervention",
      "Count of enrolled students in Grades 6–8 in PMSHRI schools",
      "No",
      "No"
    ),
    actionText: "To understand the scale and reach to target beneficiaries",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "Will able to understand the actual result of Peepul interventions",
    dependsOnKqNumbers: [],
  },
  {
    kqNumber: "KQ03",
    areaName: "Who are we reaching?",
    indicatorType: "input",
    questionText: "How many School leaders are covered in PMSHRI programmes?",
    shortName: "School leader coverage",
    indicatorDefinition: md(
      "Total School leaders under programme intervention",
      "Count of PMSHRI schools leaders reached",
      "No",
      "No"
    ),
    actionText: "To understand the scale and reach to target beneficiaries",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "Will able to understand the output-level of Peepul interventions",
    dependsOnKqNumbers: [],
  },
  {
    kqNumber: "KQ04",
    areaName: "Who are we reaching?",
    indicatorType: "input",
    questionText:
      "How is programme coverage distributed across divisions, districts and schools?",
    shortName: "Coverage by division/district",
    indicatorDefinition: md(
      "Total district, division wise coverage of the programme",
      "Count of PMSHRI schools reached in each division and districts",
      "No",
      "No"
    ),
    actionText:
      "To understand the programme intervention equity distribution in the division and districts",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "Showcase the focals on why and where we need more intervention points",
    dependsOnKqNumbers: [],
  },
  {
    kqNumber: "KQ05",
    areaName: "Who are we reaching?",
    indicatorType: "input",
    questionText: "How many ADPCs/DEOs we are reaching?",
    shortName: "ADPC/DEO reach",
    indicatorDefinition: md(
      "Total ADPCs/DEOs we are targeted to reach",
      "Count of ADPC/DEO we are trying to reach"
    ),
    actionText: "To understand the touch points on system for change",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "It will work as denominator for later training for them.",
    dependsOnKqNumbers: [],
  },
  {
    kqNumber: "KQ06",
    areaName: "Who are we reaching?",
    indicatorType: "input",
    questionText: "How many DAMs with DLs?",
    shortName: "DAMs with DL co-facilitation",
    indicatorDefinition: md(
      "Total DAMs where DLs will co-facilitate",
      "Count of DAMs with DL as Cofacilitator"
    ),
    actionText: "To understand the strength of input to whole PMSHRI population",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "It will work as denominator for DAMs we facilitate",
    dependsOnKqNumbers: [],
  },
  {
    kqNumber: "KQ07",
    areaName: "Do we have internal capacity to deliver well?",
    indicatorType: "input",
    questionText: "How many SLs and MTs trainings are planned for the year?",
    shortName: "SL/MT trainings planned",
    indicatorDefinition: md(
      "Total trainings planned (aspirational)",
      "Milestones of the year will define",
      "No",
      "No"
    ),
    actionText: "To know aspirational figure",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "Shows the level that we wanted to achieve for the year",
    dependsOnKqNumbers: [],
  },
  {
    kqNumber: "KQ08",
    areaName: "Do we have internal capacity to deliver well?",
    indicatorType: "output",
    questionText: "How is the quality of PMSHRI training sessions for SLs?",
    shortName: "Training quality — SLs",
    indicatorDefinition: md(
      "% of trainers delivered trainings in good quality (Good- defined by indicator calculation to cross certain benchmark defined by org definitions)",
      [
        "% of Peepul-led observed Training session where facilitator rated at least Beginning Proficiency or higher",
        "% of Peepul-led observed Trainings where >50% participants rated the session 3 or higher on usefulness",
      ],
      "Yes",
      "Facilitator should be ideally at higher or medium proficiency in observed training sessions and participant find it useful on 3 or more scale"
    ),
    actionText:
      "To understand the quality of the trainings as input to evaluate the stakeholders' performances later as output of the activity",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "To understand the level we are standing on the quality front of the trainings",
    dependsOnKqNumbers: ["KQ03", "KQ07"],
  },
  {
    kqNumber: "KQ09",
    areaName: "Do we have internal capacity to deliver well?",
    indicatorType: "output",
    questionText: "How is the quality of PMSHRI training sessions for MTs?",
    shortName: "Training quality — MTs",
    indicatorDefinition: md(
      "% of trainers delivered trainings in good quality (Good- defined by indicator calculation to cross certain benchmark defined by org definitions)",
      [
        "% of Peepul-led observed Training session where facilitator rated at least Beginning Proficiency or higher",
        "% of Peepul-led observed Trainings where >50% participants rated the session 3 or higher on usefulness",
      ],
      "Yes",
      "Facilitator should be ideally at higher or medium proficiency in observed training sessions and participant find it useful on 3 or more scale"
    ),
    actionText:
      "To understand the quality of the trainings as input to evaluate the stakeholders' performances later as output of the activity",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "To understand the level we are standing on the quality front of the trainings",
    dependsOnKqNumbers: ["KQ07"],
  },
  {
    kqNumber: "KQ10",
    areaName: "Are we building capacity?",
    indicatorType: "output",
    questionText: "What proportion of School Leaders and MTs completed planned trainings?",
    shortName: "SL/MT training completion",
    indicatorDefinition: md(
      "%of trainings happened for SLs and MTs",
      "School Leaders and MTs completing planned training ÷ total School Leaders and MTs training planned",
      "Yes",
      "At least 2 trainings should be delivered to MTs and SLs combined"
    ),
    actionText: "To understand actual v/s target of trainings",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "To understand the level we are standing on the completion of planned trainings - shows efficiency",
    dependsOnKqNumbers: ["KQ03", "KQ07"],
  },
  {
    kqNumber: "KQ11",
    areaName: "Are we building capacity?",
    indicatorType: "output",
    questionText: "What proportion of teachers completed planned cascade training, by subject?",
    shortName: "Teacher cascade training completion",
    indicatorDefinition: md(
      "%of trainings happened for teachers through MTs",
      "Teachers completing planned training ÷ total number of teachers",
      "No",
      "No"
    ),
    actionText: "To understand actual v/s target of teachers",
    dataAvailability: "Available",
    priority: "medium",
    reasonForPriority:
      "It will be an indication to how many teachers we could reach but could not do much about increase in number drastically due to capacity constraints in cascade trainings",
    dependsOnKqNumbers: ["KQ07"],
  },
  {
    kqNumber: "KQ12",
    areaName: "Are we building capacity?",
    indicatorType: "output",
    questionText:
      "What proportion of participants (teachers/SLs/MTs) complete both pre- and post-training assessments, find it useful, by subject?",
    shortName: "Training usefulness (pre/post)",
    indicatorDefinition: md(
      "%of trainings where the participants find it useful training",
      [
        "Average score pre to post subject wise change",
        "Average Participants' scored more than 3/total score",
      ],
      "Yes",
      "Participants' scoring more than 3"
    ),
    actionText:
      "Actual participant usefulness could determine need of upskilling or facilitation rigor of the trainings from the participants side",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "It can be used as an indication of restructuring or reviewing the existing planning of the trainings if needed or otherwise to maintain it will need stability plans",
    dependsOnKqNumbers: ["KQ07"],
  },
  {
    kqNumber: "KQ13",
    areaName: "Are we building capacity?",
    indicatorType: "output",
    questionText:
      "What proportion of participants (teachers/SLs/MTs) complete both pre- and post-training assessments, and what are their learning gains, by subject?",
    shortName: "Training learning gains",
    indicatorDefinition: md(
      "% of trainings with more than 70% of the learning gain",
      [
        "Number of trainings with more than 70% learning gain/Participants completing both pre- and post-tests",
        "Number of trainings with more than 70% learning gain/participants trained, by subject",
      ],
      "Yes",
      "Yet to decide the rubric for best, medium and low levels of the training gains"
    ),
    actionText:
      "Actual participant gain could determine need of upskilling or facilitation rigor needs afterwards in the trainings",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "It can be used as an indication of restructuring or reviewing the existing planning of the trainings if needed or otherwise to maintain it will need stability plans",
    dependsOnKqNumbers: ["KQ07"],
  },
  {
    kqNumber: "KQ14",
    areaName: "Are the priority academic processes being driven?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools have initiated classroom walkthroughs by the P/VP, Academic Coordinator, or any designated School Leader?",
    shortName: "Classroom walkthroughs initiated",
    indicatorDefinition: md(
      "% of schools initiated the CWTs through designated leaderships",
      "Number of schools initiated the CWTs through leadership (P/VPs, SLs, Academic coordinator) ÷ total number of schools got visited",
      "Yes",
      "Yet to decide the rubric for best, medium and low levels of the numbers"
    ),
    actionText:
      "Number of adoption is important for further rigor of the intervention and visits",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "High priority is due to the need to understand the programme level adoption in the schools and later programme rigor depends on it",
    dependsOnKqNumbers: ["KQ08", "KQ10"],
  },
  {
    kqNumber: "KQ15",
    areaName: "Are the priority academic processes being driven?",
    indicatorType: "intermediate_outcome",
    questionText:
      "Of schools where walkthroughs have begun, what proportion maintain basic documentation and provide feedback to teachers?",
    shortName: "CWT documentation & feedback",
    indicatorDefinition: md(
      "% of schools initiated the CWTs through designated leaderships has proper documentation",
      "Number of SLs document it in their workplan/total SLs got trained (want to confirm on the procedures shared with SLs for documenting those)"
    ),
    actionText:
      "To ensure quality of adoption and double confirmation that they are adopting those (for monitoring purpose)",
    dataAvailability: "Availability to be finalized from the team in documented format",
    priority: "high",
    reasonForPriority:
      "Priority is for keeping them tracked in the beginning itself so that it will ensure the degree of adoption visible for proper planning laterwards",
    dependsOnKqNumbers: ["KQ08", "KQ10"],
  },
  {
    kqNumber: "KQ16",
    areaName: "Are the priority academic processes being driven?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools record and review monthly assessment results to identify student learning needs?",
    shortName: "Monthly assessment review",
    indicatorDefinition: md(
      "% of Schools keeping the information source from monthly assessments",
      "Number of schools using monthly assessments for identification of student levels/total number of SLs got trained"
    ),
    actionText: "To drive the culture of using monthly assessment for assessing students on their levels",
    dataAvailability: "Availability to be finalized from the team in documented format",
    priority: "high",
    reasonForPriority:
      "Priority is for keeping them tracked in the beginning itself so that it will ensure the proper planning laterwards",
    dependsOnKqNumbers: ["KQ10"],
  },
  {
    kqNumber: "KQ17",
    areaName: "Are the priority academic processes being driven?",
    indicatorType: "intermediate_outcome",
    questionText: "What proportion of schools have initiated Dakshata classes for students?",
    shortName: "Dakshata classes initiated",
    indicatorDefinition: md(
      "% of schools initiated Dakshata classes for students",
      "Number of schools with Dakshata period or separate Dakshata classes/Total number of schools trained",
      "Yes",
      "Yet to build"
    ),
    actionText: "To build the Dakshata classes for students on the basis of learning levels",
    dataAvailability: "Availability to be finalized from the team in documented format",
    priority: "high",
    reasonForPriority: "Priority is understanding the Dakshata prioritization in the schools",
    dependsOnKqNumbers: ["KQ10"],
  },
  {
    kqNumber: "KQ18",
    areaName: "Are the priority academic processes being driven?",
    indicatorType: "intermediate_outcome",
    questionText: "How district review meetings are driving academic lens to the discussions?",
    shortName: "Academic lens in DAMs",
    indicatorDefinition: md(
      "%of DAMs involves academic lens",
      "Number of DAMs have academic agendas/Total number of DAMs planned",
      "Yes",
      "Have to discuss with team"
    ),
    actionText:
      "To drive system level initiative for Academic discussions which involves driving the intervention to Low touch schools",
    dataAvailability: "Availability to be finalized from the team in documented format",
    priority: "high",
    reasonForPriority:
      "Priority is higher because it is the touch point to low engagement schools and intervention channel can be opened",
    dependsOnKqNumbers: ["KQ06"],
  },
  {
    kqNumber: "KQ19",
    areaName: "Are the priority academic processes being driven?",
    indicatorType: "intermediate_outcome",
    questionText: "What proportion of schools are conducting remediation for identified students?",
    shortName: "FLN remediation",
    indicatorDefinition: md(
      "% of schools conducting remediation (FLN) for students",
      "Number of schools conducting remediation at the FLN level/total trained schools",
      "Yes",
      "Yet to build"
    ),
    actionText:
      "To build the foundation learning classes conducting at schools. This will be a foundation level indication",
    dataAvailability: "Availability to be finalized from the team in documented format",
    priority: "high",
    reasonForPriority:
      "It will help for understanding the FLN prioritization in the schools on need basis",
    dependsOnKqNumbers: ["KQ10"],
  },
  {
    kqNumber: "KQ20",
    areaName: "Are the priority academic processes being driven?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools have identified/designated an Academic In-charge or equivalent school-level academic lead?",
    shortName: "Academic In-charge designated",
    indicatorDefinition: md(
      "% of Schools with Academic in-chargeship for Dakshata",
      "Number of schools have Academic in-charge for Dakshata/Total schools of intervention",
      "No",
      "No"
    ),
    actionText:
      "To build system level change in the school leadership, this will act as foundational indicator",
    dataAvailability: "Availability to be finalized from the team in documented format",
    priority: "medium",
    reasonForPriority:
      "Medium priority due to the heavy dependency on the system to form new and also priority is given due to the next level need of such inchargeship in the school for the proper scaling of SV to PMSHRI",
    dependsOnKqNumbers: ["KQ03"],
  },
  {
    kqNumber: "KQ21",
    areaName: "Are the priority academic processes being driven?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools have initiated Academic Samvaad focused on middle-grade teaching?",
    shortName: "Academic Samvaad initiated",
    indicatorDefinition: md(
      "% of Schools do Academic Samvaad",
      "Number of schools does Academic Samvaad/total schools under PMSHRI intervention",
      "No",
      "No"
    ),
    actionText: "Initiation of Academic Samvaad in the schools to build it up in the system",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "To initiate process to build academic samvaad in the system to follow. It is required to keep school level details in the initial phase",
    dependsOnKqNumbers: ["KQ06"],
  },
  {
    kqNumber: "KQ22",
    areaName: "Are the priority academic processes being driven?",
    indicatorType: "intermediate_outcome",
    questionText:
      "What proportion of schools have initiated all three priority cultural practices, and what proportion have initiated at least two of the three?",
    shortName: "Priority cultural practices",
    indicatorDefinition: md(
      "% of schools have initiated all three priority cultural practices and what proportion have initiated at least 2 of 3?",
      [
        "% of schools initiated all 3 cultural practices",
        "% of schools initiated at least 2 out of 3 cultural practice",
      ],
      "Yes",
      "Percentage of schools have initiated all three priority cultural practices and what proportion have initiated at least 2 of 3"
    ),
    actionText:
      "Could create the indication of the processes happening in the schools overall will help for the rigor planning later",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority:
      "For the planning of the academic processes annually or bi-annually to restructure the rigor this indicator is very helpful",
    dependsOnKqNumbers: ["KQ08", "KQ10"],
  },
  {
    kqNumber: "KQ23",
    areaName: "Are teachers changing practice?",
    indicatorType: "output",
    questionText:
      "What proportion of teachers receive classroom observation and feedback from District Leads and from SLs?",
    shortName: "Teacher feedback (CWT/CRO)",
    indicatorDefinition: md(
      "% of teachers getting the feedback through the CWT and CRO",
      "Number of teachers getting the feedbacks/total no of teachers",
      "No",
      "No"
    ),
    actionText:
      "Helps identify the proportion of teachers who are receiving feedback from School Leaders, providing an early indication of whether the feedback system is taking root and informing the level of intervention and rigor required to strengthen it.",
    dataAvailability: "Available",
    priority: "high",
    reasonForPriority: "Needed for programme planning",
    dependsOnKqNumbers: ["KQ03"],
  },
  {
    kqNumber: "KQ24",
    areaName: "Are Students Benefiting?",
    indicatorType: "output",
    questionText:
      "What proportion of observed classes demonstrate strong student engagement, by subject?",
    shortName: "Student engagement in class",
    indicatorDefinition: md(
      "% of classes have high student engagements",
      "Number of classes observed shown more than threshold level of engagement subject wise/Number of classes observed in total",
      "No",
      "No"
    ),
    actionText:
      "Help to understand student are actually engaging due to the engagements by teachers and SLs, if not why, if yes how to improve them more",
    dataAvailability: "Available",
    priority: "medium",
    reasonForPriority:
      "Need to understand the level of importance team have on student level engagements at the initial phase of intervention",
    dependsOnKqNumbers: ["KQ02"],
  },
  {
    kqNumber: "KQ25",
    areaName: "What are the early warning signs?",
    indicatorType: "output",
    questionText:
      "Which divisions or districts show a high concentration of early warning signs that may constrain programme implementation?",
    shortName: "Early warning signs by district",
    indicatorDefinition: md(
      "Number of divisions and districts have constraints in implementation",
      "Number of divisions and districts have constraints in implementation (have to identify the constraints which will be relevant as to move forward it will form as a risk to be discussed considering the maturity of the programme)",
      "No",
      "No"
    ),
    actionText: "Identify the risks and help better planned on the constraints and predict better",
    dataAvailability: "Availability to be finalized from the team in documented format",
    priority: "medium",
    reasonForPriority:
      "Initial phased programme might have lot of risks, identify potential ones will be little difficult",
    dependsOnKqNumbers: ["KQ04"],
  },
]
