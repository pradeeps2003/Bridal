-- Site assets, checkout controls, and editable About page defaults.
-- Safe to run after the existing schema migrations.

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO site_settings (key, value)
SELECT
  'checkout',
  '{"coupons_enabled": true}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM site_settings WHERE key = 'checkout'
);

INSERT INTO site_settings (key, value)
SELECT
  'about',
  '{
    "badge": "The artist",
    "title": "Timeless artistry, intentionally crafted",
    "description": "Rubi Sen specializes in skin-first bridal makeup that photographs beautifully.",
    "artist_label": "Meet the artist",
    "artist_name": "Nithiya Rubini",
    "artist_statement": "Makeup is not a mask. It is a refinement of light, texture, and character.",
    "body": "With over three years in luxury bridal work, We''re known for our skin-first approach to bridal makeup. We focus on colour correction and light placement. Looks are built around wardrobe, jewellery, and venue lighting.",
    "pillars": [
      {"title": "Skin inclusivity", "copy": "Custom blends for every tone and texture. No ashiness, no oxidation."},
      {"title": "Certified training", "copy": "HD and airbrush techniques, built for ceremony light and evening photos."},
      {"title": "Calm presence", "copy": "A grounded dressing-room energy so the morning stays serene."}
    ]
  }'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM site_settings WHERE key = 'about'
);
