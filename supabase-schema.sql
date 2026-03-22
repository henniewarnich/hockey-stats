-- ╔══════════════════════════════════════════════════════╗
-- ║  Hockey Stats PWA — Supabase Schema v1.0            ║
-- ║  Run this in Supabase SQL Editor (all at once)       ║
-- ╚══════════════════════════════════════════════════════╝

-- ─── TEAMS ───────────────────────────────────────────
-- Stores all teams (both user-created and ranked SA schools)
CREATE TABLE teams (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#1D4ED8',
  short_name  TEXT,              -- e.g. "PG" for Paarl Girls
  school      BOOLEAN DEFAULT false,  -- true if from SA Schools rankings
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── RANKINGS ────────────────────────────────────────
-- Versioned ranking snapshots (date-stamped sets)
-- Each scrape from saschoolsports.co.za creates a new set
CREATE TABLE ranking_sets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scraped_at  DATE NOT NULL,           -- date of the ranking
  source_url  TEXT,                     -- where it was scraped from
  notes       TEXT,                     -- e.g. "Girls 1st XI, Week 12"
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Individual team rankings within a set
CREATE TABLE rankings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ranking_set_id  UUID NOT NULL REFERENCES ranking_sets(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  position        INTEGER,              -- null = unranked (e.g. Outeniqua)
  points          NUMERIC(6,2),         -- ranking points if available
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ranking_set_id, team_id)
);

-- ─── MATCHES ─────────────────────────────────────────
CREATE TABLE matches (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id    UUID NOT NULL REFERENCES teams(id),
  away_team_id    UUID NOT NULL REFERENCES teams(id),
  home_score      INTEGER DEFAULT 0,
  away_score      INTEGER DEFAULT 0,
  match_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  match_length    INTEGER DEFAULT 60,       -- minutes
  break_format    TEXT DEFAULT 'quarters',   -- quarters | halves | none
  venue           TEXT,
  match_type      TEXT DEFAULT 'league',     -- league | festival | friendly
  duration        INTEGER,                   -- actual seconds played
  status          TEXT DEFAULT 'setup',      -- setup | live | paused | ended
  share_pin       TEXT,                      -- 4-6 digit PIN for shared viewing
  -- Snapshot of team rankings at match time (for historic accuracy)
  home_rank       INTEGER,
  away_rank       INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── MATCH EVENTS ────────────────────────────────────
-- Every tap, goal, card, pause — the full event stream
-- This is the core data that drives everything
CREATE TABLE match_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team        TEXT NOT NULL,              -- 'home' | 'away' | 'commentary' | 'meta'
  event       TEXT NOT NULL,              -- 'Goal!', 'D Entry', 'Ball forward', etc.
  zone        TEXT,                       -- 'Opp Quarter Left', 'Centre', etc.
  detail      TEXT,                       -- human-readable description
  match_time  INTEGER NOT NULL DEFAULT 0, -- seconds into match
  seq         INTEGER NOT NULL DEFAULT 0, -- sequence number (for ordering)
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index for fast queries on match events
CREATE INDEX idx_match_events_match ON match_events(match_id, seq DESC);
CREATE INDEX idx_match_events_event ON match_events(match_id, event);

-- ─── INDEXES ─────────────────────────────────────────
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date DESC);
CREATE INDEX idx_rankings_set ON rankings(ranking_set_id);
CREATE INDEX idx_rankings_team ON rankings(team_id);

-- ─── ENABLE REALTIME ─────────────────────────────────
-- This lets spectators see live score updates via WebSocket
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;

-- ─── ROW LEVEL SECURITY ──────────────────────────────
-- For now: public read, authenticated write
-- We'll tighten this with roles later

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

-- Public can read everything
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read ranking_sets" ON ranking_sets FOR SELECT USING (true);
CREATE POLICY "Public read rankings" ON rankings FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read match_events" ON match_events FOR SELECT USING (true);

-- Anyone can insert/update/delete for now (anon key)
-- We'll lock this down with proper auth later
CREATE POLICY "Anon write teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write ranking_sets" ON ranking_sets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write rankings" ON rankings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write matches" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write match_events" ON match_events FOR ALL USING (true) WITH CHECK (true);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── DONE ────────────────────────────────────────────
-- Tables: teams, ranking_sets, rankings, matches, match_events, app_settings
-- Realtime: enabled on matches + match_events
-- RLS: public read, open write (to be tightened later)

-- ─── APP SETTINGS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
