-- v7.21.0 — Communication log + coach digest notifications
-- Generic log of outbound communications (kept reusable for future comm types)
-- plus an RPC that sends a digest of match reports to a single coach.
-- Also drops the older single-report notify_coaches_of_report RPC, which is
-- replaced by notify_coach_digest and is no longer called from the client.

DROP FUNCTION IF EXISTS notify_coaches_of_report(UUID);

-- ─── Generic communication log ─────────────────────────────
CREATE TABLE IF NOT EXISTS communication_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comm_type       TEXT NOT NULL,         -- e.g. 'report_digest'
  recipient_id    UUID,                  -- profiles.id (nullable: profile may be deleted later)
  recipient_email TEXT NOT NULL,         -- denormalised so audit survives profile deletion
  subject         TEXT NOT NULL,
  related_ids     JSONB,                 -- e.g. {"report_ids": ["uuid", ...]}
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  sent_by         UUID REFERENCES profiles(id),
  status          TEXT DEFAULT 'sent',   -- 'sent' | 'failed'
  error_message   TEXT
);

CREATE INDEX IF NOT EXISTS idx_comm_log_recipient   ON communication_log(recipient_id);
CREATE INDEX IF NOT EXISTS idx_comm_log_type_sent   ON communication_log(comm_type, sent_at DESC);

ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_read_comm_log ON communication_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin'))
);

CREATE POLICY admin_insert_comm_log ON communication_log FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin'))
);

-- ─── Coach digest RPC ──────────────────────────────────────
-- Sends one digest email to a single coach covering the given report IDs,
-- and writes a row to communication_log. Skips coaches in 'pending' status.
-- p_override_email: when non-null, email is redirected there and the send is
-- NOT logged (test/preview mode — keeps audit + already-notified state clean).
CREATE OR REPLACE FUNCTION notify_coach_digest(
  p_coach_id      UUID,
  p_report_ids    UUID[],
  p_override_email TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_coach     RECORD;
  v_report    RECORD;
  v_html      TEXT;
  v_subject   TEXT;
  v_count     INT := 0;
  v_log_id    UUID;
  v_send_to   TEXT;
  v_test_mode BOOLEAN := p_override_email IS NOT NULL;
BEGIN
  IF p_report_ids IS NULL OR array_length(p_report_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('error', 'No reports specified');
  END IF;

  SELECT id, firstname, email, coach_status
  INTO v_coach
  FROM profiles
  WHERE id = p_coach_id;

  IF NOT FOUND OR v_coach.email IS NULL THEN
    RETURN jsonb_build_object('error', 'Coach not found or has no email');
  END IF;

  IF v_coach.coach_status = 'pending' AND NOT v_test_mode THEN
    RETURN jsonb_build_object('error', 'Coach is pending — not notifying', 'recipient', v_coach.email);
  END IF;

  v_send_to := COALESCE(p_override_email, v_coach.email);

  v_html := '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0B0F1A;color:#E2E8F0;padding:24px;border-radius:12px">'
    || '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid #1E293B;margin-bottom:20px">'
    || '<tr>'
    || '<td style="padding-bottom:14px;text-align:left;vertical-align:middle">'
    || '<img src="https://kykie.net/kykie-logo-light.png" alt="kykie" height="24" style="height:24px;width:auto;display:inline-block">'
    || '</td>'
    || '<td style="padding-bottom:14px;text-align:right;vertical-align:middle;font-size:10px;font-weight:700;color:#64748B;letter-spacing:2px">'
    || 'MATCH REPORTS'
    || '</td>'
    || '</tr>'
    || '</table>'
    || '<div style="font-size:14px;color:#F8FAFC;margin-bottom:12px">Hi ' || COALESCE(v_coach.firstname, 'Coach') || ',</div>'
    || '<div style="font-size:13px;color:#94A3B8;margin-bottom:18px;line-height:1.5">New match analysis is available for the following matches:</div>';

  FOR v_report IN
    SELECT mr.id, mr.match_id,
           m.match_date, m.home_score, m.away_score,
           COALESCE(hi.short_name, hi.name, ht.name) AS home_name,
           COALESCE(ai.short_name, ai.name, at.name) AS away_name
    FROM match_reports mr
    JOIN matches m       ON m.id = mr.match_id
    JOIN teams ht        ON ht.id = m.home_team_id
    JOIN teams at        ON at.id = m.away_team_id
    LEFT JOIN institutions hi ON hi.id = ht.institution_id
    LEFT JOIN institutions ai ON ai.id = at.institution_id
    WHERE mr.id = ANY(p_report_ids)
    ORDER BY m.match_date DESC
  LOOP
    v_html := v_html
      || '<div style="background:#1E293B;border-radius:10px;padding:14px;border:1px solid #334155;margin-bottom:10px">'
      || '<div style="font-size:10px;color:#64748B;margin-bottom:6px">' || COALESCE(v_report.match_date::TEXT, '') || '</div>'
      || '<div style="font-size:15px;font-weight:800;color:#F8FAFC;margin-bottom:10px">'
      || v_report.home_name || ' ' || v_report.home_score || ' – ' || v_report.away_score || ' ' || v_report.away_name
      || '</div>'
      || '<a href="https://kykie.net/#/report/' || v_report.id || '" style="display:inline-block;padding:8px 16px;background:#10B981;color:#fff;border-radius:6px;text-decoration:none;font-weight:700;font-size:11px">View Report →</a>'
      || '</div>';
    v_count := v_count + 1;
  END LOOP;

  IF v_count = 0 THEN
    RETURN jsonb_build_object('error', 'No matching reports found');
  END IF;

  v_html := v_html
    || '<div style="text-align:center;margin-top:18px;font-size:10px;color:#334155">You received this because you are a registered coach on kykie.net</div>'
    || '</div>';

  v_subject := CASE WHEN v_test_mode THEN '[TEST] ' ELSE '' END
    || v_count || ' new match report' || CASE WHEN v_count > 1 THEN 's' ELSE '' END
    || CASE WHEN v_test_mode THEN ' (intended for ' || v_coach.email || ')' ELSE ' from kykie' END;

  PERFORM send_email(v_send_to, v_subject, v_html);

  IF v_test_mode THEN
    -- Don't log test sends; keeps audit + already-notified state clean.
    RETURN jsonb_build_object('sent', v_count, 'recipient', v_send_to, 'test', true, 'intended_for', v_coach.email);
  END IF;

  INSERT INTO communication_log (comm_type, recipient_id, recipient_email, subject, related_ids, sent_by, status)
  VALUES (
    'report_digest',
    v_coach.id,
    v_coach.email,
    v_subject,
    jsonb_build_object('report_ids', to_jsonb(p_report_ids)),
    auth.uid(),
    'sent'
  )
  RETURNING id INTO v_log_id;

  RETURN jsonb_build_object('sent', v_count, 'log_id', v_log_id, 'recipient', v_coach.email);
END;
$fn$;
