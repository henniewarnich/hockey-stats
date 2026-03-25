-- v7.9.11: Match Stats Archival
-- Pre-computes match stats so raw events can be pruned after retention period

CREATE TABLE IF NOT EXISTS match_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  team TEXT NOT NULL,            -- 'home' | 'away'
  quarter INT NOT NULL DEFAULT 0, -- 0 = totals, 1-4 for quarters
  goals INT DEFAULT 0,
  shots_on INT DEFAULT 0,
  shots_off INT DEFAULT 0,
  d_entries INT DEFAULT 0,
  short_corners INT DEFAULT 0,
  long_corners INT DEFAULT 0,
  turnovers_won INT DEFAULT 0,
  poss_lost INT DEFAULT 0,
  territory_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_match_stats_match_id ON match_stats(match_id);

-- Unique constraint: one row per match/team/quarter combo
-- quarter = 0 means totals, 1-4 for quarters
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_stats_unique 
  ON match_stats(match_id, team, quarter);

-- RLS: allow authenticated users to read, service role to write
ALTER TABLE match_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read match_stats" ON match_stats;
CREATE POLICY "Public read match_stats" ON match_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated insert match_stats" ON match_stats;
CREATE POLICY "Authenticated insert match_stats" ON match_stats FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Mark matches as archived (optional flag)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stats_archived BOOLEAN DEFAULT false;
