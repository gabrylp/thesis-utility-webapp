import Dexie, { type EntityTable } from "dexie";

export interface TestRun {
  id: string;
  title: string;
  date: string;
  location: string;
  wave_condition: string;
  notes: string;
  k_factor: number;
  status: "draft" | "completed";
  sort_order: number;
  run_type: "flow_rate" | "communication";
  created_at: string;
  updated_at: string;
  synced_at: string | null;
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
  synced_at: string | null;
}

export type FlowMethod = FlowReading["method"];

export const FLOW_METHOD_LABELS: Record<FlowMethod, string> = {
  with_sensor: "Pulse-based",
  without_sensor: "Actual",
};

export function flowMethodLabel(m: string): string {
  return FLOW_METHOD_LABELS[m as FlowMethod] ?? m;
}

export interface PowerReading {
  id: string;
  run_id: string;
  timestamp: string;
  voltage: number;
  amperage: number;
  synced_at: string | null;
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
  synced_at: string | null;
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
  synced_at: string | null;
}

export interface CodeSnippetVersion {
  id: string;
  snippet_id: string;
  version: number;
  content: string;
  created_at: string;
  synced_at: string | null;
}

const db = new Dexie("ThesisUtilityDB") as Dexie & {
  test_runs: EntityTable<TestRun, "id">;
  flow_readings: EntityTable<FlowReading, "id">;
  power_readings: EntityTable<PowerReading, "id">;
  comm_readings: EntityTable<CommReading, "id">;
  code_snippets: EntityTable<CodeSnippet, "id">;
  code_snippet_versions: EntityTable<CodeSnippetVersion, "id">;
};

db.version(4).stores({
  test_runs: "id, title, date, run_type, status, synced_at",
  flow_readings: "id, run_id, method, timestamp, synced_at",
  power_readings: "id, run_id, timestamp, synced_at",
  comm_readings: "id, run_id, timestamp, synced_at",
  code_snippets: "id, title, subsystem, synced_at",
  code_snippet_versions: "id, snippet_id, version, synced_at",
}).upgrade(async (tx) => {
  await tx.table("test_runs").toCollection().modify((run) => {
    if (!run.run_type) run.run_type = "flow_rate";
  });
});

export { db };
