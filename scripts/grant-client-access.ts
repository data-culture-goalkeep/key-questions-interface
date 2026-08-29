// Grants a client email access to a project (creates the auth user if
// needed). Stand-in for the invite flow Phase 2's Manage mode will build.
//
// Usage: npm run grant-access -- someone@example.com "Project Name"

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const [email, projectName] = process.argv.slice(2)

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
  process.exit(1)
}
if (!email || !projectName) {
  console.error('Usage: npm run grant-access -- someone@example.com "Project Name"')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: "kq_navigator" },
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data: list, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })
  if (listError) throw listError

  let userId = list.users.find((u) => u.email === email)?.id
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: crypto.randomUUID(),
    })
    if (error) throw error
    userId = data.user.id
    console.log(`Created auth user for ${email}`)
  }

  const { data: project, error: projectError } = await admin
    .from("projects")
    .select("id")
    .eq("name", projectName)
    .single()
  if (projectError) throw projectError

  const { error: accessError } = await admin
    .from("project_access")
    .upsert(
      { project_id: project.id, user_id: userId, invited_email: email },
      { onConflict: "project_id,invited_email" }
    )
  if (accessError) throw accessError

  console.log(`Granted ${email} access to "${projectName}"`)
}

main().catch((err) => {
  console.error("Failed:", err)
  process.exit(1)
})
