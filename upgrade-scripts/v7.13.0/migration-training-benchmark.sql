-- v7.13.0 — Commentator training & benchmark test support

-- 1. Add benchmark columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS benchmark_score NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS benchmark_passed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_progress JSONB DEFAULT '{}';

-- 2. Set existing commentators (created by admin) as qualified
UPDATE profiles
SET commentator_status = 'qualified'
WHERE role = 'commentator'
  AND commentator_status IS NULL;

-- 3. Ensure trainees who registered via the new flow stay as trainee
-- (commentator_status = 'trainee' was already set by register_crowd_profile)

-- Verification:
-- SELECT commentator_status, count(*) FROM profiles WHERE role = 'commentator' OR 'commentator' = ANY(roles) GROUP BY commentator_status;
