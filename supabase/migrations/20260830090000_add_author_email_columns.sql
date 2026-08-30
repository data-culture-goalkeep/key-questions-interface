-- Denormalized author/reviewer email so the app can display "who commented"
-- / "who verified" without needing to expose or join auth.users (not
-- accessible via the Data API). Set at write time from the authenticated
-- session, not user-supplied.

alter table kq_navigator.key_question_comments
  add column author_email text not null default '';

alter table kq_navigator.key_question_client_reviews
  add column user_email text not null default '';
