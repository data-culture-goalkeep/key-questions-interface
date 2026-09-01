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

`src/lib/auth.ts` (`getCurrentUserContext`) and `src/lib/projects.ts` (`getProjectBySlug`), both wrapped in React's `cache()`, are the equivalent server-side identity/project lookups used *outside* the project view tree (home page, new-project page) — not used by the project routes themselves, which get identity from `getProjectData` instead.

### Mutations: server actions, not API routes

Each project section has a colocated `actions.ts` (`"use server"`) with plain async functions — no REST/route handlers. Facilitator-only actions call `requireFacilitatorClient()` (or equivalent inline check) first, throwing if the caller's email isn't on the facilitator domain; this is a defense-in-depth UX check, not the security boundary — RLS policies in the schema are the real enforcement. After a mutation succeeds, callers call `refresh()` from `useProjectData()` to resync the cache rather than the page reloading.

Two local-draft mutation patterns are established and should be followed for similar "batch of edits, one explicit save" UI:
- **Local draft + explicit Save/Discard**: a dirty flag plus a server-derived `computedX` (via `useMemo`) with an `xOverride` local state seeded on first user edit. See `prioritize/prioritize-view.tsx` (ranking) and `configure/configure-view.tsx` (whole-page draft: mode, details, indicator levels, logo — nothing hits Supabase until "Save changes").
- Reordering/batch operations submit the whole final order/state at once in a single server action rather than one call per change (e.g. `reorderIndicatorLevels`, `setRanking`).

### Supabase specifics

- All three client constructors (`src/lib/supabase/{client,server,admin}.ts`) pass `db: { schema: "kq_navigator" }` — every `.from(...)` call implicitly targets that schema.
- `admin.ts`'s service-role client bypasses RLS entirely. Only use it in trusted server-only contexts (scripts, specific server actions like granting client access) — never in a client-facing code path.
- `src/middleware.ts` + `src/lib/supabase/middleware.ts` gate all routes except `PUBLIC_PATHS` (`/sign-in`, `/auth`) and the matcher's own exclusions (`/style-guide`, static assets) behind a signed-in session, redirecting to `/sign-in` otherwise.
- Migrations live in `supabase/migrations/`, timestamp-prefixed. `supabase db push` has been unreliable in this environment for cross-branch migration history reasons — when it fails, apply the migration SQL directly via the Supabase Management API (`https://api.supabase.com/v1/projects/{ref}/database/query`) while still keeping the `.sql` file committed to git so history stays accurate. Auth config (magic-link/session expiry, etc.) that isn't reachable via `supabase/config.toml` (which only governs local `supabase start`, not the hosted project) is changed the same way, via the Management API's `config/auth` endpoint.
- Role is always derived, never stored: `email.endsWith("@goalkeep.net")` → `"facilitator"`, else `"client"`.

### Types

`src/lib/types.ts` holds all shared domain types (`Project`, `KeyQuestion`, `AreaOfEnquiry`, `IndicatorLevel`, `KeyQuestionLink`, etc.) plus small formatting/label helpers (`priorityLabel`, `indicatorLevelLabel`, ...). Keep new shared types here rather than inlining them in components.

### UI conventions

- shadcn/ui components live in `src/components/ui/` — this repo has no `Checkbox` component; multi-select UI is built with toggleable `Badge` chips instead (see `kq-form-dialog.tsx`'s "depends on" picker).
- `src/app/style-guide/` is a standalone route showcasing visual directions against `src/lib/dummy-data.ts` — not part of the live app flow, and not wired to Supabase.
- App-wide font/theme tokens are set in `src/app/globals.css`'s `:root` (`--font-sans`, `--font-heading`, etc.); `next/font/google` loading happens in the root `layout.tsx`.
