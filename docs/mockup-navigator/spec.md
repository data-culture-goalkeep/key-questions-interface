# Sandipani dashboard review tool — build spec

Handoff from the design mockup (`Sandipani Dashboard Review.dc.html`) to a real app.
Everything below is decided; nothing here is a suggestion.

## What this app is

A feedback-collection tool wrapped around a **simulation of a Superset dashboard**. Twelve Peepul
reviewers click through nine views of dummy data and record, per element, whether it answers its
key question and whether it enables the action attached to that key question. The point is to give
Peepul confidence in the dashboard design *before* it is built in Superset.

Two phases: **(1) this review tool** — build now; **(2) the real dashboard** — later, against real data.

## Roles

Single role: reviewer. No facilitator/client split, no gating. Reviewer identity is chosen from a
fixed list of 12 names on first load — no password, no magic link.
The four review groups exist in the source workbook and are shown on the sign-in screen for
orientation only: **every reviewer can see and comment on every view.**

```
Group 1  Kanishka, Shil, Ashish        (workbook assignment: views 1, 7)
Group 2  Jay, Sharmishta, Surya        (views 6a, 6b)
Group 3  Manju, Ambika, Purty          (views 3, 4)
Group 4  Anisha, Ramesh, Shashwat      (views 2, 5)
```

## Routes

| Route | Kind | Notes |
|---|---|---|
| `/mockups` | reference | Review brief + reviewer picker. Landing page. Redirects to the first view once a reviewer is chosen. |
| `/mockups/sandipani/guide` | reference | Dashboard Guide — view directory, filter instructions, table-reading key. First tab in the strip. |
| `/mockups/sandipani/v/v1` … `/v7` | dashboard view | The eight dashboard views, in workbook order (ids: `v1 v2 v3 v4 v5 v6a v6b v7`). |
| `/mockups/sandipani/coverage` | reference | KQ → chart coverage check. |
| `/mockups/sandipani/log` | reference | Feedback log. |

> The reference `.dc.html` used `/`, `/v/1`, `/reference/coverage`. This app namespaces everything
> under `/mockups/sandipani/*` so a second mockup can be added later without collision.

Every page declares its kind in a chip at the top of the content column: **Dashboard view** (deep blue
`#17479E`, white text) or **Reference material** (grey `#F0EFEE`). This is a hard requirement — reviewers
must never be unsure whether they are looking at a proposed dashboard view or supporting material.

Reference pages sit in a separate **Reference** group at the right end of the tab strip, divided from
the dashboard tabs by a vertical rule.

## Shell

- Header (sticky): logo mark, dashboard title, `MOCKUP` chip, "Reviewed N of 105 elements",
  rail toggle, reviewer chip (click → back to brief to switch reviewer).
- Tab strip (sticky, horizontally scrollable): Guide · 8 views · | · Reference pages.
  Active tab: 600 weight, `#17479E`, 2px bottom border.
- Filter bar (per view, top of content): Academic Year, Division, District, Subject (learning views only),
  Scenario. Reference pages have no filter bar.
- Two-column layout: content column (`minmax(0,1fr)`) + **review rail** (320px, sticky, own scroll).
  The rail is collapsible; collapsing gives the content column full width.

## Filters

- **Academic Year** `2025–26 | 2024–25 | 2023–24` (default `2025–26`)
- **Division** `All Divisions` + 9 divisions (default `All Divisions`)
- **District** `All Districts` + 10 districts (default `All Districts`). Selecting a Division resets District.
- **Subject** `All Subjects | English | Hindi | Mathematics` — views 6a and 6b only.
- Filters **persist across views** (dashboard-level, as in real Superset). Selected filters render with a
  blue border + `#EEF1F8` fill so a carried-over filter is obvious. A Reset link appears when anything is off-default.
- Filters genuinely recompute: counts scale to the selected division's share of schools; rate metrics take a
  per-division offset (`scenarios.json → divisionOffsets`); division and district tables filter to the selected row.
- Sections marked state-level (2.10–2.14, 1.8–1.11) do not respond to Division/District — the note on the section says so.

## Scenarios

Per view (not global), reset to `asis` on every view. Three per view: `asis`, `hold`, `break` —
see `scenarios.json` for labels, deltas and banner copy. When a non-`asis` scenario is active a
yellow banner explains what the reviewer is looking at. Scenario deltas apply to rate metrics only; metrics
flagged `reverse` (e.g. "None met", "Below Dakshata") take the opposite sign so that "worse" always looks worse.

Maths (from the reference implementation):
- `delta` = `asis` 0, `hold` +11, `break` −14.
- `divisionOffset` for a selected division, else 0: `[-3,1,3,5,4,-1,-4,-2,2]` indexed by division order.
- A rate value `v` becomes `clamp(1, 99, round(v + (delta + divisionOffset) * (reverse ? -1 : 1)))`.
- A count `n` with a division selected becomes `max(1, round(n * divisionSchools / totalSchools))`.

## Elements

