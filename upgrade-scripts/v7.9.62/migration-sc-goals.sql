-- v7.9.62: Add sc_goals to match_stats
-- Run in Supabase SQL Editor

ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS sc_goals INT DEFAULT 0;

-- Reset stats_archived flag so backfill can recompute with new field
UPDATE matches SET stats_archived = false WHERE stats_archived = true;
