-- ============================================================
-- kykie.net v7.10.25 — Penalty shootout + Match abandoned
-- Run in Supabase SQL Editor
-- ============================================================

-- Penalty shootout scores (nullable — only set when match decided by penalties)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_penalty_score INT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_penalty_score INT;

-- No migration needed for abandoned status — 'status' is already TEXT
-- and all stat queries filter on status = 'ended', so abandoned matches
-- are automatically excluded from stats, rankings, and predictions.

-- Verify:
-- SELECT status, count(*) FROM matches GROUP BY status;
-- Should show: upcoming, live, ended, pending (and 'abandoned' once used)
