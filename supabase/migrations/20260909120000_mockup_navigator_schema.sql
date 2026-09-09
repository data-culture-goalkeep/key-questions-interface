-- Mockup Navigator: mockup_navigator schema
-- Self-contained schema for the auth-free dashboard-mockup review app within the
-- shared Goalkeep Supabase project. No auth: reviewers pick a name from a fixed
-- seeded list. Reads are public (anon, select only); all writes go through
-- server actions on the service-role client. Tables are prefixed per mockup
-- (sandipani_) so additional mockups can share the schema.

create schema if not exists mockup_navigator;

grant usage on schema mockup_navigator to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table mockup_navigator.sandipani_reviewers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  review_group smallint not null check (review_group between 1 and 4),
  created_at   timestamptz not null default now()
);

create table mockup_navigator.sandipani_element_answers (
  id             uuid primary key default gen_random_uuid(),
  reviewer_id    uuid not null references mockup_navigator.sandipani_reviewers (id) on delete cascade,
  view_id        text not null,
  element_num    text not null,
  answers_kq     text check (answers_kq in ('yes', 'partly', 'no')),
  enables_action text check (enables_action in ('yes', 'partly', 'no')),
  updated_at     timestamptz not null default now(),
  unique (reviewer_id, view_id, element_num)
);

create index sandipani_element_answers_view_idx
  on mockup_navigator.sandipani_element_answers (view_id, element_num);

create table mockup_navigator.sandipani_comments (
  id          uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references mockup_navigator.sandipani_reviewers (id) on delete cascade,
  scope       text not null check (scope in ('element', 'page', 'overall')),
  view_id     text,
  element_num text,
  parent_id   uuid references mockup_navigator.sandipani_comments (id) on delete cascade,
  body        text not null,
  confidence  smallint check (confidence between 1 and 5),
  is_example  boolean not null default false,
  resolved_at timestamptz,
  created_at  timestamptz not null default now(),
  check (scope <> 'element' or element_num is not null),
  check (scope <> 'overall' or (view_id is null and element_num is null)),
  check (parent_id is null or scope = 'element')
);

create index sandipani_comments_view_element_idx
  on mockup_navigator.sandipani_comments (view_id, element_num);
create index sandipani_comments_reviewer_idx
  on mockup_navigator.sandipani_comments (reviewer_id);
create index sandipani_comments_parent_idx
  on mockup_navigator.sandipani_comments (parent_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create function mockup_navigator.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on mockup_navigator.sandipani_element_answers
  for each row execute function mockup_navigator.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security
--
-- No auth in this app. Reads are public; anon gets select only. Every write is
-- performed by the service-role client (which bypasses RLS) inside a server
-- action, so no anon insert/update/delete policy is defined.
-- ---------------------------------------------------------------------------

alter table mockup_navigator.sandipani_reviewers enable row level security;
alter table mockup_navigator.sandipani_element_answers enable row level security;
alter table mockup_navigator.sandipani_comments enable row level security;

create policy "public read" on mockup_navigator.sandipani_reviewers
  for select using (true);
create policy "public read" on mockup_navigator.sandipani_element_answers
  for select using (true);
create policy "public read" on mockup_navigator.sandipani_comments
  for select using (true);

-- ---------------------------------------------------------------------------
-- Grants (RLS above governs anon row access)
-- ---------------------------------------------------------------------------

grant select on all tables in schema mockup_navigator to anon, authenticated;
grant select, insert, update, delete on all tables in schema mockup_navigator to service_role;
grant execute on all functions in schema mockup_navigator to anon, authenticated, service_role;
