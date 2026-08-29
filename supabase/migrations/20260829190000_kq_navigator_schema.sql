-- Key Questions Navigator: kq_navigator schema
-- Self-contained schema for this app within the shared Goalkeep Supabase project.
-- Facilitator access is role-based (Workspace email domain), client access is
-- row-based via kq_navigator.project_access.

create schema if not exists kq_navigator;

grant usage on schema kq_navigator to authenticated;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type kq_navigator.project_status as enum ('active', 'archived');

create type kq_navigator.indicator_type as enum (
  'reach', 'input', 'output', 'intermediate_outcome', 'impact'
);

create type kq_navigator.priority_level as enum ('high', 'medium', 'low');

create type kq_navigator.relationship_type as enum (
  'informs', 'depends_on', 'related_to'
);

create type kq_navigator.comment_type as enum (
  'definition_suggestion', 'general'
);

create type kq_navigator.comment_status as enum ('open', 'resolved');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table kq_navigator.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  status kq_navigator.project_status not null default 'active',
  created_at timestamptz not null default now()
);

create table kq_navigator.areas_of_enquiry (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references kq_navigator.projects (id) on delete cascade,
  name text not null,
  sequence integer not null default 0
);

create index areas_of_enquiry_project_id_idx on kq_navigator.areas_of_enquiry (project_id);

create table kq_navigator.key_questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references kq_navigator.projects (id) on delete cascade,
  area_of_enquiry_id uuid not null references kq_navigator.areas_of_enquiry (id) on delete cascade,
  -- Human-facing label (e.g. "KQ01"), scoped per project. Facilitators can
  -- renumber freely — uniqueness within a project is enforced by the app,
  -- not the database, since renumbering may pass through transient clashes.
  kq_number text not null default '',
  question_text text not null,
  indicator_type kq_navigator.indicator_type not null,
  indicator_definition text not null default '',
  action_text text not null default '',
  primary_user text not null default '',
  data_availability text not null default '',
  priority kq_navigator.priority_level not null default 'medium',
  reason_for_priority text not null default '',
  sequence integer not null default 0,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index key_questions_project_id_idx on kq_navigator.key_questions (project_id);
create index key_questions_area_of_enquiry_id_idx on kq_navigator.key_questions (area_of_enquiry_id);
create index key_questions_indicator_type_idx on kq_navigator.key_questions (indicator_type);
create index key_questions_kq_number_idx on kq_navigator.key_questions (project_id, kq_number);

create table kq_navigator.key_question_links (
  id uuid primary key default gen_random_uuid(),
  key_question_id_a uuid not null references kq_navigator.key_questions (id) on delete cascade,
  key_question_id_b uuid not null references kq_navigator.key_questions (id) on delete cascade,
  relationship_type kq_navigator.relationship_type not null,
  check (key_question_id_a <> key_question_id_b)
);

create index key_question_links_a_idx on kq_navigator.key_question_links (key_question_id_a);
create index key_question_links_b_idx on kq_navigator.key_question_links (key_question_id_b);

create table kq_navigator.key_question_comments (
  id uuid primary key default gen_random_uuid(),
  key_question_id uuid not null references kq_navigator.key_questions (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  comment_text text not null,
  comment_type kq_navigator.comment_type not null default 'general',
  status kq_navigator.comment_status not null default 'open',
  created_at timestamptz not null default now()
);

create index key_question_comments_kq_id_idx on kq_navigator.key_question_comments (key_question_id);
create index key_question_comments_author_id_idx on kq_navigator.key_question_comments (author_id);

create table kq_navigator.key_question_priority_votes (
  id uuid primary key default gen_random_uuid(),
  key_question_id uuid not null references kq_navigator.key_questions (id) on delete cascade,
  voter_id uuid not null references auth.users (id) on delete cascade,
  rank_within_type integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key_question_id, voter_id)
);

create index key_question_priority_votes_kq_id_idx on kq_navigator.key_question_priority_votes (key_question_id);
create index key_question_priority_votes_voter_id_idx on kq_navigator.key_question_priority_votes (voter_id);

create table kq_navigator.key_question_client_reviews (
  id uuid primary key default gen_random_uuid(),
  key_question_id uuid not null references kq_navigator.key_questions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  verified_at timestamptz not null default now(),
  unique (key_question_id, user_id)
);

create index key_question_client_reviews_kq_id_idx on kq_navigator.key_question_client_reviews (key_question_id);

create table kq_navigator.project_access (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references kq_navigator.projects (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  invited_email text not null,
  created_at timestamptz not null default now(),
  unique (project_id, invited_email)
);

create index project_access_project_id_idx on kq_navigator.project_access (project_id);
create index project_access_user_id_idx on kq_navigator.project_access (user_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create function kq_navigator.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on kq_navigator.key_questions
  for each row execute function kq_navigator.set_updated_at();

create trigger set_updated_at
  before update on kq_navigator.key_question_priority_votes
  for each row execute function kq_navigator.set_updated_at();

-- ---------------------------------------------------------------------------
-- Access-control helper functions
-- ---------------------------------------------------------------------------

-- Facilitators = authenticated Goalkeep Workspace users. Adjust the domain
-- below if the Workspace domain is not goalkeep.net.
create function kq_navigator.is_facilitator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() ->> 'email') ilike '%@goalkeep.net',
    false
  );
