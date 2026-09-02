-- Plan sales on packages, coupon codes, booking discount split, testimonials

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS sale_type TEXT NOT NULL DEFAULT 'none'
    CHECK (sale_type IN ('none', 'percent', 'amount')),
  ADD COLUMN IF NOT EXISTS sale_value NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (sale_value >= 0),
  ADD COLUMN IF NOT EXISTS sale_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ;

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

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS sale_discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_token TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  quote TEXT NOT NULL,
  event_type TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active coupons" ON coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access coupons" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Public read published testimonials" ON testimonials
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admin full access testimonials" ON testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true)
);
