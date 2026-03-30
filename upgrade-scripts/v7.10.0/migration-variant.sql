-- ============================================================
-- kykie.net v7.10.10 — Add variant column to teams
-- Run in Supabase SQL Editor
-- ============================================================
-- For teams that need a variant identifier within the same
-- institution + sport + gender + age_group (e.g. "Festival", "2nds")

ALTER TABLE teams ADD COLUMN IF NOT EXISTS variant TEXT;

-- Re-derive team names to include variant where set:
-- UPDATE teams SET name = gender || ' ' || sport || ' ' || age_group || ' (' || variant || ')'
-- WHERE variant IS NOT NULL;
