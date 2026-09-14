-- Align the package duration column with the application model.
-- The initial schema stores duration_minutes; current application code uses duration_hours.

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS duration_hours NUMERIC(6,2);

UPDATE packages
SET duration_hours = ROUND(duration_minutes / 60.0, 2)
WHERE duration_hours IS NULL;

ALTER TABLE packages
  ALTER COLUMN duration_hours SET DEFAULT 3,
  ALTER COLUMN duration_hours SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'packages_duration_hours_positive'
  ) THEN
    ALTER TABLE packages
      ADD CONSTRAINT packages_duration_hours_positive CHECK (duration_hours > 0);
  END IF;
END $$;
