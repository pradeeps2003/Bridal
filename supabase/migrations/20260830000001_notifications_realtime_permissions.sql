-- Notifications, customer-safe realtime reads, and owner/staff support.

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS recipient_email TEXT,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_message_id TEXT;

CREATE INDEX IF NOT EXISTS idx_notifications_booking ON notifications (booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status_created ON notifications (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON customers (auth_user_id) WHERE auth_user_id IS NOT NULL;

-- Supabase Realtime only emits rows visible to the subscribing user under RLS.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END $$;

DROP POLICY IF EXISTS "Customer read own bookings" ON bookings;
CREATE POLICY "Customer read own bookings" ON bookings FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM customers
    WHERE customers.id = bookings.customer_id
      AND customers.auth_user_id = auth.uid()
  )
);
