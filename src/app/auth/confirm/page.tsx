"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

// Magic-link and OAuth confirmations from Supabase's default email
// templates use the implicit grant flow: the session tokens arrive in the
// URL fragment (#access_token=...), which only the browser can read — a
// server route handler never sees it. @supabase/ssr's browser client is
// built around PKCE cookie storage and does not auto-detect implicit-flow
// fragments, so this page parses the hash itself and calls setSession.
function parseHashParams() {
  if (typeof window === "undefined") return null
  return new URLSearchParams(window.location.hash.replace(/^#/, ""))
}

function initialStatus(): "pending" | "error" {
  const params = parseHashParams()
  if (!params) return "pending"
  if (params.get("error_description")) return "error"
  if (!params.get("access_token") || !params.get("refresh_token")) {
    return "error"
  }
  return "pending"
}

export default function AuthConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = React.useState<"pending" | "error">(initialStatus)

  React.useEffect(() => {
    const params = parseHashParams()
    const accessToken = params?.get("access_token")
    const refreshToken = params?.get("refresh_token")
    if (!accessToken || !refreshToken) return

    const supabase = createClient()
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setStatus("error")
        } else {
          router.replace("/")
        }
      })
  }, [router])

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      {status === "pending" ? (
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      ) : (
        <>
          <p className="text-sm text-destructive">
            That sign-in link is invalid or has expired.
          </p>
          <a href="/sign-in" className="text-sm underline">
            Back to sign in
          </a>
        </>
      )}
    </main>
  )
}
