-- ============================================
-- kykie.net v7.17.0 — Team credits & tiers
-- ============================================

-- Team credits ledger (per-match granularity)
CREATE TABLE IF NOT EXISTS team_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) NOT NULL,
  match_id UUID REFERENCES matches(id),
  action TEXT NOT NULL,  -- 'schedule', 'score', 'live_pro', 'live_lite', 'video_same_day', 'video_older', 'viewer', 'purchase', 'penalty'
  credits NUMERIC NOT NULL,
  source_user_id UUID REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_team_credits_team ON team_credits(team_id);
CREATE INDEX idx_team_credits_match ON team_credits(match_id);

-- Team tier status (cached, one row per team)
CREATE TABLE IF NOT EXISTS team_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) NOT NULL UNIQUE,
  credits_total NUMERIC DEFAULT 0,
  matches_count INT DEFAULT 0,
  avg_per_match NUMERIC DEFAULT 0,
  tier TEXT DEFAULT 'free',  -- calculated: 'free' | 'free_plus'
  -- Admin overrides
  tier_override TEXT,        -- 'free_plus' | 'premium' | NULL (use calculated)
  override_expires DATE,     -- NULL = permanent
  override_note TEXT,        -- "Early adopter deal", "Beta tester" etc.
  override_set_by UUID REFERENCES profiles(id),
  override_set_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_team_tiers_team ON team_tiers(team_id);

-- RLS policies
ALTER TABLE team_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_tiers ENABLE ROW LEVEL SECURITY;

-- Public read for team_credits and team_tiers (coaches need to see their team's data)
CREATE POLICY "Public read team_credits" ON team_credits FOR SELECT USING (true);
CREATE POLICY "Public read team_tiers" ON team_tiers FOR SELECT USING (true);

-- Admin/comm_admin can insert team_credits
CREATE POLICY "Admin insert team_credits" ON team_credits FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin', 'commentator')));

-- Admin can manage team_tiers
CREATE POLICY "Admin insert team_tiers" ON team_tiers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin')));

CREATE POLICY "Admin update team_tiers" ON team_tiers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin')));

-- RPC: Recalculate team tier from credits
CREATE OR REPLACE FUNCTION recalc_team_tier(p_team_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_total NUMERIC;
  v_count INT;
  v_avg NUMERIC;
  v_tier TEXT;
BEGIN
  -- Count total credits and distinct matches
  SELECT COALESCE(SUM(credits), 0), COUNT(DISTINCT match_id)
  INTO v_total, v_count
  FROM team_credits
  WHERE team_id = p_team_id AND match_id IS NOT NULL;

  v_avg := CASE WHEN v_count > 0 THEN v_total / v_count ELSE 0 END;
  v_tier := CASE WHEN v_avg >= 20 THEN 'free_plus' ELSE 'free' END;

  -- Upsert team_tiers
  INSERT INTO team_tiers (team_id, credits_total, matches_count, avg_per_match, tier, updated_at)
  VALUES (p_team_id, v_total, v_count, v_avg, v_tier, now())
  ON CONFLICT (team_id) DO UPDATE SET
    credits_total = v_total,
    matches_count = v_count,
    avg_per_match = v_avg,
    tier = v_tier,
    updated_at = now();

  RETURN json_build_object('total', v_total, 'matches', v_count, 'avg', v_avg, 'tier', v_tier);
END;
$fn$;
