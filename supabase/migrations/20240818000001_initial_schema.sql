-- Phase 1: Database Foundation
-- Glow with Rubi — Premium Makeup Booking Platform

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE pricing_type AS ENUM ('FIXED', 'STARTING_FROM', 'CUSTOM_QUOTE');
CREATE TYPE booking_status AS ENUM (
  'REQUESTED', 'HELD', 'ADMIN_APPROVED', 'PAYMENT_PENDING',
  'CONFIRMED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'COMPLETED'
);
CREATE TYPE payment_status AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');
CREATE TYPE notification_channel AS ENUM ('WHATSAPP', 'EMAIL', 'SMS');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED');
CREATE TYPE portfolio_category AS ENUM ('Bridal', 'Reception', 'Engagement', 'Party', 'Maternity', 'Hair');

-- Admins (extends auth.users)
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_phone ON customers(phone);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Packages
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  pricing_type pricing_type NOT NULL DEFAULT 'FIXED',
  duration_minutes INT NOT NULL DEFAULT 180 CHECK (duration_minutes > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_packages_service ON packages(service_id);

-- Package items (inclusions)
CREATE TABLE package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add-ons
CREATE TABLE addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  status booking_status NOT NULL DEFAULT 'REQUESTED',
  event_type TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_type TEXT DEFAULT 'home',
  address TEXT,
  pincode TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  addons_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  travel_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  advance NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  hold_expires_at TIMESTAMPTZ,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_totals CHECK (total >= 0 AND advance >= 0 AND balance >= 0)
);

CREATE INDEX idx_bookings_date ON bookings(event_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);

-- Booking items (selected add-ons)
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES addons(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Availability rules
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_availability_time CHECK (end_time > start_time)
);

-- Blocked dates
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blocked slots
CREATE TABLE blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_blocked_slot_time CHECK (end_time > start_time)
);

CREATE INDEX idx_blocked_slots_date ON blocked_slots(blocked_date);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  gateway TEXT NOT NULL DEFAULT 'razorpay',
  order_id TEXT,
  payment_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'PENDING',
  payment_method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);

-- Payment events (webhook audit trail)
CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  recipient_phone TEXT NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'WHATSAPP',
  template_key TEXT NOT NULL,
  message_body TEXT NOT NULL,
  status notification_status NOT NULL DEFAULT 'PENDING',
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification templates
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  channel notification_channel NOT NULL DEFAULT 'WHATSAPP',
  body_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolio items
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  category portfolio_category NOT NULL,
  image_url TEXT,
  video_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site settings (key-value store)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Double-booking prevention: exclusion constraint on overlapping active bookings
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings ADD CONSTRAINT no_overlapping_active_bookings
  EXCLUDE USING gist (
    event_date WITH =,
    tsrange(
      (event_date + start_time)::timestamp,
      (event_date + end_time)::timestamp
    ) WITH &&
  )
  WHERE (status IN ('HELD', 'ADMIN_APPROVED', 'PAYMENT_PENDING', 'CONFIRMED'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admins_updated BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_packages_updated BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_addons_updated BEFORE UPDATE ON addons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_notification_templates_updated BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_portfolio_items_updated BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies (active/published content only)
CREATE POLICY "Public read active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active packages" ON packages FOR SELECT USING (is_active = true);
CREATE POLICY "Public read package items" ON package_items FOR SELECT USING (true);
CREATE POLICY "Public read active addons" ON addons FOR SELECT USING (is_active = true);
CREATE POLICY "Public read published portfolio" ON portfolio_items FOR SELECT USING (is_published = true);
CREATE POLICY "Public read site settings" ON site_settings FOR SELECT USING (true);

-- Admin full access (authenticated admin users)
CREATE POLICY "Admin full access admins" ON admins FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access customers" ON customers FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access services" ON services FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access packages" ON packages FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access package_items" ON package_items FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access addons" ON addons FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access booking_items" ON booking_items FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access availability" ON availability_rules FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access blocked_dates" ON blocked_dates FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access blocked_slots" ON blocked_slots FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access payments" ON payments FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access payment_events" ON payment_events FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access notifications" ON notifications FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access notification_templates" ON notification_templates FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access portfolio" ON portfolio_items FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin read audit_logs" ON audit_logs FOR SELECT USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
CREATE POLICY "Admin insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
