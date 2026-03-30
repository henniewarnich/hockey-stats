-- v7.9.71: Add sc_outcomes JSON column to match_stats
-- Run in Supabase SQL Editor

ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS sc_outcomes JSONB;

-- Reset archived flag so backfill recomputes with SC outcomes
UPDATE matches SET stats_archived = false WHERE stats_archived = true;
