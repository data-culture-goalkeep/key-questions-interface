import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Read client for the auth-free Mockup Navigator app. Targets the
// `mockup_navigator` Postgres schema (separate from KQ Navigator's
// `kq_navigator`). No cookies / no session — the app has no login. Public
// reads are allowed by RLS (`using (true)`); all writes go through the
// service-role client in ./admin.ts, invoked only from server actions.
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "mockup_navigator" },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}
