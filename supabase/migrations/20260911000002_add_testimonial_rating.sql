-- Add star rating to testimonials table

ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5);
