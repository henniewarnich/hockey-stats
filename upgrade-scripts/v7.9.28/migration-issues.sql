-- v7.9.28: Issues / bug reporting system
-- Run in Supabase SQL Editor

CREATE TABLE issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  issue_type TEXT NOT NULL,           -- 'inaccuracy' | 'bug' | 'other'
  pertains_to TEXT NOT NULL,          -- 'team' | 'match' | 'app'
  pertains_ref UUID,                  -- team_id or match_id (null for app)
  pertains_app_area TEXT,             -- for app: 'live_matches','upcoming_matches','statistics','teams','user_experience','login','other'
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',         -- 'open' | 'in_progress' | 'resolved'
  admin_response TEXT,
  admin_response_by UUID REFERENCES profiles(id),
  admin_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Users can read their own issues
CREATE POLICY "Users read own issues" ON issues FOR SELECT
  USING (user_id = auth.uid());

-- Admin/comm_admin can read all issues
CREATE POLICY "Admin read all issues" ON issues FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin'))
  );

-- Any authenticated user can create issues
CREATE POLICY "Authenticated create issues" ON issues FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admin can update issues (respond, change status)
CREATE POLICY "Admin update issues" ON issues FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin'))
  );

-- Index for fast lookups
CREATE INDEX idx_issues_user ON issues(user_id);
CREATE INDEX idx_issues_status ON issues(status);
