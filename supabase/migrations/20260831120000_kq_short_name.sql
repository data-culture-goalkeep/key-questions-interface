-- Phase 8: short, punchy KQ captions for Map view nodes (the full
-- question_text is too long to read at node scale).

alter table kq_navigator.key_questions
  add column short_name text not null default '';
