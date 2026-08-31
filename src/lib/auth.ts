import "server-only"

import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

const FACILITATOR_DOMAIN = "@goalkeep.net"

interface BaseUserContext {
  email: string
  userId: string
  avatarUrl: string | null
  fullName: string | null
  // Unix seconds the current session expires at, or null if unavailable.
  expiresAt: number | null
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

  // getSession() reads the session straight from cookies (no network
  // round-trip) — only used here for its expires_at timestamp, not as the
  // source of truth for identity, which stays getUser() above.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return {
    role,
    email: user.email,
    userId: user.id,
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
    expiresAt: session?.expires_at ?? null,
  }
})
