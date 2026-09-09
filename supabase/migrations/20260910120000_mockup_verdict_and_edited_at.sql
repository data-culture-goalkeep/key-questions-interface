-- The two element-level review questions ("answers the KQ?" / "enables the
-- action?") are merged into a single verdict ("Is this chart good to go?").
-- The old columns are kept for now; the app reads/writes `verdict` only.

alter table mockup_navigator.sandipani_element_answers
  add column if not exists verdict text
    check (verdict in ('yes', 'partly', 'no'));

update mockup_navigator.sandipani_element_answers
  set verdict = answers_kq
  where verdict is null and answers_kq is not null;

-- Comments can be edited in place, Slack-style.
alter table mockup_navigator.sandipani_comments
  add column if not exists edited_at timestamptz;
