-- v7.12.5 — Rename crowd to supporter + registration role support

-- 1. Rename crowd → supporter in profiles
UPDATE profiles SET role = 'supporter' WHERE role = 'crowd';
UPDATE profiles SET roles = array_replace(roles, 'crowd', 'supporter') WHERE 'crowd' = ANY(roles);

-- 2. Rename in matches submitted_type
UPDATE matches SET submitted_type = 'supporter' WHERE submitted_type = 'crowd';

-- 3. Add commentator status + notification + terms columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commentator_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_live BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_rewards BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_general BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ;

-- 4. Replace RPC to accept role + notification + terms parameters
CREATE OR REPLACE FUNCTION register_crowd_profile(
  p_id UUID,
  p_email TEXT,
  p_firstname TEXT,
  p_lastname TEXT,
  p_username TEXT,
  p_role TEXT DEFAULT 'supporter',
  p_alias_nickname TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_biological_gender TEXT DEFAULT NULL,
  p_home_town TEXT DEFAULT NULL,
  p_sport_interest TEXT[] DEFAULT '{}',
  p_supporting_team_ids UUID[] DEFAULT '{}',
  p_notify_live BOOLEAN DEFAULT true,
  p_notify_rewards BOOLEAN DEFAULT true,
  p_notify_general BOOLEAN DEFAULT true,
  p_accepted_terms_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS void AS $fn$
BEGIN
  INSERT INTO public.profiles (
    id, email, firstname, lastname, username, role, roles,
    alias_nickname, date_of_birth, biological_gender, home_town,
    sport_interest, supporting_team_ids, commentator_status,
    notify_live, notify_rewards, notify_general, accepted_terms_at
  ) VALUES (
    p_id, p_email, p_firstname, p_lastname, p_username,
    p_role, ARRAY[p_role],
    p_alias_nickname, p_date_of_birth, p_biological_gender, p_home_town,
    p_sport_interest, p_supporting_team_ids,
    CASE WHEN p_role = 'commentator' THEN 'trainee' ELSE NULL END,
    p_notify_live, p_notify_rewards, p_notify_general, p_accepted_terms_at
  );
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verification:
-- SELECT role, count(*) FROM profiles GROUP BY role;
-- SELECT submitted_type, count(*) FROM matches WHERE submitted_type IS NOT NULL GROUP BY submitted_type;
