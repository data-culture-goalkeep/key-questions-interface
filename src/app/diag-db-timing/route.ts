import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

// TEMPORARY diagnostic — measures the live Vercel-function-to-Supabase-DB
// round trip, to get real before/after numbers around the iad1 → hnd1
// function-region pin. Delete this route once those numbers are captured.
// Gated behind normal auth by middleware (not in PUBLIC_PATHS), same as
// every other route in the app — no new public surface.
export async function GET() {
  const supabase = createAdminClient()

  const start = performance.now()
  const { error } = await supabase
    .from("indicator_levels")
    .select("id")
    .limit(1)
  const dbMs = performance.now() - start

  return NextResponse.json(
    { dbMs: Math.round(dbMs * 100) / 100, error: error?.message ?? null },
    { headers: { "Server-Timing": `db;dur=${dbMs}` } }
  )
}
