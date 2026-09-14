/**
 * Record an incorporation round for the Mockup Navigator's "Next steps" table.
 *
 * After a batch of confirmed next-steps has been built into the mockup, merged
 * to main and deployed to production, run this to stamp the round:
 *
 *   - each listed row gets { incorporatedRound, incorporatedAt, changeMade }
 *     merged into `sandipani_summaries.row_annotations` (confirmed / instructions
 *     are preserved and become read-only in the UI);
 *   - each listed comment gets `incorporated_at` set, so its "To be
 *     incorporated" tag becomes "Incorporated On <date>" and it drops out of the
 *     next "Summarize Next Steps" run.
 *
 * Run: npm run record-incorporation -- <spec.json>
 *
 * spec.json:
 * {
 *   "round": 1,
 *   "incorporatedAt": "2026-09-11T10:22:00Z",   // production-deploy timestamp
 *   "summaryId": "…",          // optional — defaults to the latest summary
 *   "rows": { "27": "Renamed to Academic Inchargeship in 3.4 + table.", … },
 *   "commentIds": ["uuid", …]
 * }
 *
 * Idempotent: re-running with the same spec overwrites the same fields.
 */
import { readFileSync } from "node:fs"

import { createClient } from "@supabase/supabase-js"

import { normalizeRowAnnotations } from "../src/lib/mockup/types"

interface Spec {
  round: number
  incorporatedAt: string
  summaryId?: string
  rows: Record<string, string>
  commentIds: string[]
}

const specPath = process.argv[2]
if (!specPath) {
  console.error("Usage: npm run record-incorporation -- <spec.json>")
  process.exit(1)
}
const spec = JSON.parse(readFileSync(specPath, "utf8")) as Spec
if (
  typeof spec.round !== "number" ||
  !spec.incorporatedAt ||
  Number.isNaN(Date.parse(spec.incorporatedAt))
) {
  console.error("spec needs a numeric `round` and an ISO `incorporatedAt`.")
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  db: { schema: "mockup_navigator" },
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // 1. Resolve the summary row.
  let summaryId = spec.summaryId
  let rawAnnotations: unknown = {}
  if (summaryId) {
    const { data, error } = await supabase
      .from("sandipani_summaries")
      .select("id, row_annotations")
      .eq("id", summaryId)
      .single()
    if (error) throw error
    rawAnnotations = data.row_annotations
  } else {
    const { data, error } = await supabase
      .from("sandipani_summaries")
      .select("id, row_annotations")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    if (error) throw error
    summaryId = data.id
    rawAnnotations = data.row_annotations
  }

  // 2. Merge the incorporation fields into the existing annotations.
  const annotations = normalizeRowAnnotations(rawAnnotations)
  const rowKeys = Object.keys(spec.rows ?? {})
  for (const key of rowKeys) {
    const prev = annotations[key] ?? {
      confirmed: true,
      instructions: "",
      incorporatedRound: null,
      incorporatedAt: null,
      changeMade: "",
    }
    annotations[key] = {
      ...prev,
      incorporatedRound: spec.round,
      incorporatedAt: spec.incorporatedAt,
      changeMade: spec.rows[key],
    }
  }

  const { error: sErr } = await supabase
    .from("sandipani_summaries")
    .update({ row_annotations: annotations })
    .eq("id", summaryId)
  if (sErr) throw sErr
  console.log(
    `Stamped ${rowKeys.length} row(s) on summary ${summaryId} as round ${spec.round}.`,
  )

  // 3. Stamp the source comments.
  const commentIds = spec.commentIds ?? []
  if (commentIds.length) {
    const { error: cErr, count } = await supabase
      .from("sandipani_comments")
      .update({ incorporated_at: spec.incorporatedAt }, { count: "exact" })
      .in("id", commentIds)
    if (cErr) throw cErr
    console.log(`Stamped ${count ?? commentIds.length} comment(s) as incorporated.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
