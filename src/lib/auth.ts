import "server-only"

import { cache } from "react"

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

// Layout and page both need this; cache() dedupes repeat calls within one
// request instead of hitting Supabase's auth server (a real network call,
// not a local JWT decode) twice per navigation.
export const getCurrentUserContext = cache(async (): Promise<UserContext> => {
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
})
