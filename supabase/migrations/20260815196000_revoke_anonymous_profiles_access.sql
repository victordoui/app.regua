-- Profiles are private tenant data. Public booking reads the dedicated
-- professional_directory instead, so anonymous access is not required.
revoke select on table public.profiles from anon;
