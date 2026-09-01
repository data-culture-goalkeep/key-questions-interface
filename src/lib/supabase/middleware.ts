import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { SUPABASE_JWKS } from "./jwks"

const PUBLIC_PATHS = ["/sign-in", "/auth"]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "kq_navigator" },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getClaims() verifies the JWT locally instead of getUser()'s network
  // round trip to the Auth server. Middleware runs on every request —
  // including every client-side navigation between sibling project routes
  // and every <Link> prefetch — so getUser() here was adding a real network
  // hop to every view switch. Passing the embedded JWKS (see ./jwks) makes
  // that verification independent of the SDK's in-memory JWKS cache, which
  // doesn't reliably survive between requests on Vercel — a cold instance
  // was silently falling back to a network fetch on every request, negating
  // getClaims()'s benefit in production despite it working locally. See
  // GitHub issue #12.
  // TEMP diagnostic: the HAR from the Vercel preview showed ~500-650ms of
  // server wait per navigation even with the embedded JWKS, which measured
  // at 1-12ms in isolation — this timing header will tell us whether that
  // gap is really in this call or somewhere else (cold start, region
  // latency). Remove once diagnosed.
  const claimsStart = Date.now()
  const { data } = await supabase.auth.getClaims(undefined, {
    jwks: SUPABASE_JWKS,
  })
  const claimsMs = Date.now() - claimsStart
  const claims = data?.claims

  const isPublicPath = PUBLIC_PATHS.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (!claims && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    return NextResponse.redirect(url)
  }

  supabaseResponse.headers.set("Server-Timing", `claims;dur=${claimsMs}`)
  return supabaseResponse
}
