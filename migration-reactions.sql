-- ╔══════════════════════════════════════════════════════╗
-- ║  Kykie.net — Event Reactions Migration              ║
-- ║  Run this in Supabase SQL Editor                    ║
-- ╚══════════════════════════════════════════════════════╝

-- ─── EVENT REACTIONS ────────────────────────────────
-- Public viewers can react to live match events
-- No login required — uses anonymous viewer_id
CREATE TABLE event_reactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_event_id UUID NOT NULL REFERENCES match_events(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,  -- fire | clap | wow | heart
  viewer_id   TEXT NOT NULL,  -- anonymous session ID
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_event_id, emoji, viewer_id)
);

-- ─── INDEXES ─────────────────────────────────────────
CREATE INDEX idx_event_reactions_event ON event_reactions(match_event_id);
CREATE INDEX idx_event_reactions_viewer ON event_reactions(viewer_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────
ALTER TABLE event_reactions ENABLE ROW LEVEL SECURITY;

-- Everyone can read reactions
CREATE POLICY "Public read event_reactions" ON event_reactions
  FOR SELECT USING (true);

-- Anyone can insert reactions (anonymous)
CREATE POLICY "Public insert event_reactions" ON event_reactions
  FOR INSERT WITH CHECK (true);

-- Viewers can delete their own reactions (toggle off)
CREATE POLICY "Public delete own event_reactions" ON event_reactions
  FOR DELETE USING (true);

-- ─── ENABLE REALTIME ─────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE event_reactions;
