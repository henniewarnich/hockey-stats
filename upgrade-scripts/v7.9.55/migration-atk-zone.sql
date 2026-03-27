-- v7.9.55: Add atk_zone_entries to match_stats
-- Run in Supabase SQL Editor

ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS atk_zone_entries INT DEFAULT 0;

-- Reset stats_archived flag so backfill can recompute with new field
UPDATE matches SET stats_archived = false WHERE stats_archived = true;
