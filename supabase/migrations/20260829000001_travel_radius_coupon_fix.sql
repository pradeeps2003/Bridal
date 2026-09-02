-- Idempotent migration: creates coupons + testimonials tables if they
-- don't exist, then safely adds the related columns to bookings.
-- Safe to run multiple times (all guarded with IF NOT EXISTS).

-- 1. Create coupons table if it doesn't exist
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'amount')),
  value NUMERIC(10,2) NOT NULL CHECK (value > 0),
  min_order NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (min_order >= 0),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_uses INT CHECK (max_uses IS NULL OR max_uses > 0),
  used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  package_ids UUID[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code);

-- 2. Create testimonials table if it doesn't exist
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  quote TEXT NOT NULL,
  event_type TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Add columns to packages if missing
ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS sale_type TEXT NOT NULL DEFAULT 'none'
    CHECK (sale_type IN ('none', 'percent', 'amount')),
  ADD COLUMN IF NOT EXISTS sale_value NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (sale_value >= 0),
  ADD COLUMN IF NOT EXISTS sale_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ;

-- 4. Add columns to bookings if missing
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS sale_discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_token TEXT UNIQUE;

-- 5. Enable RLS on new tables (idempotent)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 6. Policies (idempotent via DO block)
DO $$
BEGIN
  -- Coupons
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Public read active coupons'
  ) THEN
    CREATE POLICY "Public read active coupons" ON coupons
      FOR SELECT USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Admin full access coupons'
  ) THEN
    CREATE POLICY "Admin full access coupons" ON coupons FOR ALL USING (
      EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true)
    );
  END IF;

  -- Testimonials
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'Public read published testimonials'
  ) THEN
    CREATE POLICY "Public read published testimonials" ON testimonials
      FOR SELECT USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'Admin full access testimonials'
  ) THEN
    CREATE POLICY "Admin full access testimonials" ON testimonials FOR ALL USING (
      EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true)
    );
  END IF;
END $$;
