-- Function to snapshot rankings from latest ranking_set onto a match
CREATE OR REPLACE FUNCTION snapshot_match_rankings(p_match_id UUID)
RETURNS void AS $$
DECLARE
  v_match RECORD;
  v_latest_set UUID;
  v_home_rank INTEGER;
  v_away_rank INTEGER;
BEGIN
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Get latest ranking set
  SELECT id INTO v_latest_set FROM ranking_sets ORDER BY created_at DESC LIMIT 1;
  IF v_latest_set IS NULL THEN RETURN; END IF;

  -- Get rankings
  SELECT position INTO v_home_rank FROM rankings WHERE ranking_set_id = v_latest_set AND team_id = v_match.home_team_id;
  SELECT position INTO v_away_rank FROM rankings WHERE ranking_set_id = v_latest_set AND team_id = v_match.away_team_id;

  -- Update match
  UPDATE matches SET home_rank = v_home_rank, away_rank = v_away_rank WHERE id = p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
