-- v7.9.64: Add time-based possession and territory to match_stats
-- Run in Supabase SQL Editor

ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS possession_time_pct INT;
ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS territory_time_pct INT;

-- Reset stats_archived flag so backfill recomputes all matches with time-based values
UPDATE matches SET stats_archived = false WHERE stats_archived = true;
