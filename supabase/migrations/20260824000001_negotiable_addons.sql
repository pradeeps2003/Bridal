-- Negotiable extras (hair extensions, jewellery, extra draping) are quoted after seeing the look.

ALTER TABLE addons
  ADD COLUMN IF NOT EXISTS pricing_type TEXT NOT NULL DEFAULT 'FIXED'
    CHECK (pricing_type IN ('FIXED', 'STARTING_FROM', 'CUSTOM_QUOTE'));

UPDATE addons
SET pricing_type = 'CUSTOM_QUOTE',
    description = 'Quoted after we see hair length, volume, and the look. Not a fixed menu price.'
WHERE slug = 'hair-extension';

UPDATE addons
SET pricing_type = 'CUSTOM_QUOTE',
    description = 'Quoted based on jewellery weight and setting time.'
WHERE slug = 'jewellery-setting';

UPDATE addons
SET pricing_type = 'CUSTOM_QUOTE',
    description = 'Quoted based on extra outfits and draping time.'
WHERE slug = 'additional-draping';

-- Travel is already calculated from home vs studio in booking, so hide this duplicate extra.
UPDATE addons
SET is_active = false
WHERE slug = 'travel';
