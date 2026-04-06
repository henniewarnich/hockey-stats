-- ============================================
-- kykie.net v7.17.0 — Backfill team credits
-- Run AFTER migration-team-credits.sql
-- ============================================

-- Video review completions → both teams get credits
INSERT INTO team_credits (team_id, match_id, action, credits, source_user_id, created_at)
SELECT m.home_team_id, a.target_id,
  CASE WHEN a.created_at::date = m.match_date::date THEN 'video_same_day' ELSE 'video_older' END,
  CASE WHEN a.created_at::date = m.match_date::date THEN 30 ELSE 20 END,
  a.user_id, a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action = 'video_review_end' AND a.user_id IS NOT NULL;

INSERT INTO team_credits (team_id, match_id, action, credits, source_user_id, created_at)
SELECT m.away_team_id, a.target_id,
  CASE WHEN a.created_at::date = m.match_date::date THEN 'video_same_day' ELSE 'video_older' END,
  CASE WHEN a.created_at::date = m.match_date::date THEN 30 ELSE 20 END,
  a.user_id, a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action = 'video_review_end' AND a.user_id IS NOT NULL;

-- Live match completions (exclude video_review_end matches) → both teams
INSERT INTO team_credits (team_id, match_id, action, credits, source_user_id, created_at)
SELECT m.home_team_id, a.target_id, 'live_pro', 50, a.user_id, a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action = 'match_end' AND a.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM audit_log vr WHERE vr.action = 'video_review_end' AND vr.target_id = a.target_id AND vr.user_id = a.user_id);

INSERT INTO team_credits (team_id, match_id, action, credits, source_user_id, created_at)
SELECT m.away_team_id, a.target_id, 'live_pro', 50, a.user_id, a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action = 'match_end' AND a.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM audit_log vr WHERE vr.action = 'video_review_end' AND vr.target_id = a.target_id AND vr.user_id = a.user_id);

-- Quick scores → both teams get 5
INSERT INTO team_credits (team_id, match_id, action, credits, source_user_id, created_at)
SELECT m.home_team_id, a.target_id, 'score', 5, a.user_id, a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action IN ('quick_score_save', 'quick_score_admin') AND a.user_id IS NOT NULL;

INSERT INTO team_credits (team_id, match_id, action, credits, source_user_id, created_at)
SELECT m.away_team_id, a.target_id, 'score', 5, a.user_id, a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action IN ('quick_score_save', 'quick_score_admin') AND a.user_id IS NOT NULL;

-- Match scheduling → both teams get 5
INSERT INTO team_credits (team_id, match_id, action, credits, source_user_id, created_at)
SELECT m.home_team_id, a.target_id, 'schedule', 5, a.user_id, a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action = 'match_schedule' AND a.user_id IS NOT NULL AND a.target_id IS NOT NULL;

INSERT INTO team_credits (team_id, match_id, action, credits, source_user_id, created_at)
SELECT m.away_team_id, a.target_id, 'schedule', 5, a.user_id, a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action = 'match_schedule' AND a.user_id IS NOT NULL AND a.target_id IS NOT NULL;

-- Recalculate tiers for all teams that have credits
DO $fn$
DECLARE
  tid UUID;
BEGIN
  FOR tid IN SELECT DISTINCT team_id FROM team_credits LOOP
    PERFORM recalc_team_tier(tid);
  END LOOP;
END;
$fn$;

-- Verify: top teams by avg credits per match
SELECT
  i.name AS institution,
  t.name AS team,
  tt.credits_total,
  tt.matches_count,
  ROUND(tt.avg_per_match, 1) AS avg_per_match,
  tt.tier,
  tt.tier_override
FROM team_tiers tt
JOIN teams t ON t.id = tt.team_id
JOIN institutions i ON i.id = t.institution_id
ORDER BY tt.avg_per_match DESC
LIMIT 20;
