-- Email Notification System for Kykie
-- Uses pg_net extension to call Resend API from database triggers
-- Run this AFTER enabling the pg_net extension in Supabase Dashboard → Database → Extensions

-- Step 1: Enable pg_net extension (do this in Supabase Dashboard first!)
-- Dashboard → Database → Extensions → Search "pg_net" → Enable

-- Step 2: Store Resend API key securely
-- Replace 'YOUR_RESEND_API_KEY' with your actual key
INSERT INTO vault.secrets (name, secret)
VALUES ('resend_api_key', 'YOUR_RESEND_API_KEY')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;

-- Step 3: Create email sending function
CREATE OR REPLACE FUNCTION send_email(
  p_to TEXT,
  p_subject TEXT,
  p_html TEXT,
  p_from TEXT DEFAULT 'Kykie <no-reply@kykie.net>'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_api_key TEXT;
  v_request_id BIGINT;
BEGIN
  -- Get API key from vault
  SELECT decrypted_secret INTO v_api_key
  FROM vault.decrypted_secrets
  WHERE name = 'resend_api_key';

  IF v_api_key IS NULL THEN
    RAISE WARNING 'Resend API key not found in vault';
    RETURN;
  END IF;

  -- Send via Resend API
  SELECT net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', p_from,
      'to', p_to,
      'subject', p_subject,
      'html', p_html
    )
  ) INTO v_request_id;
END;
$fn$;

-- Step 4: Registration notification trigger
CREATE OR REPLACE FUNCTION notify_admin_on_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_admin_email TEXT := 'hennie.warnich@gmail.com';
  v_role TEXT;
  v_name TEXT;
  v_email TEXT;
  v_town TEXT;
  v_html TEXT;
BEGIN
  v_role := COALESCE(NEW.role, 'unknown');
  v_name := COALESCE(NEW.firstname, '') || ' ' || COALESCE(NEW.lastname, '');
  v_email := COALESCE(NEW.email, 'no email');
  v_town := COALESCE(NEW.home_town, 'not specified');

  v_html := '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0B0F1A;color:#E2E8F0;padding:24px;border-radius:12px">'
    || '<div style="text-align:center;margin-bottom:16px">'
    || '<span style="font-size:20px;font-weight:900;color:#F59E0B">kykie</span>'
    || '<span style="font-size:10px;color:#64748B;margin-left:8px">New Registration</span>'
    || '</div>'
    || '<div style="background:#1E293B;border-radius:10px;padding:16px;border:1px solid #334155">'
    || '<div style="font-size:16px;font-weight:700;color:#10B981;margin-bottom:12px">New ' || v_role || ' registered!</div>'
    || '<table style="font-size:13px;color:#94A3B8;width:100%">'
    || '<tr><td style="padding:4px 8px 4px 0;color:#64748B;font-weight:600">Name</td><td style="padding:4px 0">' || v_name || '</td></tr>'
    || '<tr><td style="padding:4px 8px 4px 0;color:#64748B;font-weight:600">Email</td><td style="padding:4px 0">' || v_email || '</td></tr>'
    || '<tr><td style="padding:4px 8px 4px 0;color:#64748B;font-weight:600">Role</td><td style="padding:4px 0;color:#F59E0B;font-weight:700">' || v_role || '</td></tr>'
    || '<tr><td style="padding:4px 8px 4px 0;color:#64748B;font-weight:600">Hometown</td><td style="padding:4px 0">' || v_town || '</td></tr>'
    || '</table>'
    || '</div>'
    || '<div style="text-align:center;margin-top:16px;font-size:11px;color:#64748B">'
    || '<a href="https://kykie.net/#/admin" style="color:#10B981;text-decoration:none;font-weight:700">Open Admin Dashboard →</a>'
    || '</div>'
    || '</div>';

  PERFORM send_email(v_admin_email, 'New ' || v_role || ' registration: ' || v_name, v_html);
  RETURN NEW;
END;
$fn$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_notify ON profiles;
CREATE TRIGGER on_profile_created_notify
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_registration();

-- Step 5: Match report notification function (called from client via RPC)
CREATE OR REPLACE FUNCTION notify_coaches_of_report(p_report_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_report RECORD;
  v_match RECORD;
  v_coach RECORD;
  v_count INT := 0;
  v_html TEXT;
  v_home_name TEXT;
  v_away_name TEXT;
BEGIN
  -- Get report and match details
  SELECT mr.*, m.home_team_id, m.away_team_id, m.home_score, m.away_score, m.match_date
  INTO v_report
  FROM match_reports mr
  JOIN matches m ON m.id = mr.match_id
  WHERE mr.id = p_report_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Report not found');
  END IF;

  -- Get team names via institutions
  SELECT COALESCE(i.short_name, i.name, t.name) INTO v_home_name
  FROM teams t LEFT JOIN institutions i ON i.id = t.institution_id
  WHERE t.id = v_report.home_team_id;

  SELECT COALESCE(i.short_name, i.name, t.name) INTO v_away_name
  FROM teams t LEFT JOIN institutions i ON i.id = t.institution_id
  WHERE t.id = v_report.away_team_id;

  -- Find coaches for both teams
  FOR v_coach IN
    SELECT DISTINCT p.email, p.firstname
    FROM coach_teams ct
    JOIN profiles p ON p.id = ct.coach_id
    WHERE ct.team_id IN (v_report.home_team_id, v_report.away_team_id)
      AND p.email IS NOT NULL
  LOOP
    v_html := '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0B0F1A;color:#E2E8F0;padding:24px;border-radius:12px">'
      || '<div style="text-align:center;margin-bottom:16px">'
      || '<span style="font-size:20px;font-weight:900;color:#F59E0B">kykie</span>'
      || '<span style="font-size:10px;color:#64748B;margin-left:8px">Match Report</span>'
      || '</div>'
      || '<div style="background:#1E293B;border-radius:10px;padding:16px;border:1px solid #334155;text-align:center">'
      || '<div style="font-size:11px;color:#64748B;margin-bottom:8px">' || COALESCE(v_report.match_date::TEXT, '') || '</div>'
      || '<div style="font-size:18px;font-weight:900;color:#F8FAFC">' || v_home_name || ' ' || v_report.home_score || ' – ' || v_report.away_score || ' ' || v_away_name || '</div>'
      || '<div style="font-size:12px;color:#10B981;font-weight:700;margin-top:12px">Match Analysis Available</div>'
      || '<div style="font-size:11px;color:#94A3B8;margin-top:4px">Detailed stats, insights, and tactical analysis for this match are now available on kykie.net</div>'
      || '</div>'
      || '<div style="text-align:center;margin-top:16px">'
      || '<a href="https://kykie.net/#/report/' || v_report.id || '" style="display:inline-block;padding:10px 24px;background:#10B981;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px">View Report →</a>'
      || '</div>'
      || '<div style="text-align:center;margin-top:12px;font-size:10px;color:#334155">You received this because you are a registered coach on kykie.net</div>'
      || '</div>';

    PERFORM send_email(
      v_coach.email,
      'Match Report: ' || v_home_name || ' vs ' || v_away_name,
      v_html
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('sent', v_count, 'home', v_home_name, 'away', v_away_name);
END;
$fn$;
