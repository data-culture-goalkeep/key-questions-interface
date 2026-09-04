# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this app is

A facilitator + client web app for reviewing, refining, mapping, and prioritising a project's Key Questions (KQ) document. Two audiences: **facilitators** (Goalkeep staff, `@goalkeep.net` emails) who manage KQs and lock questions once facilitation is finalized, and **clients** (external, granted per-project access) who review, comment, verify, and vote. Facilitator vs. client role is derived purely from email domain, not a stored field — see `FACILITATOR_DOMAIN` in `src/lib/auth.ts` and `src/lib/project-data.ts`.

## Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build — treat as the CI gate along with lint/typecheck
npm run lint     # eslint
npx tsc --noEmit # typecheck (no dedicated npm script)
```

No test framework is configured in this repo — there are no unit/integration tests to run.

Data scripts (all use `tsx --env-file=.env.local`, so they need `.env.local` populated per `.env.example`):

```bash
npm run seed                          # seed dummy/dev data
npm run grant-access                  # grant a client email access to a project
npm run get-magic-link -- <email>     # generate a sign-in magic link via the admin API, bypassing the mailer — for scripted/browser-tool logins
npm run import:sandipani               # one-off import script for the Sandipani project's data
```

## Architecture

**Stack**: Next.js 16 (App Router, Turbopack) + Tailwind CSS v4 + shadcn/ui (Radix primitives) on the frontend. Supabase (Postgres, Auth, RLS) on the backend, isolated in its own `kq_navigator` Postgres schema (not `public`) inside a shared Goalkeep Supabase project. Vercel hosting with PR preview deployments. Auth is Supabase magic-link only.

**Path alias**: `@/*` → `src/*`.

### Client-side data cache (avoids per-navigation Supabase round-trips)

Every project page lives under `src/app/projects/[projectSlug]/`. `layout.tsx` for that segment is a trivial wrapper — it does **not** call Supabase. Instead it renders `<ProjectDataProvider projectSlug>` (`project-data-provider.tsx`), which on mount calls the single combined server action `getProjectData(projectSlug)` (`src/lib/project-data.ts`) and caches the result (project, role, identity, areas, key questions, indicator levels, links, votes) in React context for the lifetime of that provider instance. Because the provider is defined at the layout level, it survives client-side navigation between sibling routes (`review`, `manage`, `prioritize`, `configure`) — switching tabs does not refetch.

- `useProjectData()` reads `{ data, error, refresh }` from that context. `refresh()` re-runs `getProjectData` and is called after any mutation.
- `ProjectDataGate` is the shared render-prop wrapper every view uses: skeleton while `data` is null, error state if the fetch failed, otherwise renders children with the loaded `ProjectData`.
- Every `page.tsx` under a project route is a one-line component that just renders its view — all real logic lives in a same-directory `*-view.tsx`/`*-shell.tsx` client component that calls `useProjectData()`.
- `src/app/projects/[projectSlug]/project-header.tsx` also reads from this same cache, so the header (project name/logo, mode-gated nav links, profile menu) doesn't refetch on view switch either.

When adding a new field that a view needs, prefer adding it to `getProjectData`'s combined query in `project-data.ts` over adding a new independent fetch — a second fetch reintroduces the per-navigation round-trip this architecture exists to avoid.

Eliminating Supabase calls from these pages wasn't sufficient on its own — Next's client Router Cache still refetched the (data-free) page shell from the server on every switch, since `dynamic` routes default to a 0s client staleTime as of Next 15. `next.config.ts` sets `experimental.staleTimes.dynamic` to re-enable reuse; this is safe specifically because these pages render zero per-request content of their own (all real data comes from `ProjectDataProvider`), so a cached RSC payload can never go stale. If a project page ever starts rendering per-request server data directly (not via `ProjectDataProvider`), revisit this — it would start showing stale content for the `dynamic` staleTime window. See GitHub issue #12 for the full investigation (including a Vercel region-latency red herring along the way).

`src/lib/auth.ts` (`getCurrentUserContext`) and `src/lib/projects.ts` (`getProjectBySlug`), both wrapped in React's `cache()`, are the equivalent server-side identity/project lookups used *outside* the project view tree (home page, new-project page) — not used by the project routes themselves, which get identity from `getProjectData` instead.

### Mutations: server actions, not API routes

Each project section has a colocated `actions.ts` (`"use server"`) with plain async functions — no REST/route handlers. Facilitator-only actions call `requireFacilitatorClient()` (or equivalent inline check) first, throwing if the caller's email isn't on the facilitator domain; this is a defense-in-depth UX check, not the security boundary — RLS policies in the schema are the real enforcement. After a mutation succeeds, callers call `refresh()` from `useProjectData()` to resync the cache rather than the page reloading.

Two local-draft mutation patterns are established and should be followed for similar "batch of edits, one explicit save" UI:
- **Local draft + explicit Save/Discard**: a dirty flag plus a server-derived `computedX` (via `useMemo`) with an `xOverride` local state seeded on first user edit. See `prioritize/prioritize-view.tsx` (ranking) and `configure/configure-view.tsx` (whole-page draft: mode, details, indicator levels, logo — nothing hits Supabase until "Save changes").
- Reordering/batch operations submit the whole final order/state at once in a single server action rather than one call per change (e.g. `reorderIndicatorLevels`, `setRanking`).

### Supabase specifics

- All three client constructors (`src/lib/supabase/{client,server,admin}.ts`) pass `db: { schema: "kq_navigator" }` — every `.from(...)` call implicitly targets that schema.
- `vercel.json` pins the Vercel function region to `bom1` (Mumbai), matching the Supabase project's region (`ap-south-1`) — there was no `vercel.json` originally, so functions defaulted to `iad1` (Washington, D.C.). A live measurement (a temporary diagnostic route, since removed) showed a single trivial query dropping from ~405ms (cross-region) to ~80ms (same-region) once function and database regions matched. The project was first pinned to `hnd1`/Tokyo (matching where Supabase was at the time), then the whole Supabase project was migrated to Mumbai once real usage confirmed requests consistently enter via Vercel's Mumbai edge PoP (i.e. real users are India-based, not Japan-based) — Supabase has no in-place region change, so this meant standing up a new project in `ap-south-1` and moving schema, data, `auth.users`/`auth.identities` (UUIDs preserved, so every foreign key into `kq_navigator` still resolves), Storage objects, and Auth config (Google OAuth, SMTP, magic-link expiry) across, then repointing the app's env vars and `src/lib/supabase/jwks.ts` at the new project. Was fine to do outright rather than coordinating a shared migration, since no other app was on the old project yet.
- `admin.ts`'s service-role client bypasses RLS entirely. Only use it in trusted server-only contexts (scripts, specific server actions like granting client access) — never in a client-facing code path.
- `src/middleware.ts` + `src/lib/supabase/middleware.ts` gate all routes except `PUBLIC_PATHS` (`/sign-in`, `/auth`) and the matcher's own exclusions (`/style-guide`, static assets) behind a signed-in session, redirecting to `/sign-in` otherwise. It verifies the session via `getClaims()` with the project's JWKS embedded in `src/lib/supabase/jwks.ts`, not `getUser()` — `getUser()` is a network round trip to the Auth server on *every* request (middleware runs on every navigation and every `<Link>` prefetch), and relying on the SDK's in-memory JWKS cache instead of embedding it doesn't help on Vercel, since that cache doesn't reliably survive between serverless invocations. If Supabase ever rotates the signing key, `getClaims()` automatically falls back to fetching the new one over the network, so a stale embedded key degrades gracefully rather than breaking auth — refresh it by re-running `curl https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`.
- Migrations live in `supabase/migrations/`, timestamp-prefixed. `supabase db push` has been unreliable in this environment for cross-branch migration history reasons — when it fails, apply the migration SQL directly via the Supabase Management API (`https://api.supabase.com/v1/projects/{ref}/database/query`) while still keeping the `.sql` file committed to git so history stays accurate. Auth config (magic-link/session expiry, etc.) that isn't reachable via `supabase/config.toml` (which only governs local `supabase start`, not the hosted project) is changed the same way, via the Management API's `config/auth` endpoint.
- Role is always derived, never stored: `email.endsWith("@goalkeep.net")` → `"facilitator"`, else `"client"`.

### Types

`src/lib/types.ts` holds all shared domain types (`Project`, `KeyQuestion`, `AreaOfEnquiry`, `IndicatorLevel`, `KeyQuestionLink`, etc.) plus small formatting/label helpers (`priorityLabel`, `indicatorLevelLabel`, ...). Keep new shared types here rather than inlining them in components.

### UI conventions

- shadcn/ui components live in `src/components/ui/` — this repo has no `Checkbox` component; multi-select UI is built with toggleable `Badge` chips instead (see `kq-form-dialog.tsx`'s "depends on" picker).
- `src/app/style-guide/` is a standalone route showcasing visual directions against `src/lib/dummy-data.ts` — not part of the live app flow, and not wired to Supabase. It predates the Goalkeep brand redesign below and hasn't been reconciled with it — treat its three `.theme-*` directions as historical exploration, not the current design system.
- App-wide font/theme tokens are set in `src/app/globals.css`'s `:root` (`--font-sans`, `--font-heading`, etc.); `next/font/google` loading happens in the root `layout.tsx`.

### Goalkeep brand design system

The live theme in `globals.css`'s `:root` is Goalkeep's actual brand palette (ink `#313032` + yellow/coral/teal/blue), not an invented one — every existing shadcn semantic token (`--background`, `--primary`, `--border`, `--destructive`, `--ring`, ...) is remapped onto brand primitives there, so ordinary Tailwind utilities (`bg-primary`, `border-border`) pick up the brand automatically without call-site changes. Two things are layered on top, deliberately kept separate so they don't visually collide on the same screen:

- **Stage colour** — one brand hue per results-chain stage (Reach/Input/Output/Intermediate Outcome/Impact), via `src/lib/stage-colors.ts`'s `stageColorsForLevel()`. It matches on `IndicatorLevel.key` first (stable regardless of a project reordering/dropping levels) and falls back to cycling the same 5 hues by position for non-standard levels. This is the single source of truth for indicator-level colour — used by Manage's pills, the Map view's columns/card accents, the "depends on" picker, Prioritize's rank badges/section rules, and Review's level filter chips. Don't reintroduce a local `--chart-N`-indexed lookup at a new call site; extend this helper instead.
- **Priority** — deliberately weight-based, not hue-based (`src/components/priority-indicator.tsx`'s `<PriorityIndicator>`: solid dot + bold text / half-dot + regular / outline dot + muted, for high/medium/low), so it never visually competes with whichever stage colour happens to also read as "warm." Replaces the old `PRIORITY_BADGE_VARIANT` Badge-colour mapping everywhere.

`--radius` (8px) drives Button/Input/Select's existing multiplier-based radius scale; Card/Dialog/AlertDialog use a separate literal `--radius-card` (12px) exposed via `@theme inline`, since the button and card radius targets don't share one multiplier chain. `Card` (`src/components/ui/card.tsx`) is the single place the "12px radius / one shadow value / `border-subtle` edge" rule lives — Map's and Prioritize's per-node/per-row elements match its computed classes by hand rather than using `<Card>` directly, since they need `role="button"`/drag-ref access `<Card>` doesn't forward; keep them in sync with `card.tsx` if that file's classes change.

Project navigation is a persistent left sidebar (`project-sidebar.tsx`), not a top-tab strip — same mode/role gating as before (Review only in `mode: "review"`, Prioritize only in `"prioritization"`, Manage/Configure facilitator-only), now with `usePathname()`-driven active-state. `project-header.tsx` is just the thin top bar (breadcrumb, name, colour-coded mode/client `Badge`s, `ProfileButton`) — this split is what leaves room for Review's hero stat banner (`review/review-hero.tsx`) underneath it on the client-facing screen. Prioritize's drag-and-drop (`@dnd-kit/core` + `@dnd-kit/sortable`) is a second entry point into the same `localOrderOverride`/`dirty` local-draft state the up/down chevrons already used — both write to identical state, so they can't desync, and `setRanking` needed no server-side changes to support it.
