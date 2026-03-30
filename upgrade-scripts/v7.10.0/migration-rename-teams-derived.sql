-- ============================================================
-- kykie.net v7.10.4 — Rename teams to derived pattern
-- Run in Supabase SQL Editor AFTER v7.10.0 migration
-- ============================================================
-- Updates all team names from "Girls Hockey 1st" to "Girls Hockey U18"
-- (derived from gender + sport + age_group fields)

UPDATE teams SET name = gender || ' ' || sport || ' ' || age_group
WHERE name != (gender || ' ' || sport || ' ' || age_group);

-- Verify:
-- SELECT name, gender, sport, age_group, count(*) FROM teams GROUP BY name, gender, sport, age_group;
