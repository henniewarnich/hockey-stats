-- ╔══════════════════════════════════════════════════════╗
-- ║  Kykie.net — Match Viewers Tracking Migration       ║
-- ║  Run this in Supabase SQL Editor                    ║
-- ╚══════════════════════════════════════════════════════╝

-- ─── MATCH VIEWERS ──────────────────────────────────
-- Tracks unique viewers per match (persists after match ends)
CREATE TABLE match_viewers (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  viewer_id   TEXT NOT NULL,  -- anonymous session ID
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, viewer_id)
);

-- ─── INDEXES ─────────────────────────────────────────
CREATE INDEX idx_match_viewers_match ON match_viewers(match_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────
ALTER TABLE match_viewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read match_viewers" ON match_viewers
  FOR SELECT USING (true);

CREATE POLICY "Public insert match_viewers" ON match_viewers
  FOR INSERT WITH CHECK (true);
