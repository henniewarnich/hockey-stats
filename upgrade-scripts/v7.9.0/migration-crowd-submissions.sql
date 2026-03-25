-- v7.8.0: Crowd-sourced submissions — pending matches & teams

-- Matches: crowd submission + approval columns
ALTER TABLE matches ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES profiles(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS submitted_type TEXT DEFAULT 'admin';  -- 'admin' | 'crowd'
ALTER TABLE matches ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Teams: status for pending suggestions
ALTER TABLE teams ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';  -- 'active' | 'pending'
ALTER TABLE teams ADD COLUMN IF NOT EXISTS suggested_by UUID REFERENCES profiles(id);

-- Backfill: all existing matches are admin-submitted
UPDATE matches SET submitted_type = 'admin' WHERE submitted_type IS NULL;

-- Backfill: all existing teams are active
UPDATE teams SET status = 'active' WHERE status IS NULL;

-- RLS: allow crowd users to insert pending matches
CREATE POLICY "Crowd insert pending matches" ON matches FOR INSERT
  WITH CHECK (status = 'pending' AND submitted_type = 'crowd');

-- RLS: allow crowd users to insert pending teams
CREATE POLICY "Crowd insert pending teams" ON teams FOR INSERT
  WITH CHECK (status = 'pending');

-- RPC: approve a pending match (admin/comm_admin only)
CREATE OR REPLACE FUNCTION approve_match(p_match_id UUID, p_approver_id UUID, p_new_status TEXT DEFAULT 'ended')
RETURNS void AS $$
BEGIN
  UPDATE matches
  SET status = p_new_status,
      approved_by = p_approver_id,
      approved_at = NOW()
  WHERE id = p_match_id AND status = 'pending';

  INSERT INTO audit_log (user_id, action, target_type, target_id, details)
  VALUES (p_approver_id, 'match_approve', 'match', p_match_id,
    jsonb_build_object('new_status', p_new_status));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: reject a pending match (deletes it)
CREATE OR REPLACE FUNCTION reject_match(p_match_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, target_type, target_id, details)
  VALUES (p_user_id, 'match_reject', 'match', p_match_id, '{}'::jsonb);

  DELETE FROM matches WHERE id = p_match_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: approve a pending team
CREATE OR REPLACE FUNCTION approve_team(p_team_id UUID, p_approver_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE teams SET status = 'active' WHERE id = p_team_id AND status = 'pending';

  INSERT INTO audit_log (user_id, action, target_type, target_id, details)
  VALUES (p_approver_id, 'team_approve', 'team', p_team_id, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: reject a pending team
CREATE OR REPLACE FUNCTION reject_team(p_team_id UUID, p_approver_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, target_type, target_id, details)
  VALUES (p_approver_id, 'team_reject', 'team', p_team_id, '{}'::jsonb);

  DELETE FROM teams WHERE id = p_team_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
