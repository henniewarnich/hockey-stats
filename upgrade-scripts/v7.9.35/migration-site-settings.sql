-- v7.9.35: Site settings for maintenance mode
-- Run in Supabase SQL Editor

CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default
INSERT INTO site_settings (key, value) VALUES ('maintenance_mode', 'false');

-- RLS: anyone can read, only admin can update
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site settings" ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin update site settings" ON site_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin'))
  );
