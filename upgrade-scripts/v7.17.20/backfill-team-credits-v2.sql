-- ============================================
-- kykie.net v7.17.22 — Comprehensive team credits backfill
-- Awards team credits from MATCHES directly (not audit_log)
-- Catches matches that pre-date audit logging
-- Run AFTER migration-team-credits.sql and fix-tier-calculation.sql
-- ============================================

-- Clear existing team credits to avoid duplicates
TRUNCATE team_credits;

-- 1. Live Pro matches (duration > 300s = 5 min, has events)
INSERT INTO team_credits (team_id, match_id, action, credits, created_at)
SELECT m.home_team_id, m.id, 'live_pro', 50, COALESCE(m.updated_at, m.created_at)
FROM matches m
WHERE m.status = 'ended' AND m.duration > 300
  AND EXISTS (SELECT 1 FROM match_events me WHERE me.match_id = m.id LIMIT 1);

INSERT INTO team_credits (team_id, match_id, action, credits, created_at)
SELECT m.away_team_id, m.id, 'live_pro', 50, COALESCE(m.updated_at, m.created_at)
FROM matches m
WHERE m.status = 'ended' AND m.duration > 300
  AND EXISTS (SELECT 1 FROM match_events me WHERE me.match_id = m.id LIMIT 1);

-- 2. Quick scores (ended, no duration or duration = 0, no events)
INSERT INTO team_credits (team_id, match_id, action, credits, created_at)
SELECT m.home_team_id, m.id, 'score', 5, COALESCE(m.updated_at, m.created_at)
FROM matches m
WHERE m.status = 'ended' AND (m.duration IS NULL OR m.duration = 0)
  AND NOT EXISTS (SELECT 1 FROM match_events me WHERE me.match_id = m.id LIMIT 1);

INSERT INTO team_credits (team_id, match_id, action, credits, created_at)
SELECT m.away_team_id, m.id, 'score', 5, COALESCE(m.updated_at, m.created_at)
FROM matches m
WHERE m.status = 'ended' AND (m.duration IS NULL OR m.duration = 0)
  AND NOT EXISTS (SELECT 1 FROM match_events me WHERE me.match_id = m.id LIMIT 1);

-- 3. Scheduled upcoming matches
INSERT INTO team_credits (team_id, match_id, action, credits, created_at)
SELECT m.home_team_id, m.id, 'schedule', 5, m.created_at
FROM matches m
WHERE m.status = 'upcoming';

INSERT INTO team_credits (team_id, match_id, action, credits, created_at)
SELECT m.away_team_id, m.id, 'schedule', 5, m.created_at
FROM matches m
WHERE m.status = 'upcoming';

-- Recalculate all team tiers (using the fixed RPC that counts ALL ended matches)
DO $fn$
DECLARE
  tid UUID;
BEGIN
  FOR tid IN SELECT DISTINCT team_id FROM team_credits LOOP
    PERFORM recalc_team_tier(tid);
  END LOOP;
END;
$fn$;

-- Verify results
SELECT
  i.name AS institution,
  tt.credits_total,
  tt.matches_count AS total_matches,
  ROUND(tt.avg_per_match, 1) AS avg_per_match,
  tt.tier
FROM team_tiers tt
JOIN teams t ON t.id = tt.team_id
JOIN institutions i ON i.id = t.institution_id
ORDER BY tt.avg_per_match DESC;
