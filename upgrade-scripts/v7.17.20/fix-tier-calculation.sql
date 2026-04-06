-- ============================================
-- kykie.net v7.17.20 — Fix tier calculation
-- Use ALL ended matches, not just credited ones
-- ============================================

CREATE OR REPLACE FUNCTION recalc_team_tier(p_team_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_total NUMERIC;
  v_credit_matches INT;
  v_all_matches INT;
  v_avg NUMERIC;
  v_tier TEXT;
BEGIN
  -- Total credits for this team
  SELECT COALESCE(SUM(credits), 0), COUNT(DISTINCT match_id)
  INTO v_total, v_credit_matches
  FROM team_credits
  WHERE team_id = p_team_id AND match_id IS NOT NULL;

  -- Count ALL ended matches for this team
  SELECT COUNT(*)
  INTO v_all_matches
  FROM matches
  WHERE status = 'ended'
    AND (home_team_id = p_team_id OR away_team_id = p_team_id);

  v_avg := CASE WHEN v_all_matches > 0 THEN v_total / v_all_matches ELSE 0 END;
  v_tier := CASE WHEN v_avg >= 20 THEN 'free_plus' ELSE 'free' END;

  -- Upsert team_tiers
  INSERT INTO team_tiers (team_id, credits_total, matches_count, avg_per_match, tier, updated_at)
  VALUES (p_team_id, v_total, v_all_matches, v_avg, v_tier, now())
  ON CONFLICT (team_id) DO UPDATE SET
    credits_total = v_total,
    matches_count = v_all_matches,
    avg_per_match = v_avg,
    tier = v_tier,
    updated_at = now();

  RETURN json_build_object('total', v_total, 'matches', v_all_matches, 'avg', v_avg, 'tier', v_tier);
END;
$fn$;

-- Recalculate all teams
DO $fn$
DECLARE
  tid UUID;
BEGIN
  FOR tid IN SELECT DISTINCT team_id FROM team_credits LOOP
    PERFORM recalc_team_tier(tid);
  END LOOP;
END;
$fn$;

-- Verify
SELECT
  i.name AS institution,
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
