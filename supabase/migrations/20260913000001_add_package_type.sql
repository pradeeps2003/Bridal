-- Add package_type field to packages table
-- This allows admin to configure package types like 'popular', 'most_ordered', 'premium', etc.

-- Create enum for package types
CREATE TYPE package_type AS ENUM ('standard', 'popular', 'most_ordered', 'premium', 'new_arrival', 'limited');

-- Add the column to packages table
ALTER TABLE packages 
ADD COLUMN package_type package_type DEFAULT 'standard';

-- Create index for efficient filtering
CREATE INDEX idx_packages_type ON packages(package_type);

-- Add column for image_url if it doesn't exist (for hero section and cards)
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS image_url TEXT;