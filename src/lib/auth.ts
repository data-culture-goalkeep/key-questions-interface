import "server-only"

import { createClient } from "@/lib/supabase/server"

const FACILITATOR_DOMAIN = "@goalkeep.net"

export type UserContext =
  | { role: "facilitator"; email: string; userId: string }
  | { role: "client"; email: string; userId: string }
  | null

export async function getCurrentUserContext(): Promise<UserContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) return null

  const role = user.email.toLowerCase().endsWith(FACILITATOR_DOMAIN)
    ? "facilitator"
    : "client"

  return { role, email: user.email, userId: user.id }
}
