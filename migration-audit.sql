-- Add created_by to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Backfill: set created_by to locked_by where available
UPDATE matches SET created_by = locked_by WHERE created_by IS NULL AND locked_by IS NOT NULL;

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,           -- 'delete_match', 'delete_user', 'block_user', etc.
  target_type TEXT NOT NULL,           -- 'match', 'user', 'team'
  target_id   UUID,
  details     JSONB,                   -- extra context
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- Allow admins and comm admins to read audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit log" ON audit_log
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin')));

-- Delete match function: admin can delete any, comm admin can delete own
CREATE OR REPLACE FUNCTION delete_match(p_match_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_match RECORD;
  v_user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;
  
  -- Get match info
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;
  IF NOT FOUND THEN RETURN 'Match not found'; END IF;

  -- Check permission: admin can delete any, comm admin only their own
  IF v_user_role = 'admin' THEN
    -- allowed
  ELSIF v_user_role = 'commentator_admin' THEN
    IF v_match.created_by IS DISTINCT FROM p_user_id THEN
      RETURN 'You can only delete matches you created';
    END IF;
  ELSE
    RETURN 'Permission denied';
  END IF;

  -- Log it
  INSERT INTO audit_log (user_id, action, target_type, target_id, details)
  VALUES (p_user_id, 'delete_match', 'match', p_match_id, jsonb_build_object(
    'home_team_id', v_match.home_team_id,
    'away_team_id', v_match.away_team_id,
    'match_date', v_match.match_date,
    'status', v_match.status,
    'home_score', v_match.home_score,
    'away_score', v_match.away_score
  ));

  -- Delete cascade: events, commentators, reactions, viewers
  DELETE FROM event_reactions WHERE match_event_id IN (SELECT id FROM match_events WHERE match_id = p_match_id);
  DELETE FROM match_events WHERE match_id = p_match_id;
  DELETE FROM match_commentators WHERE match_id = p_match_id;
  DELETE FROM match_viewers WHERE match_id = p_match_id;
  DELETE FROM matches WHERE id = p_match_id;

  RETURN 'ok';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update delete_user to log
CREATE OR REPLACE FUNCTION delete_user(p_id UUID)
RETURNS void AS $$
BEGIN
  -- Log it (use the deleting admin's session)
  INSERT INTO audit_log (user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'delete_user', 'user', p_id, (
    SELECT jsonb_build_object('email', email, 'firstname', firstname, 'lastname', lastname, 'role', role)
    FROM profiles WHERE id = p_id
  ));

  DELETE FROM public.coach_teams WHERE coach_id = p_id;
  DELETE FROM public.match_commentators WHERE commentator_id = p_id;
  DELETE FROM public.profiles WHERE id = p_id;
  DELETE FROM auth.users WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert audit log function (callable from app for other actions)
CREATE OR REPLACE FUNCTION log_audit(p_user_id UUID, p_action TEXT, p_target_type TEXT, p_target_id UUID, p_details JSONB DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, target_type, target_id, details)
  VALUES (p_user_id, p_action, p_target_type, p_target_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
