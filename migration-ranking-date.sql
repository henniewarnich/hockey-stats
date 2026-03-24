-- Add ranking_date to ranking_sets (display date, separate from created_at)
ALTER TABLE ranking_sets ADD COLUMN IF NOT EXISTS ranking_date DATE;

-- Backfill from scraped_at (which is the closest to actual ranking date)
UPDATE ranking_sets SET ranking_date = scraped_at WHERE ranking_date IS NULL;

-- Make it required going forward
ALTER TABLE ranking_sets ALTER COLUMN ranking_date SET DEFAULT CURRENT_DATE;
