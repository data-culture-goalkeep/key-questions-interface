-- The "Next steps" panel renders Claude's Markdown table as an editable grid
-- with two extra data-entry columns the team fills in: a "Confirm" checkbox
-- and free-text "Instructions". These are keyed by the table's "#" column and
-- stored as one shared JSON blob on the summary row.
--
--   { "1": { "confirmed": true, "instructions": "..." }, "2": { ... } }

alter table mockup_navigator.sandipani_summaries
  add column if not exists row_annotations jsonb not null default '{}'::jsonb;
