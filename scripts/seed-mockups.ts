/**
 * Seeds the mockup_navigator schema for the Sandipani dashboard review tool:
 * the fixed list of 12 reviewers and the single example comment thread on
 * element 1.3 of view v1.
 *
 * Run: npm run seed:mockups
 * Idempotent — upserts reviewers by name, and only inserts the example thread
 * if it isn't already present.
 */
import { createClient } from "@supabase/supabase-js"

import {
  REVIEW_GROUPS,
  reviewGroupFor,
} from "../src/lib/mockup/content/reviewers"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (see .env.local).",
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  db: { schema: "mockup_navigator" },
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // --- reviewers ---
  const rows = REVIEW_GROUPS.flatMap((g) =>
    g.members.map((name) => ({ name, review_group: reviewGroupFor(name) })),
  )
  const { error: upsertErr } = await supabase
    .from("sandipani_reviewers")
    .upsert(rows, { onConflict: "name" })
  if (upsertErr) throw upsertErr
  console.log(`✓ ${rows.length} reviewers upserted`)

  const { data: reviewers, error: readErr } = await supabase
    .from("sandipani_reviewers")
    .select("id, name")
  if (readErr) throw readErr
  const idByName = new Map((reviewers ?? []).map((r) => [r.name, r.id]))

  // --- example thread on v1 : 1.3 ---
  const { data: existing, error: existErr } = await supabase
    .from("sandipani_comments")
    .select("id")
    .eq("is_example", true)
    .limit(1)
  if (existErr) throw existErr
  if (existing && existing.length > 0) {
    console.log("✓ example thread already present — skipping")
    return
  }

  const shil = idByName.get("Shil")
  const ashish = idByName.get("Ashish")
  if (!shil || !ashish) throw new Error("Seeded reviewers Shil/Ashish not found")

  const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString()
  const oneDayAgo = new Date(Date.now() - 86_400_000).toISOString()

  const { data: root, error: rootErr } = await supabase
    .from("sandipani_comments")
    .insert({
      reviewer_id: shil,
      scope: "element",
      view_id: "v1",
      element_num: "1.3",
      body: "Subject split is in KQ03 but not on this card — we can't tell whether Maths teacher coverage is the gap without leaving the view.",
      is_example: true,
      created_at: twoDaysAgo,
    })
    .select("id")
    .single()
  if (rootErr) throw rootErr

  const { error: replyErr } = await supabase.from("sandipani_comments").insert({
    reviewer_id: ashish,
    scope: "element",
    view_id: "v1",
    element_num: "1.3",
    parent_id: root.id,
    body: "Agreed. 1.7 covers it, but it should sit next to the scorecard rather than below the table.",
    is_example: true,
    created_at: oneDayAgo,
  })
  if (replyErr) throw replyErr

  console.log("✓ example thread seeded on v1 : 1.3")
}

main().then(
  () => {
    console.log("Done.")
    process.exit(0)
  },
  (err) => {
    console.error(err)
    process.exit(1)
  },
)
