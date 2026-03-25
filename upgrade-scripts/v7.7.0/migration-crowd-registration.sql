-- v7.7.0: Crowd registration fields + self-register RPC

-- New profile columns for crowd users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alias_nickname TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS biological_gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_town TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sport_interest TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supporting_team_ids UUID[] DEFAULT '{}';

-- Self-registration RPC for crowd users (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION register_crowd_profile(
  p_id UUID,
  p_email TEXT,
  p_firstname TEXT,
  p_lastname TEXT,
  p_username TEXT,
  p_alias_nickname TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_biological_gender TEXT DEFAULT NULL,
  p_home_town TEXT DEFAULT NULL,
  p_sport_interest TEXT[] DEFAULT '{}',
  p_supporting_team_ids UUID[] DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, firstname, lastname, username, role, roles,
    alias_nickname, date_of_birth, biological_gender, home_town,
    sport_interest, supporting_team_ids
  ) VALUES (
    p_id, p_email, p_firstname, p_lastname, p_username, 'crowd', ARRAY['crowd'],
    p_alias_nickname, p_date_of_birth, p_biological_gender, p_home_town,
    p_sport_interest, p_supporting_team_ids
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
