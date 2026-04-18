-- Allow any authenticated user to view reports (client-side gates full vs teaser)
-- Drop the coach-only SELECT policy and replace with authenticated-user policy
DROP POLICY IF EXISTS match_reports_coach_select ON match_reports;

CREATE POLICY match_reports_authenticated_select ON match_reports
  FOR SELECT USING (auth.uid() IS NOT NULL);
