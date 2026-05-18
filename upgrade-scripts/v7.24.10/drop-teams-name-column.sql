-- v7.24.10 — Drop the legacy teams.name column
--
-- Background
-- ----------
-- The `teams.name` column used to store a derived string like "Boys Hockey 1st"
-- or "Girls Hockey 1st", duplicating data already held in sport / gender /
-- age_group / variant. It had two problems:
--
--   1. fetchTeams() ordered the match-setup picker by this column, so every
--      Boys team sorted ahead of every Girls team — the visible bug reported
--      in v7.24.10. Users only saw a wall of "Boys Hockey 1st" at the top.
--
--   2. It violated the "name must ALWAYS be built from sport + gender +
--      age_group" rule: it was a redundant denormalised copy that could drift.
--
-- v7.24.10 removes the column entirely. Display is now derived live by
-- teamDerivedName() / teamDisplayName() in src/utils/teams.js — the single
-- source of truth.
--
-- Run order
-- ---------
-- Apply this AFTER deploying the v7.24.10 web build. Reading from a non-existent
-- column will throw on older clients still in the cache.
--
-- Safety
-- ------
-- This is a destructive, one-way operation. There is no rollback that recovers
-- the strings — but they are losslessly derivable from the remaining columns.

-- Sanity check: list rows whose name does NOT match the expected derived form
-- (informational only — paste output if anything unexpected appears).
SELECT id, name, gender, age_group, sport, variant
FROM teams
WHERE name IS DISTINCT FROM CASE
  WHEN variant IS NOT NULL THEN COALESCE(gender, '') || ' ' || COALESCE(sport, 'Hockey') || ' ' || variant
  ELSE COALESCE(gender, '') || ' ' || COALESCE(sport, 'Hockey') || ' ' || COALESCE(age_group, '1st')
END
LIMIT 50;

-- Drop the column.
ALTER TABLE teams DROP COLUMN IF EXISTS name;

-- Verify.
SELECT column_name FROM information_schema.columns
WHERE table_name = 'teams' AND column_name = 'name';
-- Expected: no rows.
