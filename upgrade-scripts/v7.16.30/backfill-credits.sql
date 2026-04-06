-- ============================================
-- kykie.net v7.16.30 — Backfill credits from audit_log
-- FIXED: skips deleted matches (FK constraint)
-- ============================================

-- Step 1: Clear existing data
DELETE FROM credit_ledger;
DELETE FROM contributor_stats;

-- Step 2: Video review completions
INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, tier_before, tier_after, created_at)
SELECT
  a.user_id, a.target_id,
  CASE WHEN a.created_at::date = m.match_date::date THEN 'video_same_day' ELSE 'video_older' END,
  CASE WHEN a.created_at::date = m.match_date::date THEN 30 ELSE 20 END,
  0, 'qualified', 'qualified', a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action = 'video_review_end'
  AND a.user_id IS NOT NULL;

-- Step 3: Live match completions (exclude if same user did video_review_end)
INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, tier_before, tier_after, created_at)
SELECT
  a.user_id, a.target_id, 'live_pro', 50,
  0, 'qualified', 'qualified', a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action = 'match_end'
  AND a.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM audit_log vr
    WHERE vr.action = 'video_review_end'
      AND vr.target_id = a.target_id
      AND vr.user_id = a.user_id
  );

-- Step 4: Live Lite completions
INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, tier_before, tier_after, created_at)
SELECT
  a.user_id, a.target_id, 'live_lite', 10,
  0, 'qualified', 'qualified', a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action = 'match_end_live_lite'
  AND a.user_id IS NOT NULL;

-- Step 5: Quick scores
INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, tier_before, tier_after, created_at)
SELECT
  a.user_id, a.target_id, 'quick_score', 5,
  0, 'qualified', 'qualified', a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action IN ('quick_score_save', 'quick_score_admin')
  AND a.user_id IS NOT NULL;

-- Step 6: Match scheduling
INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, tier_before, tier_after, created_at)
SELECT
  a.user_id, a.target_id, 'schedule', 5,
  0, 'qualified', 'qualified', a.created_at
FROM audit_log a
JOIN matches m ON m.id = a.target_id
WHERE a.action = 'match_schedule'
  AND a.user_id IS NOT NULL
  AND a.target_id IS NOT NULL;

-- Step 7: Fix running balance
WITH running AS (
  SELECT id, user_id, credits,
    SUM(credits) OVER (PARTITION BY user_id ORDER BY created_at, id) AS running_balance
  FROM credit_ledger
)
UPDATE credit_ledger cl
SET balance_after = r.running_balance
FROM running r
WHERE cl.id = r.id;

-- Step 8: Build contributor_stats
INSERT INTO contributor_stats (user_id, credits, tier, vouchers_earned, vouchers_sent, last_submission_at,
  total_quicks, total_quicks_approved, total_live, total_live_approved)
SELECT
  user_id,
  SUM(credits) AS credits,
  'qualified', 0, 0,
  MAX(created_at),
  COUNT(*) FILTER (WHERE action = 'quick_score'),
  COUNT(*) FILTER (WHERE action = 'quick_score'),
  COUNT(*) FILTER (WHERE action IN ('live_pro', 'live_lite', 'video_same_day', 'video_older')),
  COUNT(*) FILTER (WHERE action IN ('live_pro', 'live_lite', 'video_same_day', 'video_older'))
FROM credit_ledger
GROUP BY user_id;

-- Verify
SELECT p.firstname, p.role, cs.credits, cs.total_live, cs.total_quicks,
  (SELECT COUNT(*) FROM credit_ledger cl WHERE cl.user_id = cs.user_id) AS ledger_rows
FROM contributor_stats cs
JOIN profiles p ON p.id = cs.user_id
ORDER BY cs.credits DESC;
