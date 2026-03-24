-- Add last_seen_at to profiles for login status tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
