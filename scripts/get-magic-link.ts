// Generates a magic-link sign-in URL directly via the admin API, bypassing
// the mailer's rate limit. Useful for testing without waiting on email quota.
//
// Usage: npm run get-magic-link -- someone@example.com

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.argv[2]

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
  process.exit(1)
}
if (!email) {
  console.error("Usage: npm run get-magic-link -- someone@example.com")
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: "http://localhost:3000/auth/confirm" },
  })
  if (error) throw error
  console.log(data.properties.action_link)
}

main().catch((err) => {
  console.error("Failed:", err)
  process.exit(1)
})
