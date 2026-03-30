-- ============================================================
-- kykie.net v7.10.5 — Change age_group default from U18 to 1st
-- Run in Supabase SQL Editor
-- ============================================================

-- Update default
ALTER TABLE teams ALTER COLUMN age_group SET DEFAULT '1st';

-- Update existing data
UPDATE teams SET age_group = '1st' WHERE age_group = 'U18';

-- Re-derive team names
UPDATE teams SET name = gender || ' ' || sport || ' ' || age_group;

-- Verify:
-- SELECT name, age_group, count(*) FROM teams GROUP BY name, age_group;
