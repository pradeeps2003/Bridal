-- Add review request notification template
INSERT INTO notification_templates (template_key, body_template) VALUES
  ('review_request', 'Hi {{customer_name}}, hope you loved your {{package}} look! Would you mind leaving a quick review? Google: {{google_review_url}} Or share a testimonial: {{testimonial_url}} — Glow with Rubi')
ON CONFLICT (template_key) DO NOTHING;