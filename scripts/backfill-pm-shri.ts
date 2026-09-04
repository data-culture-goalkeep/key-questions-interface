// One-off backfill for the PM SHRI (Peepul) project, run once against data
// that import-pm-shri.ts had already inserted without depends-on links or
// markdown-formatted indicator definitions. Reuses the same KQS data (see
// ./pm-shri-data.ts) so the two scripts never drift apart.
//
// Run with: npm run backfill:pm-shri

import { createClient } from "@supabase/supabase-js"
import { KQS } from "./pm-shri-data"

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

async function main() {
  const { data: project, error: projectError } = await admin
    .from("projects")
    .select("id")
    .eq("slug", "pm-shri")
    .single()
  if (projectError) throw projectError
  const projectId = project.id as string

  const { data: existing, error: kqError } = await admin
    .from("key_questions")
    .select("id, kq_number")
    .eq("project_id", projectId)
  if (kqError) throw kqError
  const kqIdByNumber = new Map<string, string>(
    existing.map((k) => [k.kq_number as string, k.id as string])
  )

  for (const kq of KQS) {
    const id = kqIdByNumber.get(kq.kqNumber)
    if (!id) throw new Error(`No existing KQ found for ${kq.kqNumber}`)
    const { error } = await admin
      .from("key_questions")
      .update({ indicator_definition: kq.indicatorDefinition })
      .eq("id", id)
    if (error) throw error
  }
  console.log(`Updated indicator_definition for ${KQS.length} key questions`)

  const { count: existingLinkCount, error: existingLinkError } = await admin
    .from("key_question_links")
    .select("id", { count: "exact", head: true })
    .eq("relationship_type", "depends_on")
    .in("key_question_id_a", [...kqIdByNumber.values()])
  if (existingLinkError) throw existingLinkError
  if ((existingLinkCount ?? 0) > 0) {
    console.log(
      `Skipping links insert — ${existingLinkCount} depends_on links already exist for this project.`
    )
  } else {
    const links = KQS.flatMap((kq) =>
      kq.dependsOnKqNumbers.map((dependsOn) => ({
        key_question_id_a: kqIdByNumber.get(kq.kqNumber),
        key_question_id_b: kqIdByNumber.get(dependsOn),
        relationship_type: "depends_on" as const,
      }))
    )
    const { error } = await admin.from("key_question_links").insert(links)
    if (error) throw error
    console.log(`Inserted ${links.length} depends-on links`)
  }

  console.log("\nDone.")
}

main().catch((err) => {
  console.error("Backfill failed:", err)
  process.exit(1)
})
