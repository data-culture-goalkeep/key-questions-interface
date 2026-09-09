import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Service-role client for the Mockup Navigator app — bypasses RLS entirely.
// Targets the `mockup_navigator` schema. Since the app has no auth, this is
// the only write path: use it exclusively inside "use server" actions and the
// seed script, never in a client-facing code path.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: "mockup_navigator" },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}
