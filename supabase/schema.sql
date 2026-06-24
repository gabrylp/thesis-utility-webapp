-- Supabase SQL Migration for Thesis Utility App
-- Run this in your Supabase SQL Editor to set up the database schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Test Runs
CREATE TABLE IF NOT EXISTS test_runs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE,
  location TEXT DEFAULT '',
  wave_condition TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  k_factor REAL DEFAULT 450,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  run_type TEXT DEFAULT 'flow_rate' CHECK (run_type IN ('flow_rate', 'communication')),
  sort_order REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own runs"
  ON test_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own runs"
  ON test_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own runs"
  ON test_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- Flow Readings
CREATE TABLE IF NOT EXISTS flow_readings (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  method TEXT DEFAULT 'without_sensor' CHECK (method IN ('with_sensor', 'without_sensor')),
  time_sec REAL DEFAULT 0,
  volume_ml REAL DEFAULT 0,
  pulses REAL DEFAULT 0,
  flow_rate_lh REAL DEFAULT 0,
  notes TEXT DEFAULT '',
  synced_at TIMESTAMPTZ
);

ALTER TABLE flow_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flow readings from their runs"
  ON flow_readings FOR SELECT
  USING (EXISTS (SELECT 1 FROM test_runs WHERE test_runs.id = flow_readings.run_id AND test_runs.user_id = auth.uid()));

CREATE POLICY "Users can insert flow readings"
  ON flow_readings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM test_runs WHERE test_runs.id = flow_readings.run_id AND test_runs.user_id = auth.uid()));

CREATE POLICY "Users can update flow readings"
  ON flow_readings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM test_runs WHERE test_runs.id = flow_readings.run_id AND test_runs.user_id = auth.uid()));

-- Power Readings
CREATE TABLE IF NOT EXISTS power_readings (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  voltage REAL DEFAULT 0,
  amperage REAL DEFAULT 0,
  synced_at TIMESTAMPTZ
);

ALTER TABLE power_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view power readings from their runs"
  ON power_readings FOR SELECT
  USING (EXISTS (SELECT 1 FROM test_runs WHERE test_runs.id = power_readings.run_id AND test_runs.user_id = auth.uid()));

CREATE POLICY "Users can insert power readings"
  ON power_readings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM test_runs WHERE test_runs.id = power_readings.run_id AND test_runs.user_id = auth.uid()));

CREATE POLICY "Users can update power readings"
  ON power_readings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM test_runs WHERE test_runs.id = power_readings.run_id AND test_runs.user_id = auth.uid()));

-- Communication Readings
CREATE TABLE IF NOT EXISTS comm_readings (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  rtt_ms REAL DEFAULT 0,
  one_way_latency_ms REAL DEFAULT 0,
  rssi REAL DEFAULT 0,
  snr REAL DEFAULT 0,
  distance_m REAL DEFAULT 0,
  spread_factor INTEGER DEFAULT 7,
  coding_rate TEXT DEFAULT '4/5',
  bandwidth_khz REAL DEFAULT 125,
  frequency_mhz REAL DEFAULT 915,
  tx_power_dbm REAL DEFAULT 17,
  packet_loss_pct REAL DEFAULT 0,
  payload_size_bytes INTEGER DEFAULT 32,
  notes TEXT DEFAULT '',
  synced_at TIMESTAMPTZ
);

ALTER TABLE comm_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comm readings from their runs"
  ON comm_readings FOR SELECT
  USING (EXISTS (SELECT 1 FROM test_runs WHERE test_runs.id = comm_readings.run_id AND test_runs.user_id = auth.uid()));

CREATE POLICY "Users can insert comm readings"
  ON comm_readings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM test_runs WHERE test_runs.id = comm_readings.run_id AND test_runs.user_id = auth.uid()));

CREATE POLICY "Users can update comm readings"
  ON comm_readings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM test_runs WHERE test_runs.id = comm_readings.run_id AND test_runs.user_id = auth.uid()));

-- Code Snippets
CREATE TABLE IF NOT EXISTS code_snippets (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  filename TEXT DEFAULT '',
  content TEXT DEFAULT '',
  subsystem TEXT DEFAULT 'general',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snippets"
  ON code_snippets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snippets"
  ON code_snippets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snippets"
  ON code_snippets FOR UPDATE
  USING (auth.uid() = user_id);

-- Code Snippet Versions
CREATE TABLE IF NOT EXISTS code_snippet_versions (
  id UUID PRIMARY KEY,
  snippet_id UUID REFERENCES code_snippets(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

ALTER TABLE code_snippet_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their snippets"
  ON code_snippet_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM code_snippets WHERE code_snippets.id = code_snippet_versions.snippet_id AND code_snippets.user_id = auth.uid()));

CREATE POLICY "Users can insert versions"
  ON code_snippet_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM code_snippets WHERE code_snippets.id = code_snippet_versions.snippet_id AND code_snippets.user_id = auth.uid()));
