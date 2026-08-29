import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Service-role client. Bypasses RLS entirely — never import this into
// client-facing code paths. Only for the seed script and trusted server
// actions (e.g. inviting a client into project_access).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: "kq_navigator" },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}
