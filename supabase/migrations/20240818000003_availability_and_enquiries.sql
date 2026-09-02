-- Add UNIQUE constraint to availability_rules.day_of_week for upsert support
ALTER TABLE availability_rules ADD CONSTRAINT availability_rules_day_of_week_unique UNIQUE (day_of_week);

-- Add enquiries table for contact form submissions  
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'contact_form',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access enquiries" ON enquiries FOR ALL USING (
  auth.uid() IN (SELECT id FROM admins WHERE is_active = true)
);
