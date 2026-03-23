-- Fix RLS for match_commentators (same FOR ALL issue as profiles)
DROP POLICY IF EXISTS "Admins manage match_commentators" ON match_commentators;

CREATE POLICY "Admins insert match_commentators" ON match_commentators FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin')));

CREATE POLICY "Admins update match_commentators" ON match_commentators FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin')));

CREATE POLICY "Admins delete match_commentators" ON match_commentators FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin')));

-- Fix RLS for coach_teams
DROP POLICY IF EXISTS "Admins manage coach_teams" ON coach_teams;

CREATE POLICY "Admins insert coach_teams" ON coach_teams FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins update coach_teams" ON coach_teams FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins delete coach_teams" ON coach_teams FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Matches: allow commentators to update (for lock/status changes)
CREATE POLICY "Commentators update matches" ON matches FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin', 'commentator')));
