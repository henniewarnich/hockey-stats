-- ============================================================
-- kykie.net v7.10.0 — Institutions Migration
-- Run in Supabase SQL Editor
-- ============================================================
-- WHAT THIS DOES:
-- 1. Creates institutions table (schools, clubs, universities)
-- 2. Populates institutions from existing team data
-- 3. Adds institution_id, team_description, gender, age_group, sport to teams
-- 4. Links every team to its institution
-- 5. Stores original team name in team_description
-- 6. Renames all team.name to 'Girls Hockey 1st'
-- 7. Moves color + short_name to institution (keeps on team for backward compat)
-- 8. RLS policies on institutions
-- ============================================================

-- ─── 1. CREATE INSTITUTIONS TABLE ─────────────────────────

CREATE TABLE IF NOT EXISTS institutions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,                    -- Full name: "Paarl Girls High"
  short_name  TEXT,                             -- Abbreviation: "PG", "Bloemhof"
  other_names TEXT,                             -- Comma-separated aliases for search
  color       TEXT NOT NULL DEFAULT '#1D4ED8',  -- School/club primary color
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. ADD NEW COLUMNS TO TEAMS ──────────────────────────

ALTER TABLE teams ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_description TEXT;  -- "Original name before rename"
ALTER TABLE teams ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Girls';       -- Girls | Boys
ALTER TABLE teams ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT 'U18';      -- U14 | U16 | U18
ALTER TABLE teams ADD COLUMN IF NOT EXISTS sport TEXT DEFAULT 'Hockey';       -- Hockey | Rugby | Netball

-- ─── 3. POPULATE INSTITUTIONS FROM EXISTING TEAMS ─────────
-- Each current team becomes one institution
-- Only runs for teams not yet linked (idempotent)

DO $fn$
DECLARE
  t RECORD;
  inst_id UUID;
BEGIN
  FOR t IN 
    SELECT id, name, color, short_name 
    FROM teams 
    WHERE institution_id IS NULL
  LOOP
    -- Check if institution already exists with same name (re-run safety)
    SELECT i.id INTO inst_id 
    FROM institutions i 
    WHERE LOWER(i.name) = LOWER(t.name)
    LIMIT 1;

    IF inst_id IS NULL THEN
      INSERT INTO institutions (name, short_name, color)
      VALUES (t.name, t.short_name, t.color)
      RETURNING id INTO inst_id;
    END IF;

    -- Link team to institution + store original name + rename
    UPDATE teams SET 
      institution_id = inst_id,
      team_description = t.name,
      name = 'Girls Hockey 1st'
    WHERE id = t.id;
  END LOOP;
END;
$fn$;

-- ─── 4. RLS POLICIES ON INSTITUTIONS ──────────────────────

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Public can read all institutions
DROP POLICY IF EXISTS "Public read institutions" ON institutions;
CREATE POLICY "Public read institutions" ON institutions 
  FOR SELECT USING (true);

-- Authenticated users can insert (for crowd team suggestions)
DROP POLICY IF EXISTS "Auth insert institutions" ON institutions;
CREATE POLICY "Auth insert institutions" ON institutions 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update (admin will enforce in app)
DROP POLICY IF EXISTS "Auth update institutions" ON institutions;
CREATE POLICY "Auth update institutions" ON institutions 
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Authenticated users can delete (admin will enforce in app)
DROP POLICY IF EXISTS "Auth delete institutions" ON institutions;
CREATE POLICY "Auth delete institutions" ON institutions 
  FOR DELETE USING (auth.role() = 'authenticated');

-- ─── 5. VERIFICATION QUERIES ──────────────────────────────
-- Run these after the migration to verify:

-- Check institutions were created:
-- SELECT count(*) FROM institutions;
-- SELECT name, short_name, color FROM institutions ORDER BY name LIMIT 20;

-- Check teams are linked:
-- SELECT t.id, t.name, t.team_description, t.gender, t.age_group, t.sport, 
--        i.name as institution_name, i.short_name
-- FROM teams t
-- LEFT JOIN institutions i ON t.institution_id = i.id
-- ORDER BY i.name LIMIT 20;

-- Check no orphans:
-- SELECT count(*) FROM teams WHERE institution_id IS NULL;
