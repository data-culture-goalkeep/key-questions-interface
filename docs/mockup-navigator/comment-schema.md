# Comment schema (`mockup_navigator`)

Three comment scopes, one table. The reference handoff called the schema `sv_review`; in this repo
it is the app-wide `mockup_navigator` schema (see the parent CLAUDE.md's "schema-per-app" convention),
with a `sandipani_` table prefix so a second mockup can coexist.

```sql
-- reviewers are a fixed list for this exercise; no auth beyond picking a name
create table mockup_navigator.sandipani_reviewers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  review_group smallint not null check (review_group between 1 and 4)
);

-- one row per element-level structured answer
create table mockup_navigator.sandipani_element_answers (
  id             uuid primary key default gen_random_uuid(),
  reviewer_id    uuid not null references mockup_navigator.sandipani_reviewers(id),
  view_id        text not null,           -- 'v1' … 'v7'
  element_num    text not null,           -- '1.6', '4.29', '8.1a'
  answers_kq     text check (answers_kq in ('yes','partly','no')),
  enables_action text check (enables_action in ('yes','partly','no')),
  updated_at     timestamptz not null default now(),
  unique (reviewer_id, view_id, element_num)
);

-- comments at all three scopes
create table mockup_navigator.sandipani_comments (
  id           uuid primary key default gen_random_uuid(),
  reviewer_id  uuid not null references mockup_navigator.sandipani_reviewers(id),
  scope        text not null check (scope in ('element','page','overall')),
  view_id      text,                     -- null when scope = 'overall'
  element_num  text,                     -- non-null only when scope = 'element'
  parent_id    uuid references mockup_navigator.sandipani_comments(id),  -- one level of nesting only
  body         text not null,
  confidence   smallint check (confidence between 1 and 5),  -- page + overall only
  is_example   boolean not null default false,
  resolved_at  timestamptz,              -- set on the thread root
  created_at   timestamptz not null default now(),
  check (scope <> 'element' or element_num is not null),
  check (scope <> 'overall' or (view_id is null and element_num is null)),
  check (parent_id is null or scope = 'element')
);

create index on mockup_navigator.sandipani_comments (view_id, element_num);
create index on mockup_navigator.sandipani_comments (reviewer_id);
```

## Notes

- **Resolve** is a property of the thread root, not of individual replies. The log's resolve toggle
  writes `resolved_at` on the root comment for that element.
- **"Needs decision"** in the log is derived, not stored: any element whose `answers_kq` or
  `enables_action` is `partly` or `no`.
- **Nesting is one level.** A reply's `parent_id` must point at a comment with `parent_id is null`.
- **Confidence** is only meaningful for `page` and `overall` scopes; leave null for element comments.
- The seeded example thread is two `element` rows on `('v1','1.3')` with `is_example = true`; keep the
  flag so the UI can tag it and so it can be deleted in one statement before real review starts.
- **RLS**: no auth in the review phase (everyone sees everything by design). Reads are public
  (`using (true)`); the anon role gets `select` only. All writes go through server actions on the
  service-role client. Reviewers are matched by name (picked from the seeded fixed list).
