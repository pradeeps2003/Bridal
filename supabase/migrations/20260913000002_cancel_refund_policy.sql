INSERT INTO notification_templates (template_key, body_template) VALUES
  ('admin_cancel_refund_review', 'Booking cancelled. Please decide any advance refund for {{customer_name}} — {{package}} on {{date}}. {{refund_note}} {{admin_link}}'),
  ('admin_event_day_balance', 'Event today: {{customer_name}} — {{package}} at {{time}}. Collect remaining balance (total {{total}}, advance {{advance}}). {{admin_link}}')
ON CONFLICT (template_key) DO UPDATE
SET body_template = EXCLUDED.body_template;

UPDATE notification_templates
SET body_template = 'Hi {{customer_name}}, your booking for {{date}} has been cancelled. If you paid an advance, the studio will decide any refund. There is no advance return when the event is less than 7 days away. — Glow with Rubi'
WHERE template_key = 'booking_cancelled';
