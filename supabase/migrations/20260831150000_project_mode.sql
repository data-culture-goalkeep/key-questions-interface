-- Phase 9: a cosmetic Review/Prioritization label facilitators toggle per
-- project. It does not gate access on its own — actual eligibility for
-- ranking is is_locked (see the RLS policy change below), which inverts
-- from "unlocked KQs are rankable" to "locked KQs are rankable" now that
-- locking marks a KQ as facilitation-complete and ready to prioritise.

create type kq_navigator.project_mode as enum ('review', 'prioritization');

alter table kq_navigator.projects
  add column mode kq_navigator.project_mode not null default 'review';

drop policy "clients manage own vote" on kq_navigator.key_question_priority_votes;

create policy "clients manage own vote" on kq_navigator.key_question_priority_votes
  for all using (voter_id = auth.uid())
  with check (
    voter_id = auth.uid()
    and kq_navigator.has_project_access(kq_navigator.project_id_for_key_question(key_question_id))
    and exists (
      select 1 from kq_navigator.key_questions kq
      where kq.id = key_question_id and kq.is_locked
    )
  );
