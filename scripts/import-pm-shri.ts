// One-off import of the PM SHRI (Peepul) key questions document into the
// live database. Not part of the demo seed — this is a real client project.
// Data lives in ./pm-shri-data.ts (shared with backfill-pm-shri.ts, which
// patched in "depends on" links and markdown-formatted definitions after
// this script had already run once).
//
// Run with: npm run import:pm-shri

import { createClient } from "@supabase/supabase-js"
import { AREAS, KQS, type IndicatorType } from "./pm-shri-data"

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

// Matches the default set every project gets (see the Phase 6 migration and
// projects/new/actions.ts). The PDF only uses Input/Output/Intermediate
// Outcome — Reach and Impact are seeded for consistency but unused here.
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

async function main() {
  console.log("Creating project: PM SHRI (Peepul)")
  const { data: project, error: projectError } = await admin
    .from("projects")
    .insert({
      name: "PM SHRI",
      client_name: "Peepul",
      slug: "pm-shri",
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
      .insert({
        project_id: projectId,
        name,
        area_number: `AOE${String(index + 1).padStart(2, "0")}`,
        sequence: index,
      })
      .select("id")
      .single()
    if (error) throw error
    areaIdByName.set(name, data.id as string)
  }
  console.log(`  ${AREAS.length} areas of enquiry`)

  const sequenceByArea = new Map<string, number>()
  const kqIdByNumber = new Map<string, string>()
  for (const kq of KQS) {
    const { status, note } = classifyDataAvailability(kq.dataAvailability)
    const sequence = sequenceByArea.get(kq.areaName) ?? 0
    const { data, error } = await admin
      .from("key_questions")
      .insert({
        project_id: projectId,
        area_of_enquiry_id: areaIdByName.get(kq.areaName),
        kq_number: kq.kqNumber,
        question_text: kq.questionText,
        short_name: kq.shortName,
        indicator_level_id: indicatorLevelIdByKey.get(kq.indicatorType),
        indicator_definition: kq.indicatorDefinition,
        action_text: kq.actionText,
        data_availability_status: status,
        data_availability_note: note,
        priority: kq.priority,
        reason_for_priority: kq.reasonForPriority,
        sequence,
      })
      .select("id")
      .single()
    if (error) throw error
    kqIdByNumber.set(kq.kqNumber, data.id as string)
    sequenceByArea.set(kq.areaName, sequence + 1)
  }
  console.log(`  ${KQS.length} key questions`)

  const links = KQS.flatMap((kq) =>
    kq.dependsOnKqNumbers.map((dependsOn) => ({
      key_question_id_a: kqIdByNumber.get(kq.kqNumber),
      key_question_id_b: kqIdByNumber.get(dependsOn),
      relationship_type: "depends_on" as const,
    }))
  )
  if (links.length > 0) {
    const { error } = await admin.from("key_question_links").insert(links)
    if (error) throw error
  }
  console.log(`  ${links.length} depends-on links`)

  console.log(`\nDone. Project id: ${projectId}`)
}

main().catch((err) => {
  console.error("Import failed:", err)
  process.exit(1)
})
