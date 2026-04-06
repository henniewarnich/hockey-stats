-- ============================================
-- kykie.net v7.16.27 — Vouchers table
-- ============================================

CREATE TABLE IF NOT EXISTS vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'available',  -- available | issued | viewed
  issued_to UUID REFERENCES profiles(id),
  issued_at TIMESTAMPTZ,
  issued_by UUID REFERENCES profiles(id),
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick pool lookups
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_issued_to ON vouchers(issued_to);

-- RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access vouchers" ON vouchers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin'))
  );

-- Users can see their own vouchers
CREATE POLICY "Users see own vouchers" ON vouchers
  FOR SELECT USING (issued_to = auth.uid());

-- RPC to issue a voucher (picks next available, assigns, deducts credits)
CREATE OR REPLACE FUNCTION issue_voucher(p_user_id UUID, p_admin_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_voucher RECORD;
  v_stats RECORD;
  v_new_balance NUMERIC;
BEGIN
  -- Check user has enough credits
  SELECT * INTO v_stats FROM contributor_stats WHERE user_id = p_user_id;
  IF NOT FOUND OR v_stats.credits < 100 THEN
    RETURN json_build_object('error', 'User does not have enough credits');
  END IF;

  -- Pick next available voucher
  SELECT * INTO v_voucher FROM vouchers WHERE status = 'available' ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'No vouchers available in pool');
  END IF;

  -- Assign voucher
  UPDATE vouchers SET status = 'issued', issued_to = p_user_id, issued_at = now(), issued_by = p_admin_id WHERE id = v_voucher.id;

  -- Deduct 100 credits
  v_new_balance := v_stats.credits - 100;
  UPDATE contributor_stats SET credits = v_new_balance WHERE user_id = p_user_id;

  -- Log to credit_ledger
  INSERT INTO credit_ledger (user_id, match_id, action, credits, balance_after, created_at)
  VALUES (p_user_id, NULL, 'voucher_issued', -100, v_new_balance, now());

  -- Update voucher counts
  UPDATE contributor_stats SET vouchers_earned = COALESCE(vouchers_earned, 0) + 1, vouchers_sent = COALESCE(vouchers_sent, 0) + 1 WHERE user_id = p_user_id;

  RETURN json_build_object('success', true, 'voucher_id', v_voucher.id, 'code', v_voucher.code, 'new_balance', v_new_balance);
END;
$fn$;

-- README
COMMENT ON TABLE vouchers IS 'Takealot voucher pool — admin loads codes, system assigns to commentators at 100 credit threshold';