$$;

create function kq_navigator.has_project_access(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from kq_navigator.project_access pa
    where pa.project_id = p_project_id
      and pa.user_id = auth.uid()
  );
$$;

create function kq_navigator.project_id_for_key_question(p_key_question_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select project_id
  from kq_navigator.key_questions
  where id = p_key_question_id;
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table kq_navigator.projects enable row level security;
alter table kq_navigator.areas_of_enquiry enable row level security;
alter table kq_navigator.key_questions enable row level security;
alter table kq_navigator.key_question_links enable row level security;
alter table kq_navigator.key_question_comments enable row level security;
alter table kq_navigator.key_question_priority_votes enable row level security;
alter table kq_navigator.key_question_client_reviews enable row level security;
alter table kq_navigator.project_access enable row level security;

-- projects: facilitators full access; clients read-only for their project.
create policy "facilitators full access" on kq_navigator.projects
  for all using (kq_navigator.is_facilitator()) with check (kq_navigator.is_facilitator());

create policy "clients read own project" on kq_navigator.projects
  for select using (kq_navigator.has_project_access(id));

-- areas_of_enquiry: facilitators full access; clients read-only for their project.
create policy "facilitators full access" on kq_navigator.areas_of_enquiry
  for all using (kq_navigator.is_facilitator()) with check (kq_navigator.is_facilitator());

create policy "clients read own project" on kq_navigator.areas_of_enquiry
  for select using (kq_navigator.has_project_access(project_id));

-- key_questions: facilitators full access; clients read-only for their project
-- (locking restricts write actions on child tables, not visibility here).
create policy "facilitators full access" on kq_navigator.key_questions
  for all using (kq_navigator.is_facilitator()) with check (kq_navigator.is_facilitator());

create policy "clients read own project" on kq_navigator.key_questions
  for select using (kq_navigator.has_project_access(project_id));

-- key_question_links: facilitators full access; clients read-only via the
-- linked key question's project.
create policy "facilitators full access" on kq_navigator.key_question_links
  for all using (kq_navigator.is_facilitator()) with check (kq_navigator.is_facilitator());

create policy "clients read own project" on kq_navigator.key_question_links
  for select using (
    kq_navigator.has_project_access(kq_navigator.project_id_for_key_question(key_question_id_a))
  );

-- key_question_comments: facilitators full access; clients read + insert
-- (never update/delete others' comments), only on unlocked KQs in their project.
create policy "facilitators full access" on kq_navigator.key_question_comments
  for all using (kq_navigator.is_facilitator()) with check (kq_navigator.is_facilitator());

create policy "clients read own project" on kq_navigator.key_question_comments
  for select using (
    kq_navigator.has_project_access(kq_navigator.project_id_for_key_question(key_question_id))
  );

create policy "clients insert on unlocked kq" on kq_navigator.key_question_comments
  for insert with check (
    author_id = auth.uid()
    and kq_navigator.has_project_access(kq_navigator.project_id_for_key_question(key_question_id))
    and not exists (
      select 1 from kq_navigator.key_questions kq
      where kq.id = key_question_id and kq.is_locked
    )
  );

-- key_question_priority_votes: facilitators full access (incl. aggregation);
-- clients manage only their own vote, on unlocked KQs in their project.
create policy "facilitators full access" on kq_navigator.key_question_priority_votes
  for all using (kq_navigator.is_facilitator()) with check (kq_navigator.is_facilitator());

create policy "clients manage own vote" on kq_navigator.key_question_priority_votes
  for all using (voter_id = auth.uid())
  with check (
    voter_id = auth.uid()
    and kq_navigator.has_project_access(kq_navigator.project_id_for_key_question(key_question_id))
    and not exists (
      select 1 from kq_navigator.key_questions kq
      where kq.id = key_question_id and kq.is_locked
    )
  );

-- key_question_client_reviews: facilitators full read; anyone with project
-- access can read (so facilitators + clients see who verified); clients
-- manage only their own review row, on unlocked KQs.
create policy "facilitators full access" on kq_navigator.key_question_client_reviews
  for all using (kq_navigator.is_facilitator()) with check (kq_navigator.is_facilitator());

create policy "project members read reviews" on kq_navigator.key_question_client_reviews
  for select using (
    kq_navigator.has_project_access(kq_navigator.project_id_for_key_question(key_question_id))
  );

create policy "clients manage own review" on kq_navigator.key_question_client_reviews
  for all using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and kq_navigator.has_project_access(kq_navigator.project_id_for_key_question(key_question_id))
    and not exists (
      select 1 from kq_navigator.key_questions kq
      where kq.id = key_question_id and kq.is_locked
    )
  );

-- project_access: facilitators manage invites; clients can only see their own row.
create policy "facilitators full access" on kq_navigator.project_access
  for all using (kq_navigator.is_facilitator()) with check (kq_navigator.is_facilitator());

create policy "clients read own access row" on kq_navigator.project_access
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants (RLS above governs actual row access)
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on all tables in schema kq_navigator to authenticated;
grant execute on all functions in schema kq_navigator to authenticated;
