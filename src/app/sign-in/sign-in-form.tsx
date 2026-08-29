"use client"

import * as React from "react"
import { Mail } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export function SignInForm() {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<
    "idle" | "sending" | "sent" | "error"
  >("idle")
  const [googleLoading, setGoogleLoading] = React.useState(false)

  async function signInWithGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // @supabase/ssr's browser client uses PKCE, so a real email-triggered
        // link resolves to `?code=...` here — the same code-exchange route
        // used for Google OAuth, not the fragment-based /auth/confirm page
        // (that one only applies to implicit-flow links, e.g. admin-generated
        // test links via scripts/get-magic-link.ts).
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setStatus(error ? "error" : "sent")
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Button
          onClick={signInWithGoogle}
          disabled={googleLoading}
          className="w-full"
        >
          {googleLoading ? "Redirecting…" : "Sign in with Google"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Goalkeep staff — facilitator access
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      {status === "sent" ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="size-4" />
          Check {email} for a sign-in link.
        </p>
      ) : (
        <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Client email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@yourorganisation.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </Button>
          {status === "error" && (
            <p className="text-xs text-destructive">
              Something went wrong sending the link. Try again.
            </p>
          )}
        </form>
      )}
    </div>
  )
}
