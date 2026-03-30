-- v7.9.77: Canonical match_stats migration
-- Safe to run any time — all IF NOT EXISTS, no sequence dependency
-- Run in Supabase SQL Editor

-- Ensure match_stats table exists with all columns
CREATE TABLE IF NOT EXISTS match_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) NOT NULL,
  team TEXT NOT NULL,
  quarter INT,
  goals INT DEFAULT 0,
  sc_goals INT DEFAULT 0,
  shots_on INT DEFAULT 0,
  shots_off INT DEFAULT 0,
  d_entries INT DEFAULT 0,
  atk_zone_entries INT DEFAULT 0,
  short_corners INT DEFAULT 0,
  long_corners INT DEFAULT 0,
  turnovers_won INT DEFAULT 0,
  poss_lost INT DEFAULT 0,
  territory_pct INT DEFAULT 0,
  possession_time_pct INT,
  territory_time_pct INT,
  sc_outcomes JSONB
);

-- Add any columns that might be missing (idempotent)
ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS sc_goals INT DEFAULT 0;
ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS atk_zone_entries INT DEFAULT 0;
ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS long_corners INT DEFAULT 0;
ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS possession_time_pct INT;
ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS territory_time_pct INT;
ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS sc_outcomes JSONB;

-- RLS: public read
ALTER TABLE match_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read match_stats" ON match_stats;
CREATE POLICY "Public read match_stats" ON match_stats FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete (for archival)
DROP POLICY IF EXISTS "Auth write match_stats" ON match_stats;
CREATE POLICY "Auth write match_stats" ON match_stats 
  FOR ALL USING (auth.role() = 'authenticated');

-- Clean slate: clear all pre-computed stats so Recompute rebuilds everything
DELETE FROM match_stats;

-- stats_archived column on matches is no longer used, but leave it for safety
-- (the recompute button ignores it entirely)
