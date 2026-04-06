-- ============================================
-- kykie.net v7.16.30 — Backfill credits from audit_log
-- Run in Supabase SQL editor
-- ============================================
-- Credit values: Live Pro=50, Video same-day=30, Video older=20,
--   Live Lite=10, Quick score=5, Schedule=5, Submission=1, Issue report=5
-- Voucher threshold: 100 credits

-- ── Step 1: Clear existing data (only 1 ledger entry + 4 stats rows) ──
DELETE FROM credit_ledger;
DELETE FROM contributor_stats;

-- ── Step 2: Insert credit_ledger entries from audit_log ──

-- Video review completions (check same-day vs older)
INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, tier_before, tier_after, created_at)
SELECT
  a.user_id,
  a.target_id,
  CASE WHEN a.created_at::date = m.match_date::date THEN 'video_same_day' ELSE 'video_older' END,
  CASE WHEN a.created_at::date = m.match_date::date THEN 30 ELSE 20 END,
  0, -- will fix balance_after in step 3
  'qualified',
  'qualified',
  a.created_at
FROM audit_log a
LEFT JOIN matches m ON m.id = a.target_id
WHERE a.action = 'video_review_end'
  AND a.user_id IS NOT NULL;

-- Live match completions (match_end for live, not video review)
-- Exclude match_end where the same user also has video_review_end for the same match
INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, tier_before, tier_after, created_at)
SELECT
  a.user_id,
  a.target_id,
  'live_pro',
  50,
  0,
  'qualified',
  'qualified',
  a.created_at
FROM audit_log a
WHERE a.action = 'match_end'
  AND a.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM audit_log vr
    WHERE vr.action = 'video_review_end'
      AND vr.target_id = a.target_id
      AND vr.user_id = a.user_id
  );

-- Live Lite completions
INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, tier_before, tier_after, created_at)
SELECT
  a.user_id,
  a.target_id,
  'live_lite',
  10,
  0,
  'qualified',
  'qualified',
  a.created_at
FROM audit_log a
WHERE a.action = 'match_end_live_lite'
  AND a.user_id IS NOT NULL;

-- Quick scores
INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, tier_before, tier_after, created_at)
SELECT
  a.user_id,
  a.target_id,
  'quick_score',
  5,
  0,
  'qualified',
  'qualified',
  a.created_at
FROM audit_log a
WHERE a.action IN ('quick_score_save', 'quick_score_admin')
  AND a.user_id IS NOT NULL;

-- Match scheduling
INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, tier_before, tier_after, created_at)
SELECT
  a.user_id,
  a.target_id,
  'schedule',
  5,
  0,
  'qualified',
  'qualified',
  a.created_at
FROM audit_log a
WHERE a.action = 'match_schedule'
  AND a.user_id IS NOT NULL;

-- ── Step 3: Fix balance_after using running total ──
WITH running AS (
  SELECT
    id,
    user_id,
    credits,
    SUM(credits) OVER (PARTITION BY user_id ORDER BY created_at, id) AS running_balance
  FROM credit_ledger
)
UPDATE credit_ledger cl
SET balance_after = r.running_balance
FROM running r
WHERE cl.id = r.id;

-- ── Step 4: Build contributor_stats from ledger ──
INSERT INTO contributor_stats (user_id, credits, tier, vouchers_earned, vouchers_sent, last_submission_at,
  total_quicks, total_quicks_approved, total_live, total_live_approved)
SELECT
  user_id,
  SUM(credits) AS credits,
  'qualified' AS tier,
  0 AS vouchers_earned,
  0 AS vouchers_sent,
  MAX(created_at) AS last_submission_at,
  COUNT(*) FILTER (WHERE action = 'quick_score') AS total_quicks,
  COUNT(*) FILTER (WHERE action = 'quick_score') AS total_quicks_approved,
  COUNT(*) FILTER (WHERE action IN ('live_pro', 'live_lite', 'video_same_day', 'video_older')) AS total_live,
  COUNT(*) FILTER (WHERE action IN ('live_pro', 'live_lite', 'video_same_day', 'video_older')) AS total_live_approved
FROM credit_ledger
GROUP BY user_id;

-- ── Step 5: Verify ──
SELECT
  p.firstname,
  p.role,
  cs.credits,
  cs.total_live,
  cs.total_quicks,
  cs.vouchers_earned,
  (SELECT COUNT(*) FROM credit_ledger cl WHERE cl.user_id = cs.user_id) AS ledger_rows
FROM contributor_stats cs
JOIN profiles p ON p.id = cs.user_id
ORDER BY cs.credits DESC;

-- Detailed ledger check
SELECT
  p.firstname,
  cl.action,
  cl.credits,
  cl.balance_after,
  cl.created_at::date,
  m.match_date
FROM credit_ledger cl
JOIN profiles p ON p.id = cl.user_id
LEFT JOIN matches m ON m.id = cl.match_id
ORDER BY cl.user_id, cl.created_at;
