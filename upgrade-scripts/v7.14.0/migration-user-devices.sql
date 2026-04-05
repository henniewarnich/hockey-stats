-- v7.14.0 Migration: User Devices + Security
-- Run in Supabase SQL Editor

-- Device tracking table
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices(user_id);

-- RLS
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Users can read their own devices
CREATE POLICY "Users read own devices" ON user_devices
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own devices
CREATE POLICY "Users insert own devices" ON user_devices
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own devices
CREATE POLICY "Users update own devices" ON user_devices
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own devices
CREATE POLICY "Users delete own devices" ON user_devices
  FOR DELETE USING (user_id = auth.uid());

-- Admin can see all devices (for user management)
CREATE POLICY "Admin read all devices" ON user_devices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'commentator_admin'))
  );
