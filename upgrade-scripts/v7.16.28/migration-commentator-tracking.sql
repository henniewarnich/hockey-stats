-- ============================================
-- kykie.net v7.16.28 — Fix commentator tracking
-- ============================================

-- Allow commentators to insert themselves into match_commentators
-- (needed for auto-assignment when they start recording)
CREATE POLICY "Commentators self-assign" ON match_commentators FOR INSERT
  WITH CHECK (
    commentator_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin', 'commentator'))
  );

-- Also allow commentators to upsert (needed for the ON CONFLICT)
CREATE POLICY "Commentators self-update" ON match_commentators FOR UPDATE
  USING (
    commentator_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin', 'commentator'))
  );
