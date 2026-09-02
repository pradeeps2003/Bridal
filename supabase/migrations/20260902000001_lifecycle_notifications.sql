-- Review one-shot, payment proofs, admin templates, and enquiry realtime.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS review_requested_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bookings_review_requested
  ON bookings (event_date, status)
  WHERE review_requested_at IS NULL;

INSERT INTO notification_templates (template_key, body_template) VALUES
  ('booking_rejected', 'Hi {{customer_name}}, your booking request for {{package}} on {{date}} could not be approved. Please contact us if you have questions. — Glow with Rubi'),
  ('admin_payment_received', 'Advance of {{amount}} captured for {{customer_name}} ({{package}} on {{date}}). Booking is confirmed. {{admin_link}}'),
  ('admin_upi_verify', 'Please verify UPI payment for {{customer_name}} — {{amount}} (UTR {{utr}}). {{package}} on {{date}}. {{admin_link}}'),
  ('upi_payment_submitted', 'Hi {{customer_name}}, we received your UPI payment details (UTR {{utr}}). We will confirm your booking after we verify the payment. — Glow with Rubi'),
  ('admin_decision_reminder', 'Reminder: please approve or reject {{customer_name}} — {{package}} on {{date}} at {{time}}. {{admin_link}}'),
  ('admin_unpaid_reminder', 'Reminder: {{customer_name}} has not paid the advance for {{package}} on {{date}}. {{admin_link}}'),
  ('payment_reminder', 'Hi {{customer_name}}, your Glow with Rubi booking for {{package}} on {{date}} is approved. Please pay the advance {{advance}} here: {{payment_link}}'),
  ('contact_enquiry', 'New contact enquiry from {{customer_name}} ({{customer_phone}}):\n{{message}}\n\nOpen inbox: {{admin_link}}')
ON CONFLICT (template_key) DO UPDATE
SET body_template = EXCLUDED.body_template;

UPDATE notification_templates
SET body_template = 'New booking request: {{customer_name}} — {{package}} on {{date}} at {{time}}. Please take a decision: {{admin_link}}'
WHERE template_key = 'admin_new_request';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'enquiries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read payment proofs" ON storage.objects;
  CREATE POLICY "Public read payment proofs"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'payment-proofs');
EXCEPTION
  WHEN undefined_table OR insufficient_privilege THEN
    NULL;
END $$;
