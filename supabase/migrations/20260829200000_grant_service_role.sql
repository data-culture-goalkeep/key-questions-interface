-- service_role bypasses RLS but still needs ordinary GRANTs for schema and
-- table access (it is not a superuser). Needed for the seed script and any
-- future server-side admin actions that use the service role key.

grant usage on schema kq_navigator to service_role;
grant select, insert, update, delete on all tables in schema kq_navigator to service_role;
grant execute on all functions in schema kq_navigator to service_role;
