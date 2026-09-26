-- Existing WealthOS deployments may have been created before onboarding state
-- was stored on profiles. Add it without affecting existing profile rows.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Ask PostgREST to refresh its schema metadata immediately for the active API.
NOTIFY pgrst, 'reload schema';
