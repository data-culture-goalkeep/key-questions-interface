-- Phase 7: Data Availability becomes a structured dropdown + optional note,
-- replacing the free-text column. Existing values are all prose (no fixed
-- vocabulary), so we map by prefix and preserve the original text as a note
-- rather than discarding it.

create type kq_navigator.data_availability_status as enum (
  'fully_available', 'partially_available', 'not_available'
);

alter table kq_navigator.key_questions
  add column data_availability_status kq_navigator.data_availability_status,
  add column data_availability_note text not null default '';

-- Preserve every existing value as a note first, then classify.
update kq_navigator.key_questions
set data_availability_note = data_availability;

update kq_navigator.key_questions
set data_availability_status = case
  when data_availability ilike 'available%' then 'fully_available'
  when data_availability ilike 'partial%' then 'partially_available'
  -- No existing row falls into this branch (checked live data before writing
  -- this migration), but a value that names neither reads more like an
  -- unresolved gap than a caveated "yes" or "partial", so default there.
  else 'not_available'
end::kq_navigator.data_availability_status;

-- The exact string "Available" carries no caveat worth surfacing as a note.
update kq_navigator.key_questions
set data_availability_note = ''
where data_availability = 'Available';

alter table kq_navigator.key_questions
  alter column data_availability_status set not null,
  alter column data_availability_status set default 'fully_available';

alter table kq_navigator.key_questions drop column data_availability;
