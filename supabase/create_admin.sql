-- Create admin user for Glow with Rubi
-- Run this in Supabase SQL Editor after creating the user in Authentication → Users

INSERT INTO admins (id, email, full_name, role, is_active)
VALUES (
  'cffb0b2b-d36d-487e-9f72-cf0abc199dc5',
  'YOUR_EMAIL_HERE@gmail.com',   -- ← replace with your actual email
  'Rubi',
  'owner',
  true
);
