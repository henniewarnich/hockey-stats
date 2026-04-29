CREATE TABLE IF NOT EXISTS match_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL DEFAULT 'analysis' CHECK (report_type IN ('analysis', 'scouting', 'season')),
  title TEXT NOT NULL,
  html_content TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID REFERENCES profiles(id),
  UNIQUE(match_id, report_type)
);
ALTER TABLE match_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY match_reports_coach_select ON match_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM matches m JOIN coach_teams ct ON ct.team_id IN (m.home_team_id, m.away_team_id) WHERE m.id = match_reports.match_id AND ct.coach_id = auth.uid())
);
CREATE POLICY match_reports_admin_select ON match_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'commentator_admin'))
);
CREATE POLICY match_reports_admin_insert ON match_reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'commentator_admin'))
);
CREATE POLICY match_reports_admin_update ON match_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'commentator_admin'))
);
CREATE POLICY match_reports_admin_delete ON match_reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'commentator_admin'))
);
CREATE INDEX IF NOT EXISTS idx_match_reports_match_id ON match_reports(match_id);
