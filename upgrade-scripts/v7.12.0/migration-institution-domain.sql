-- v7.12.0 — Add domain column to institutions (for coach vetting)
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS domain TEXT;

-- Verification:
-- SELECT id, name, domain FROM institutions ORDER BY name LIMIT 10;
