-- Incorporation tracking. A comment flagged "to be incorporated" moves to
-- "Incorporated On <ts>" once the change it fed has shipped to production.
-- `incorporated_at` holds that production-deploy timestamp; `to_incorporate`
-- stays true so the row keeps its history, and "pending" == to_incorporate
-- AND incorporated_at IS NULL.

alter table mockup_navigator.sandipani_comments
  add column if not exists incorporated_at timestamptz;
