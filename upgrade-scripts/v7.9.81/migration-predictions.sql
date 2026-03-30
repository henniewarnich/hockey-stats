-- v7.9.81: Predictions table
-- Safe to run any time — all IF NOT EXISTS

CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),  -- null = Kykie AI
  match_id UUID REFERENCES matches(id) NOT NULL,
  prediction TEXT NOT NULL,               -- 'home' | 'draw' | 'away'
  home_win_pct INT,                       -- Kykie's probabilities at time of prediction
  draw_pct INT,
  away_win_pct INT,
  points INT,                             -- null until scored, 0 or 1
  correct BOOLEAN,                        -- null until scored
  created_at TIMESTAMPTZ DEFAULT now(),
  scored_at TIMESTAMPTZ,
  UNIQUE(user_id, match_id)
);

-- Handle Kykie (null user_id) uniqueness separately
CREATE UNIQUE INDEX IF NOT EXISTS predictions_kykie_unique 
  ON predictions (match_id) WHERE user_id IS NULL;

-- RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read predictions" ON predictions;
CREATE POLICY "Public read predictions" ON predictions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth insert predictions" ON predictions;
CREATE POLICY "Auth insert predictions" ON predictions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth update predictions" ON predictions;
CREATE POLICY "Auth update predictions" ON predictions FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth delete predictions" ON predictions;
CREATE POLICY "Auth delete predictions" ON predictions FOR DELETE USING (auth.role() = 'authenticated');
