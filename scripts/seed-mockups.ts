/**
 * Seeds the mockup_navigator schema for the Sandipani dashboard review tool:
 * the preset reviewer names and the single example comment thread on element
 * 1.1 of view v1 (author "Goalkeep-Test"). Reviewers can also type their own
 * name on the brief screen (created on the fly), so the list is a convenience.
 *
 * Run: npm run seed:mockups
 * Idempotent — upserts reviewers by name; rebuilds the example thread only if
 * it isn't already on v1 : 1.1.
 */
import { createClient } from "@supabase/supabase-js"

import { PRESET_REVIEWERS } from "../src/lib/mockup/content/reviewers"

const EXAMPLE_AUTHOR = "Goalkeep-Test"
const EXAMPLE_VIEW = "v1"
const EXAMPLE_ELEMENT = "1.1"

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
  // --- reviewers (preset names + the example-thread author) ---
  const rows = [...PRESET_REVIEWERS, EXAMPLE_AUTHOR].map((name) => ({ name }))
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

  // --- example thread on v1 : 1.1 ---
  const { data: existing, error: existErr } = await supabase
    .from("sandipani_comments")
    .select("id, view_id, element_num")
    .eq("is_example", true)
  if (existErr) throw existErr
  const alreadyThere =
    existing?.length &&
    existing.every(
      (c) => c.view_id === EXAMPLE_VIEW && c.element_num === EXAMPLE_ELEMENT,
    )
  if (alreadyThere) {
    console.log(`✓ example thread already on ${EXAMPLE_VIEW} : ${EXAMPLE_ELEMENT}`)
    return
  }
  if (existing?.length) {
    const { error: delErr } = await supabase
      .from("sandipani_comments")
      .delete()
      .eq("is_example", true)
    if (delErr) throw delErr
    console.log("✓ cleared stale example comments")
  }

  const author = idByName.get(EXAMPLE_AUTHOR)
  if (!author) throw new Error(`Seeded reviewer ${EXAMPLE_AUTHOR} not found`)

  const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString()
  const oneDayAgo = new Date(Date.now() - 86_400_000).toISOString()

  const { data: root, error: rootErr } = await supabase
    .from("sandipani_comments")
    .insert({
      reviewer_id: author,
      scope: "element",
      view_id: EXAMPLE_VIEW,
      element_num: EXAMPLE_ELEMENT,
      body: "This lands the headline count, but 'does it match our records?' can't be answered from the card alone — reviewers will want the internal / government / funder comparison right here.",
      is_example: true,
      created_at: twoDaysAgo,
    })
    .select("id")
    .single()
  if (rootErr) throw rootErr

  const { error: replyErr } = await supabase.from("sandipani_comments").insert({
    reviewer_id: author,
    scope: "element",
    view_id: EXAMPLE_VIEW,
    element_num: EXAMPLE_ELEMENT,
    parent_id: root.id,
    body: "Agreed — a small 'vs last count' delta would also make thin allocation visible before the next quarter's plan is set.",
    is_example: true,
    created_at: oneDayAgo,
  })
  if (replyErr) throw replyErr

  console.log(`✓ example thread seeded on ${EXAMPLE_VIEW} : ${EXAMPLE_ELEMENT}`)
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
