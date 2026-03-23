-- ╔══════════════════════════════════════════════════════╗
-- ║  Kykie.net — User System Migration                  ║
-- ║  Run this in Supabase SQL Editor                    ║
-- ║  AFTER enabling Supabase Auth in the dashboard      ║
-- ╚══════════════════════════════════════════════════════╝

-- ─── USER PROFILES ───────────────────────────────────
-- Links to Supabase Auth (auth.users) for login
-- Stores app-specific user data and roles
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  firstname   TEXT NOT NULL,
  lastname    TEXT NOT NULL,
  username    TEXT NOT NULL UNIQUE,  -- default: firstname.lastname
  role        TEXT NOT NULL DEFAULT 'viewer',
    -- admin | commentator_admin | commentator | coach | viewer
  blocked     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, firstname, lastname, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstname', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastname', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── COACH ↔ TEAM ASSIGNMENTS ────────────────────────
-- A coach can be assigned to multiple teams
-- An admin assigns coaches to teams
CREATE TABLE coach_teams (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coach_id, team_id)
);

-- ─── MATCH COMMENTATOR ASSIGNMENTS ───────────────────
-- Multiple commentators can be assigned to a match
-- First one to start/score locks it
CREATE TABLE match_commentators (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id        UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  commentator_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, commentator_id)
);

-- ─── MATCHES: ADD NEW COLUMNS ────────────────────────
-- Add scheduled_time for upcoming matches
-- Add locked_by to track which commentator started/scored
ALTER TABLE matches ADD COLUMN IF NOT EXISTS scheduled_time TIME;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES profiles(id);
-- Update status options: setup → upcoming
-- status values: upcoming | live | paused | ended

-- ─── INDEXES ─────────────────────────────────────────
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_coach_teams_coach ON coach_teams(coach_id);
CREATE INDEX idx_coach_teams_team ON coach_teams(team_id);
CREATE INDEX idx_match_commentators_match ON match_commentators(match_id);
CREATE INDEX idx_match_commentators_user ON match_commentators(commentator_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_commentators ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles (needed for display names)
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything on profiles
CREATE POLICY "Admins manage profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Commentator admins can manage commentator profiles
CREATE POLICY "CommAdmin manage commentators" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'commentator_admin')
  );

-- Public read on assignments
CREATE POLICY "Public read coach_teams" ON coach_teams FOR SELECT USING (true);
CREATE POLICY "Public read match_commentators" ON match_commentators FOR SELECT USING (true);

-- Admins manage all assignments
CREATE POLICY "Admins manage coach_teams" ON coach_teams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin'))
  );

CREATE POLICY "Admins manage match_commentators" ON match_commentators
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin'))
  );

-- ─── UPDATE TRIGGER ──────────────────────────────────
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ENABLE REALTIME ON NEW TABLES ───────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
