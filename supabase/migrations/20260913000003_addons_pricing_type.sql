-- Live databases created from the first schema never got add-on pricing_type.
-- Safe to run in the Supabase SQL editor even if a previous attempt failed.

ALTER TABLE addons
  ADD COLUMN IF NOT EXISTS pricing_type pricing_type NOT NULL DEFAULT 'FIXED';

NOTIFY pgrst, 'reload schema';
