-- Reviewer selection is simplified to a flat list (no groups) plus free-text
-- names, so review_group is no longer required. The check constraint keeps
-- 1–4 for any value that is still supplied (NULL passes a range check).

alter table mockup_navigator.sandipani_reviewers
  alter column review_group drop not null;
