-- Add roles array column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}';

-- Backfill: set roles from existing role column
UPDATE profiles SET roles = ARRAY[role] WHERE roles = '{}' OR roles IS NULL;

-- Update create_profile to also set roles
CREATE OR REPLACE FUNCTION create_profile(p_id UUID, p_email TEXT, p_firstname TEXT, p_lastname TEXT, p_username TEXT, p_role TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, firstname, lastname, username, role, roles)
  VALUES (p_id, p_email, p_firstname, p_lastname, p_username, p_role, ARRAY[p_role]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