105 elements across the 8 dashboard views — `element-inventory` (ported to
`src/lib/mockup/content/`) is the definitive list. Types in use: Scorecard, Table, Action list,
Bar chart, Grouped bar chart, Grouped column chart, 100% stacked bar chart, 100% stacked column chart.

Each element card header carries: element number (mono, e.g. `4.29`), name, related KQ chip,
comment-count badge (coral dot + count) and a green check once reviewed. Clicking anywhere on the
card focuses it in the rail.

**Table conditional formatting is live, not decorative.** For every percentage column: compute the mean
across the visible rows; colour a cell green (`#E7F2EE`/`#2F6B5B`) when it is ≥ threshold above the mean and
red (`#FBEEEC`/`#B4564A`) when ≥ threshold below. Threshold is 5pp everywhere except the learning-level tables
(6.8, 6.9, 7.8, 7.9) where it is 2pp. Columns flagged `reverse` invert the comparison. Only colour when more
than one row is visible. Every such table shows a legend line with the rule. Wide tables scroll horizontally
inside their card — never widen the page.

## Review rail

The rail has two states.

**Element focused** (a card was clicked):
1. Element number, name, chart-type chip, KQ id.
2. The full key-question text and, beneath a rule, the **action it should enable** (from the KQ sheet).
3. `Does this answer KQnn?` — Yes / Partly / No.
4. `Does it enable the action?` — Yes / Partly / No.
5. Thread: comments with author avatar, name, relative time, an `Example` tag on the seeded thread, and
   Reply on top-level comments (one level of nesting; replies are indented and tinted).
6. Composer: textarea + Comment button, with a "Replying to X" strip when replying.

**No element focused** (default): view name, a one-line prompt, and **page-level feedback** — free text plus a
1–5 confidence rating — followed by page feedback already recorded on this view.

Rail footer always links: Feedback log (with total comment count), Coverage check, Review brief.
Rail header shows per-view progress (`n/total elements answered`).

An element counts as **reviewed** once "Answers the KQ?" has a value.

## Overall feedback

At the bottom of the **last view only** (7. Impact): a prompt card — free text plus 1–5 confidence —
asking whether anything is missing, whether the dashboard would enable the actions in the KQ list, and
whether there are sequencing or feasibility concerns. Submitted entries render underneath.

## Feedback log

Grouped by view, then by element number. Per element: header (number, name, type, KQ chip, both structured
answers, resolve toggle, Open → which navigates to the element focused) and the comment thread.
Filters: reviewer (`All reviewers` + 12 names), "Needs decision only" (any structured answer that is not Yes),
"Include resolved". Threads can be marked resolved; resolved threads are hidden unless included.

**Copy for the feedback sheet** copies TSV to the clipboard with exactly the workbook's 11 columns:

```
View · Element # · Element · Type · Related KQs · Answers the KQ? · Enables action? ·
What works · What needs to change · What's missing · Decision
```

Element comments fill *What works* as `Author: text | Author: text`; page-level and overall entries are
appended as rows with Element # `—` and Type `Page` / `Overall`, carrying their confidence rating in the text.

## Coverage check

One row per prioritised KQ: id, question text, the element numbers that answer it, and review progress
(`n of m`). A KQ with no element is flagged red. KQ09, KQ14 and KQ18–KQ20 are **out of scope** — dropped,
not missing — and the page says so. Note that KQ18's rubric is still referenced by KQ24's definition.

## Persistence

The mockup kept everything in `localStorage` under `sandipani-review-v1`. **This app uses Supabase**
(`mockup_navigator` schema — see `comment-schema.md`). Route every write through one data-layer module
(`src/lib/mockup/`) with optimistic update → persist → resync, mirroring the KQ Navigator
`mutate()` pattern in the parent repo's CLAUDE.md.

## Seeded content

Exactly one example thread ships with the app, on element `1.3` of view `v1`: a comment from Shil tagged
`Example`, plus a reply from Ashish. It demonstrates threading and the log without being mistaken for real
feedback. Do not seed anything else.

## Visual system

Goalkeep brand, but the mockup carries its **own scoped stylesheet** (`src/app/mockups/mockups.css`,
`.mockup-nav` scope) so it does not collide with the KQ Navigator theme. Palette:

```
ink        #313032      canvas       #F7F6F6     surface      #FFFFFF
ink-2      #5B6472      border       #E8E6E6     muted ink    #9AA1AC
blue-deep  #17479E      blue         #4E72B8     teal         #81C2B2
coral      #EA9D93      yellow       #E9E626     danger       #C23934
good bg/fg #E7F2EE / #2F6B5B         bad bg/fg   #FBEEEC / #B4564A
```

Type: Inter for everything; IBM Plex Mono for element numbers, KQ ids and all numeric table cells.
Radii: 8px controls, 11–12px cards. Learning levels always use the four-step brand ramp
coral → yellow → teal → deep blue for Below Dakshata → Dakshata → Dakshata++ → Grade Level.

Target canvas: desktop 1440. Scorecard grids use `repeat(auto-fit,minmax(168px,1fr))` so they degrade
gracefully below that rather than clipping.
