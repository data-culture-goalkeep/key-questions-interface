# Mockup Navigator — Sandipani dashboard review tool

Imported from Claude Design project **Sandipani Vidyalayas Dashboard**
(`e8c2f950-f234-4f82-8794-948ce67014b8`), file `Sandipani Dashboard Review.dc.html`.

This directory is the design handoff, kept for reference. The live app lives at
`/mockups` (`src/app/mockups/`), backed by the `mockup_navigator` Supabase schema.

| File | What it is |
|---|---|
| `spec.md` | Routes, shell, filters, rail behaviour, feedback model, visual system. Start here. |
| `comment-schema.md` | The Supabase schema (adapted to `mockup_navigator`). |
| `data-contract.md` | Grain, denominators and required fields per chart type; known definition gaps. |
| `scenarios.json` | Scenario ids, deltas, banner copy, per-division offsets. |
| `reference-implementation.js` | The `.dc.html`'s script block, prettified — the reference implementation for every view builder, the KQ texts, scenario maths and table conditional-formatting rules. |

The mockup's content data (KQ texts, view definitions, every dummy number, the
105-element inventory) is ported into typed modules under
`src/lib/mockup/content/` — that is the canonical copy the app and the seed
script both read.

Phase 1 is this review tool. Phase 2 is the real Superset dashboard — `data-contract.md` is written for it.
