-- Customer upserts (signup + authenticated bookings) use ON CONFLICT (auth_user_id).
-- Guest rows may still share NULL auth_user_id; PostgreSQL unique allows duplicate NULLs.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_auth_user_id_key'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_auth_user_id_key UNIQUE (auth_user_id);
  END IF;
END $$;
