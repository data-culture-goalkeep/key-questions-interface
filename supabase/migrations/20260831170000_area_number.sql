-- Area of Enquiry number, mirroring key_questions.kq_number: a free-text
-- label (e.g. "AOE01"), not null default '', uniqueness enforced by the
-- app rather than the database (see kq_number's own migration comment).
alter table kq_navigator.areas_of_enquiry
  add column area_number text not null default '';

-- Backfill existing areas per project as AOE01, AOE02, ... ordered by
-- their current sequence, so nothing ships blank.
with numbered as (
  select
    id,
    row_number() over (partition by project_id order by sequence) as rn
  from kq_navigator.areas_of_enquiry
)
update kq_navigator.areas_of_enquiry a
set area_number = 'AOE' || lpad(numbered.rn::text, 2, '0')
from numbered
where a.id = numbered.id;
