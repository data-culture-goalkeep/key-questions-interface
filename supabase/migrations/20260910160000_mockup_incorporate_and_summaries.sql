-- "To be incorporated" — a shared per-comment flag any reviewer can toggle,
-- used to collate feedback for the Claude-generated "next steps" summary.

alter table mockup_navigator.sandipani_comments
  add column if not exists to_incorporate boolean not null default false;

-- Persisted "Summarize Next Steps" output (markdown table from Claude).
create table if not exists mockup_navigator.sandipani_summaries (
  id            uuid primary key default gen_random_uuid(),
  content       text not null,
  comment_count integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table mockup_navigator.sandipani_summaries enable row level security;

create policy "public read" on mockup_navigator.sandipani_summaries
  for select using (true);

grant select on mockup_navigator.sandipani_summaries to anon, authenticated;
grant select, insert, update, delete on mockup_navigator.sandipani_summaries to service_role;
