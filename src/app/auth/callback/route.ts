import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

// Exchanges a PKCE `code` for a session. Handles both the Google OAuth
// redirect and real (browser-initiated) magic-link emails — both use PKCE
// via @supabase/ssr's browser client.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
}
