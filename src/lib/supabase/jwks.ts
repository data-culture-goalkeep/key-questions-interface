import type { JWK } from "@supabase/supabase-js"

// The project's current JWT signing key (public half only — safe to commit).
// Passed to getClaims() in middleware so JWT verification never depends on
// a network fetch or on Supabase SDK's in-memory JWKS cache surviving
// between requests — which it doesn't reliably do on Vercel's serverless
// functions, where each request can land on a cold instance. If Supabase
// ever rotates the signing key, getClaims() automatically falls back to
// fetching the new key over the network (see GoTrueClient.fetchJwk), so a
// stale entry here degrades gracefully rather than breaking auth — but
// refresh it when that happens by re-running:
//   curl https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
export const SUPABASE_JWKS: { keys: JWK[] } = {
  keys: [
    {
      kty: "EC",
      use: "sig",
      key_ops: ["verify"],
      alg: "ES256",
      kid: "6bbfcdff-aa75-4300-b680-e0db36b15527",
      crv: "P-256",
      x: "bDgkFqVJBW2NnpcD_2bSz_3zxVNTKM1JxvgFZEi1lDA",
      y: "AM2Pd4rvhbyF7UqlmDUHggmQbbx3g4JnlmB6ozHzPBg",
      ext: true,
    },
  ],
}
