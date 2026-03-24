-- Add previous ranking columns for trend display
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_prev_rank INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_prev_rank INTEGER;

-- Update snapshot function to capture both current and previous rankings
CREATE OR REPLACE FUNCTION snapshot_match_rankings(p_match_id UUID)
RETURNS void AS $$
DECLARE
  v_match RECORD;
  v_latest_set UUID;
  v_prev_set UUID;
  v_home_rank INTEGER;
  v_away_rank INTEGER;
  v_home_prev INTEGER;
  v_away_prev INTEGER;
BEGIN
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Get latest ranking set
  SELECT id INTO v_latest_set FROM ranking_sets ORDER BY created_at DESC LIMIT 1;
  IF v_latest_set IS NULL THEN RETURN; END IF;

  -- Get previous ranking set
  SELECT id INTO v_prev_set FROM ranking_sets WHERE id != v_latest_set ORDER BY created_at DESC LIMIT 1;

  -- Get current rankings
  SELECT position INTO v_home_rank FROM rankings WHERE ranking_set_id = v_latest_set AND team_id = v_match.home_team_id;
  SELECT position INTO v_away_rank FROM rankings WHERE ranking_set_id = v_latest_set AND team_id = v_match.away_team_id;

  -- Get previous rankings (if previous set exists)
  IF v_prev_set IS NOT NULL THEN
    SELECT position INTO v_home_prev FROM rankings WHERE ranking_set_id = v_prev_set AND team_id = v_match.home_team_id;
    SELECT position INTO v_away_prev FROM rankings WHERE ranking_set_id = v_prev_set AND team_id = v_match.away_team_id;
  END IF;

  -- Update match
  UPDATE matches SET
    home_rank = v_home_rank,
    away_rank = v_away_rank,
    home_prev_rank = v_home_prev,
    away_prev_rank = v_away_prev
  WHERE id = p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
