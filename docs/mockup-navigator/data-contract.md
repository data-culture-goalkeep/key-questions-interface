# Data contract — what each chart needs

The mockup runs on the ported content data in `src/lib/mockup/content/`. This file states the
*shape* the real (phase 2) dashboard needs, so the Superset build and the review tool agree on grain.

## Grain and denominators

| Concept | Grain | Denominator |
|---|---|---|
| Reach (1.1–1.6) | school, twice-yearly count | count, not rate |
| Training completion (2.1–2.9) | stakeholder × training | targeted stakeholders of that type |
| Training quality (2.10–2.14, 2.18, 2.19) | observed Peepul-led session | observed sessions (state-level) |
| Assessment participation (2.15–2.17) | trained stakeholder | unique training attendees |
| Priority academic processes (3.x, 4.x) | school, latest School Visit record | schools visited, **not** districts |
| Teacher practice (5.1–5.8) | classroom observation (CRO), cumulative | classrooms observed, **not** districts |
| Student engagement (5.9–5.12) | classroom observation | classrooms observed |
| Learning levels internal (6.x) | student, latest Spot Assessment record | assessed students; five categories total 100% |
| Learning levels external (7.x) | student, evaluation round | assessed students |
| Impact (8.x) | school, aligned SVF + CRO + assessment for the same period | schools in analysis |

## Required fields by element type

**Scorecard** — `value` (count or rate), `reverse` (true for "None met"-style metrics),
optional `splits[]` (label + value, e.g. gender), optional `definition` string shown beneath.

**Table** — `columns[]` each with `{label, numeric, percent, reverse, threshold}`; `rows[]` where cell 0 is the
dimension label. Division tables additionally carry `districts` (count of districts in that division).
Percentage columns drive the conditional formatting; non-percentage numeric columns never colour.

**Grouped bar / column** — `groups[]` with `{label, bars:[{series, value}]}`, `max` for the axis,
`percent` flag, `legend[]` of `{series, colour}`.

**100% stacked bar / column** — `rows[]` with `{label, values[4]}` in fixed learning-level order
(Below Dakshata, Dakshata, Dakshata++, Grade Level). Values must sum to 100.

**Action list** — `rows[]` of `{quarter, category, activity, target, achieved, status, remarks}`;
status vocabulary `Delayed | In Progress | Yet to Start | Complete`.

## Composite indicators

Priority academic processes are composites: a school counts only where **every** criterion is met.
"All criteria met" and "None met" are therefore not complements — schools meeting some but not all
criteria fall in neither. Keep both, and keep the per-criterion rates, because the whole point of
view 4 is diagnosing *which* criterion fails.

## Known gaps carried over from the KQ sheet

- **KQ05** — planning data lives in individual planning sheets; dashboard mapping and update cadence not yet established.
- **KQ06** — calculation methodology for the training-quality composite to be confirmed.
- **KQ11, KQ21, KQ22** — exact question numbers and response options to be fixed once definitions are final.
- **KQ24** — requires aligned school-level SVF, CRO and assessment data for the same reporting period.
- **5.9** — the student-engagement rubric ("at least 75% of students actively on task") is still TBD.
- **1.4 / 1.5** — school leaders include MSHMs; the two counts must never be summed.
- **6.x** — English spot-assessment data is to be kept separate per the KQ sheet.
