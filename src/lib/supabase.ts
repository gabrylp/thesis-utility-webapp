import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let client: SupabaseClient | null = null;

export function isSupabaseReady(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!isSupabaseReady()) {
      throw new Error("Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
    }
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export type Tables = {
  test_runs: TestRun;
  flow_readings: FlowReading;
  power_readings: PowerReading;
  comm_readings: CommReading;
  code_snippets: CodeSnippet;
  code_snippet_versions: CodeSnippetVersion;
};

export interface TestRun {
  id: string;
  local_id: string;
  title: string;
  date: string;
  location: string;
  wave_condition: string;
  notes: string;
  k_factor: number;
  status: "draft" | "completed";
  run_type: "flow_rate" | "communication";
  sort_order: number;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
  user_id: string;
}

export interface FlowReading {
  id: string;
  run_id: string;
  timestamp: string;
  method: "with_sensor" | "without_sensor";
  time_sec: number;
  volume_ml: number;
  pulses: number;
  flow_rate_lh: number;
  notes: string;
}

export interface PowerReading {
  id: string;
  run_id: string;
  timestamp: string;
  voltage: number;
  amperage: number;
}

export interface CommReading {
  id: string;
  run_id: string;
  timestamp: string;
  rtt_ms: number;
  one_way_latency_ms: number;
  rssi: number;
  snr: number;
  distance_m: number;
  spread_factor: number;
  coding_rate: string;
  bandwidth_khz: number;
  frequency_mhz: number;
  tx_power_dbm: number;
  packet_loss_pct: number;
  payload_size_bytes: number;
  notes: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  filename: string;
  content: string;
  subsystem: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CodeSnippetVersion {
  id: string;
  snippet_id: string;
  version: number;
  content: string;
  created_at: string;
}
