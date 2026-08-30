import "server-only"

import { createClient } from "@/lib/supabase/server"

const FACILITATOR_DOMAIN = "@goalkeep.net"

interface BaseUserContext {
  email: string
  userId: string
  avatarUrl: string | null
  fullName: string | null
}

export type UserContext =
  | ({ role: "facilitator" } & BaseUserContext)
  | ({ role: "client" } & BaseUserContext)
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

  return {
    role,
    email: user.email,
    userId: user.id,
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
  }
}
