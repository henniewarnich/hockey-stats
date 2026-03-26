-- v7.9.34: Contributor reward system — stats + credit ledger
-- Run in Supabase SQL Editor

CREATE TABLE contributor_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
  credits NUMERIC DEFAULT 0,
  tier TEXT DEFAULT 'apprentice',   -- 'apprentice' | 'graduate' | 'veteran'
  total_quicks INT DEFAULT 0,
  total_quicks_approved INT DEFAULT 0,
  total_quicks_rejected INT DEFAULT 0,
  total_live INT DEFAULT 0,
  total_live_approved INT DEFAULT 0,
  total_live_rejected INT DEFAULT 0,
  total_approvals INT DEFAULT 0,           -- veteran approvals of others
  total_approvals_overridden INT DEFAULT 0,
  vouchers_earned INT DEFAULT 0,
  vouchers_sent INT DEFAULT 0,
  last_submission_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Track individual credit transactions for audit trail
CREATE TABLE credit_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  match_id UUID REFERENCES matches(id),
  action TEXT NOT NULL,       -- 'quick_approved', 'quick_rejected', 'live_approved', 'live_rejected', 'voucher_claim', 'tier_promotion', 'tier_demotion'
  credits NUMERIC NOT NULL,   -- positive or negative
  balance_after NUMERIC NOT NULL,
  tier_before TEXT,
  tier_after TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE contributor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

-- Users can read their own stats
CREATE POLICY "Users read own contributor stats" ON contributor_stats FOR SELECT
  USING (user_id = auth.uid());

-- Admin can read all
CREATE POLICY "Admin read all contributor stats" ON contributor_stats FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin'))
  );

-- App can insert/update (authenticated)
CREATE POLICY "Authenticated upsert contributor stats" ON contributor_stats FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update contributor stats" ON contributor_stats FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Users can read their own ledger
CREATE POLICY "Users read own credit ledger" ON credit_ledger FOR SELECT
  USING (user_id = auth.uid());

-- Admin can read all ledger entries
CREATE POLICY "Admin read all credit ledger" ON credit_ledger FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin'))
  );

-- Authenticated can insert ledger entries
CREATE POLICY "Authenticated insert credit ledger" ON credit_ledger FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_contributor_stats_user ON contributor_stats(user_id);
CREATE INDEX idx_contributor_stats_tier ON contributor_stats(tier);
CREATE INDEX idx_credit_ledger_user ON credit_ledger(user_id);
CREATE INDEX idx_credit_ledger_match ON credit_ledger(match_id);
