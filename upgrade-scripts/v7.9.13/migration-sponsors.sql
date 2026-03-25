-- v7.9.12: Sponsors
-- Three tiers: match, team, platform

CREATE TABLE IF NOT EXISTS sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,                    -- Supabase Storage URL
  tier TEXT NOT NULL,               -- 'match' | 'team' | 'platform'
  target_id UUID,                   -- match_id (tier=match) or team_id (tier=team), null for platform
  website_url TEXT,                 -- optional click-through link
  active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_tier ON sponsors(tier);
CREATE INDEX IF NOT EXISTS idx_sponsors_target ON sponsors(target_id);

-- RLS
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read sponsors" ON sponsors;
CREATE POLICY "Public read sponsors" ON sponsors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated manage sponsors" ON sponsors;
CREATE POLICY "Authenticated manage sponsors" ON sponsors
  FOR ALL USING (auth.role() = 'authenticated');

-- Storage bucket for sponsor logos (run in Supabase Dashboard > Storage)
-- 1. Create bucket: "sponsor-logos" (public)
-- 2. Add policy: allow authenticated uploads, public reads
-- OR run these SQL commands:
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-logos', 'sponsor-logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read sponsor logos" ON storage.objects;
CREATE POLICY "Public read sponsor logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'sponsor-logos');

DROP POLICY IF EXISTS "Authenticated upload sponsor logos" ON storage.objects;
CREATE POLICY "Authenticated upload sponsor logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'sponsor-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated delete sponsor logos" ON storage.objects;
CREATE POLICY "Authenticated delete sponsor logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'sponsor-logos' AND auth.role() = 'authenticated');

-- ═══ Impression & Click Tracking ═══

-- High volume: one row per banner render
CREATE TABLE IF NOT EXISTS sponsor_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE NOT NULL,
  viewer_id TEXT,                -- anonymous sessionStorage ID
  user_id UUID,                 -- logged-in user (nullable)
  placement TEXT NOT NULL,      -- 'landing' | 'team_page' | 'scoreboard'
  context_id UUID,              -- team_id or match_id depending on placement
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsor_impressions_sponsor ON sponsor_impressions(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_impressions_date ON sponsor_impressions(created_at);

ALTER TABLE sponsor_impressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert sponsor impressions" ON sponsor_impressions;
CREATE POLICY "Public insert sponsor impressions" ON sponsor_impressions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read sponsor impressions" ON sponsor_impressions;
CREATE POLICY "Authenticated read sponsor impressions" ON sponsor_impressions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Lower volume: one row per click
CREATE TABLE IF NOT EXISTS sponsor_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE NOT NULL,
  viewer_id TEXT,
  user_id UUID,
  placement TEXT NOT NULL,
  context_id UUID,
  destination_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsor_clicks_sponsor ON sponsor_clicks(sponsor_id);

ALTER TABLE sponsor_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert sponsor clicks" ON sponsor_clicks;
CREATE POLICY "Public insert sponsor clicks" ON sponsor_clicks
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read sponsor clicks" ON sponsor_clicks;
CREATE POLICY "Authenticated read sponsor clicks" ON sponsor_clicks
  FOR SELECT USING (auth.role() = 'authenticated');
