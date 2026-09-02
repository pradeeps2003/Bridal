-- Seed data: Initial business catalogue (editable from admin)
-- Run after initial_schema migration

INSERT INTO services (id, name, slug, description, display_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Bridal Makeup', 'bridal', 'Complete bridal makeup and styling for your wedding day.', 1),
  ('00000000-0000-0000-0000-000000000002', 'Party Makeup', 'party', 'Glamorous looks for parties and celebrations.', 2),
  ('00000000-0000-0000-0000-000000000003', 'Reception Makeup', 'reception', 'Elegant reception-ready makeup and hair.', 3),
  ('00000000-0000-0000-0000-000000000004', 'Engagement Makeup', 'engagement', 'Fresh, radiant looks for your engagement ceremony.', 4),
  ('00000000-0000-0000-0000-000000000005', 'Maternity Shoot Makeup', 'maternity', 'Soft, glowing makeup for maternity photography.', 5);

INSERT INTO packages (service_id, name, slug, description, price, pricing_type, duration_minutes, display_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Bridal — Basic', 'bridal-basic', 'Minimal makeup with essential styling.', 4999, 'FIXED', 180, 1),
  ('00000000-0000-0000-0000-000000000001', 'Bridal — Premium', 'bridal-premium', 'Non-HD makeup with premium styling.', 7999, 'FIXED', 210, 2),
  ('00000000-0000-0000-0000-000000000001', 'Bridal — Luxury', 'bridal-luxury', 'HD makeup with full luxury styling.', 11000, 'FIXED', 240, 3),
  ('00000000-0000-0000-0000-000000000002', 'Party Makeup', 'party-makeup', 'Glam party look.', 5999, 'STARTING_FROM', 120, 1),
  ('00000000-0000-0000-0000-000000000003', 'Reception Makeup', 'reception-makeup', 'Reception-ready elegance.', 5999, 'STARTING_FROM', 150, 1),
  ('00000000-0000-0000-0000-000000000004', 'Engagement Makeup', 'engagement-makeup', 'Engagement ceremony look.', 5999, 'STARTING_FROM', 150, 1),
  ('00000000-0000-0000-0000-000000000005', 'Maternity Shoot Makeup', 'maternity-makeup', 'Soft maternity shoot styling.', 3599, 'STARTING_FROM', 90, 1);

-- Bridal Basic inclusions
INSERT INTO package_items (package_id, label, display_order)
SELECT p.id, unnest(ARRAY['Minimal Makeup', 'Basic Hairstyle', 'Saree Draping', 'Saree Pre-Pleating', 'Basic Accessories Setting']), generate_series(1, 5)
FROM packages p WHERE p.slug = 'bridal-basic';

-- Bridal Premium inclusions
INSERT INTO package_items (package_id, label, display_order)
SELECT p.id, unnest(ARRAY['Non-HD Makeup', 'Premium Hairstyle', 'Saree Draping', 'Saree Pre-Pleating', 'Eyelashes', 'Lens (optional)']), generate_series(1, 6)
FROM packages p WHERE p.slug = 'bridal-premium';

-- Bridal Luxury inclusions
INSERT INTO package_items (package_id, label, display_order)
SELECT p.id, unnest(ARRAY['HD Makeup', 'Premium Hairstyle', 'Saree Draping', 'Eyelashes', 'Lens', 'Jewellery Styling']), generate_series(1, 6)
FROM packages p WHERE p.slug = 'bridal-luxury';

-- Add-ons
INSERT INTO addons (name, slug, description, price, display_order) VALUES
  ('Extra Person', 'extra-person', 'Additional person makeup and styling.', 2500, 1),
  ('Hair Extension', 'hair-extension', 'Premium hair extension styling.', 1500, 2),
  ('Jewellery Setting', 'jewellery-setting', 'Professional jewellery placement and setting.', 800, 3),
  ('Travel / Home Service', 'travel', 'Home service travel charge (varies by location).', 500, 4),
  ('Early Morning Service', 'early-morning', 'Service before 7 AM.', 1000, 5),
  ('Additional Draping', 'additional-draping', 'Extra saree or dupatta draping.', 600, 6);

-- Default availability: Mon-Sat 8 AM - 8 PM
INSERT INTO availability_rules (day_of_week, start_time, end_time) VALUES
  (1, '08:00', '20:00'),
  (2, '08:00', '20:00'),
  (3, '08:00', '20:00'),
  (4, '08:00', '20:00'),
  (5, '08:00', '20:00'),
  (6, '08:00', '20:00');

-- Default site settings
INSERT INTO site_settings (key, value) VALUES
  ('business', '{"name": "Glow with Rubi", "phone": "", "whatsapp": "", "instagram": "glow_with_rubi", "email": "", "address": ""}'),
  ('booking', '{"min_advance_hours": 48, "hold_duration_minutes": 15, "buffer_minutes": 30, "cancellation_policy": "Cancellation must be made at least 48 hours before the event for a full refund of advance."}'),
  ('payment', '{"mode": "ADVANCE_PERCENTAGE", "advance_percentage": 30, "fixed_advance": 2000}'),
  ('service', '{"home_service_enabled": true, "travel_charge_base": 500, "travel_charge_per_km": 15}');

-- Default notification templates
INSERT INTO notification_templates (template_key, body_template) VALUES
  ('booking_received', 'Hi {{customer_name}}, your booking request for {{package}} on {{date}} at {{time}} has been received. We will confirm shortly. — Glow with Rubi'),
  ('booking_approved', 'Hi {{customer_name}}, your booking for {{package}} on {{date}} is approved! Advance: {{advance}}. Pay here: {{payment_link}} — Glow with Rubi'),
  ('payment_received', 'Hi {{customer_name}}, payment of {{amount}} received. Your booking for {{date}} is confirmed! — Glow with Rubi'),
  ('booking_confirmed', 'Hi {{customer_name}}, your makeup appointment on {{date}} at {{time}} is confirmed. See you soon! — Glow with Rubi'),
  ('booking_cancelled', 'Hi {{customer_name}}, your booking for {{date}} has been cancelled. Contact us if you have questions. — Glow with Rubi'),
  ('admin_new_request', 'New booking request: {{customer_name}} — {{package}} on {{date}} at {{time}}. Review in admin dashboard.'),
  ('review_request', 'Hi {{customer_name}}, hope you loved your {{package}} look! Would you mind leaving a quick review? Google: {{google_review_url}} Or share a testimonial: {{testimonial_url}} — Glow with Rubi');
