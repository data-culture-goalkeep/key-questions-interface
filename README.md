# Key Questions Navigator

A facilitator + client web app for reviewing, refining, mapping, and prioritising a project's Key Questions (KQ) document — replacing the dense spreadsheet clients currently have to review.

Two audiences:

- **Facilitators** (Goalkeep staff) — manage KQs, run the review, lock questions once facilitation is finalized.
- **Clients** (external, per-project access) — review KQ definitions, comment, verify, and vote on prioritisation.

## Tech stack

Next.js (App Router) + Tailwind CSS + shadcn/ui on the frontend. Supabase (Postgres, Auth, RLS) on the backend, in its own `kq_navigator` schema. Vercel for hosting with PR preview deployments.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Start at `/style-guide` to see the three visual directions built in Phase 0, using dummy data from `src/lib/dummy-data.ts`.

## Project status

See the build plan for phases and current status. Phase 0 (scaffold + style guide) is complete.
