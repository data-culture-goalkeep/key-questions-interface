-- Phase 6: project configuration foundation
--   * slug-based project URLs
--   * indicator levels become project-scoped (was a fixed 5-value enum)
--   * prioritization methodology + logo fields on projects
--   * a Storage bucket for project/NGO logos

-- ---------------------------------------------------------------------------
-- Slugs
-- ---------------------------------------------------------------------------

alter table kq_navigator.projects add column slug text;

update kq_navigator.projects
set slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'));

alter table kq_navigator.projects alter column slug set not null;
alter table kq_navigator.projects add constraint projects_slug_key unique (slug);

-- ---------------------------------------------------------------------------
-- Indicator levels: project-scoped table replacing the fixed indicator_type enum
-- ---------------------------------------------------------------------------

create table kq_navigator.indicator_levels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references kq_navigator.projects (id) on delete cascade,
  -- Stable machine key, e.g. 'reach', 'outcome_immediate'. Unique per
  -- project; not a global enum, since projects configure their own set.
  key text not null,
  label text not null,
  -- Display numbering, e.g. "1", "4A" — free text so a split Outcomes
  -- level can use "4A"/"4B" instead of forcing a plain integer sequence.
  number_label text not null,
  sequence integer not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, key)
);

create index indicator_levels_project_id_idx on kq_navigator.indicator_levels (project_id);

-- Seed every existing project with the previous fixed 5-level scheme so
-- current data keeps behaving identically until a facilitator reconfigures it.
insert into kq_navigator.indicator_levels (project_id, key, label, number_label, sequence)
select p.id, lvl.key, lvl.label, lvl.number_label, lvl.sequence
from kq_navigator.projects p
cross join (
  values
    ('reach', 'Reach', '1', 1),
    ('input', 'Input', '2', 2),
    ('output', 'Output', '3', 3),
    ('intermediate_outcome', 'Intermediate Outcome', '4', 4),
    ('impact', 'Impact', '5', 5)
) as lvl(key, label, number_label, sequence);

alter table kq_navigator.key_questions
  add column indicator_level_id uuid references kq_navigator.indicator_levels (id);

update kq_navigator.key_questions kq
set indicator_level_id = il.id
from kq_navigator.indicator_levels il
where il.project_id = kq.project_id
  and il.key = kq.indicator_type::text;

alter table kq_navigator.key_questions
  alter column indicator_level_id set not null;

drop index if exists kq_navigator.key_questions_indicator_type_idx;
alter table kq_navigator.key_questions drop column indicator_type;
drop type kq_navigator.indicator_type;

create index key_questions_indicator_level_id_idx on kq_navigator.key_questions (indicator_level_id);

alter table kq_navigator.indicator_levels enable row level security;

create policy "facilitators full access" on kq_navigator.indicator_levels
  for all using (kq_navigator.is_facilitator()) with check (kq_navigator.is_facilitator());

create policy "clients read own project" on kq_navigator.indicator_levels
  for select using (kq_navigator.has_project_access(project_id));

grant select, insert, update, delete on kq_navigator.indicator_levels to authenticated;
grant select, insert, update, delete on kq_navigator.indicator_levels to service_role;

-- ---------------------------------------------------------------------------
-- Prioritization methodology + logo
-- ---------------------------------------------------------------------------

create type kq_navigator.prioritization_methodology as enum (
  'ordering', 'selection_n', 'points'
);

alter table kq_navigator.projects
  add column prioritization_methodology kq_navigator.prioritization_methodology not null default 'ordering',
  add column logo_url text;

-- ---------------------------------------------------------------------------
-- Storage bucket for project (NGO) logos — public read, facilitator-only write
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', true)
on conflict (id) do nothing;

create policy "public read project assets"
  on storage.objects for select
  using (bucket_id = 'project-assets');

create policy "facilitators manage project assets"
  on storage.objects for all
  using (bucket_id = 'project-assets' and kq_navigator.is_facilitator())
  with check (bucket_id = 'project-assets' and kq_navigator.is_facilitator());
