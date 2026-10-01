import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, type TestRun, type FlowReading, type PowerReading, type CommReading } from "@/lib/db";
import { syncManager } from "@/lib/sync";
import { generateId, formatDateTime } from "@/lib/utils";
import { computeFlowRate, estimateVolumeFromPulses, volumeErrorPct, computeAggregatePPL } from "@/lib/stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FlowFormulaCard } from "@/components/analysis/FlowFormulaCard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArrowLeft, Plus, Trash2, Download, Upload } from "lucide-react";

function ErrorCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground/50">—</span>;
  const abs = Math.abs(value);
  const color = abs <= 5 ? "text-green-400" : abs <= 10 ? "text-yellow-400" : "text-red-400";
  return <span className={color}>{value > 0 ? "+" : ""}{value.toFixed(4)}%</span>;
}

export default function RunDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<TestRun | null>(null);
  const [flowReadings, setFlowReadings] = useState<FlowReading[]>([]);
  const [powerReadings, setPowerReadings] = useState<PowerReading[]>([]);
  const [commReadings, setCommReadings] = useState<CommReading[]>([]);
  const [tab, setTab] = useState<"overview" | "flow" | "power" | "comm">("overview");
  const [showDelete, setShowDelete] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [durationSec, setDurationSec] = useState(0);
  const [intervalSec, setIntervalSec] = useState(0);
  const flowFileRef = useRef<HTMLInputElement>(null);
  const powerFileRef = useRef<HTMLInputElement>(null);
  const commFileRef = useRef<HTMLInputElement>(null);
  const jsonFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) loadAll();
  }, [id]);

  const kFactor = run?.k_factor || 440;

  const aggPpl = useMemo(() => computeAggregatePPL(flowReadings), [flowReadings]);

  async function loadAll() {
    if (!id) return;
    setRun(await db.test_runs.get(id) || null);
    setFlowReadings(await db.flow_readings.where("run_id").equals(id).toArray());
    setPowerReadings(await db.power_readings.where("run_id").equals(id).toArray());
    setCommReadings(await db.comm_readings.where("run_id").equals(id).toArray());
  }

  function updateRun(updates: Partial<TestRun>) {
    if (!run) return;
    // Update state synchronously so the input stays controlled and the caret
    // does not jump. Persisting is fire-and-forget: awaiting IndexedDB before
    // setState would let the `value` prop lag the DOM by a keystroke, and the
    // functional form stops fast typing from clobbering itself.
    setRun((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates, updated_at: new Date().toISOString() };
      void db.test_runs.put(next);
      void syncManager.queueChange("test_runs", "update", next as any);
      return next;
    });
  }

  async function addFlowReading(count = 1) {
    if (!id || !run) return;
    const now = new Date().toISOString();
    const batch: FlowReading[] = Array.from({ length: count }, () => ({
      id: generateId(),
      run_id: id,
      timestamp: now,
      method: "without_sensor",
      time_sec: durationSec || 0,
      volume_ml: 0,
      pulses: 0,
      flow_rate_lh: 0,
      notes: "",
      synced_at: null,
    }));
    await db.flow_readings.bulkAdd(batch);
    for (const r of batch) await syncManager.queueChange("flow_readings", "create", r as any);
    setFlowReadings([...flowReadings, ...batch]);
  }

  async function updateFlowReading(readingId: string, updates: Partial<FlowReading>) {
    const existing = await db.flow_readings.get(readingId);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    merged.flow_rate_lh = computeFlowRate(merged.method, merged.time_sec, merged.volume_ml, merged.pulses, kFactor);
    await db.flow_readings.put(merged);
    await syncManager.queueChange("flow_readings", "update", merged as any);
    setFlowReadings(flowReadings.map((r) => (r.id === readingId ? merged : r)));
  }

  async function deleteFlowReading(rid: string) {
    await db.flow_readings.delete(rid);
    setFlowReadings(flowReadings.filter((r) => r.id !== rid));
  }

  async function addPowerReading(count = 1) {
    if (!id) return;
    const now = new Date().toISOString();
    const batch: PowerReading[] = Array.from({ length: count }, () => ({
      id: generateId(),
      run_id: id,
      timestamp: now,
      voltage: 0,
      amperage: 0,
      synced_at: null,
    }));
    await db.power_readings.bulkAdd(batch);
    for (const r of batch) await syncManager.queueChange("power_readings", "create", r as any);
    setPowerReadings([...powerReadings, ...batch]);
  }

  async function updatePowerReading(readingId: string, updates: Partial<PowerReading>) {
    const existing = await db.power_readings.get(readingId);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    await db.power_readings.put(merged);
    await syncManager.queueChange("power_readings", "update", merged as any);
    setPowerReadings(powerReadings.map((r) => (r.id === readingId ? merged : r)));
  }

  async function deletePowerReading(rid: string) {
    await db.power_readings.delete(rid);
    setPowerReadings(powerReadings.filter((r) => r.id !== rid));
  }

  async function addCommReading(count = 1) {
    if (!id) return;
    const now = new Date().toISOString();
    const batch: CommReading[] = Array.from({ length: count }, () => ({
      id: generateId(),
      run_id: id,
      timestamp: now,
      rtt_ms: 0,
      one_way_latency_ms: 0,
      rssi: 0,
      snr: 0,
      distance_m: 0,
      spread_factor: 7,
      coding_rate: "4/5",
      bandwidth_khz: 125,
      frequency_mhz: 915,
      tx_power_dbm: 17,
      packet_loss_pct: 0,
      payload_size_bytes: 32,
      notes: "",
      synced_at: null,
    }));
    await db.comm_readings.bulkAdd(batch);
    for (const r of batch) await syncManager.queueChange("comm_readings", "create", r as any);
    setCommReadings([...commReadings, ...batch]);
  }

  async function updateCommReading(readingId: string, updates: Partial<CommReading>) {
    const existing = await db.comm_readings.get(readingId);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    await db.comm_readings.put(merged);
    await syncManager.queueChange("comm_readings", "update", merged as any);
    setCommReadings(commReadings.map((r) => (r.id === readingId ? merged : r)));
  }

  async function deleteCommReading(rid: string) {
    await db.comm_readings.delete(rid);
    setCommReadings(commReadings.filter((r) => r.id !== rid));
  }

  async function deleteEntireRun() {
    if (!id) return;
    const f = await db.flow_readings.where("run_id").equals(id).toArray();
    const p = await db.power_readings.where("run_id").equals(id).toArray();
    const c = await db.comm_readings.where("run_id").equals(id).toArray();
    for (const r of f) await db.flow_readings.delete(r.id);
    for (const r of p) await db.power_readings.delete(r.id);
    for (const r of c) await db.comm_readings.delete(r.id);
    await db.test_runs.delete(id);
    await syncManager.queueChange("test_runs", "delete", { id } as any);
    navigate("/runs");
  }

  function downloadBlob(content: string, filename: string, mime = "text/csv") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportFlowCSV() {
    if (!run) return;
    const header = "timestamp,method,time_sec,volume_ml,pulses,notes";
    const rows = flowReadings.map((r) =>
      `${r.timestamp},${r.method},${r.time_sec},${r.volume_ml},${r.pulses},"${r.notes.replace(/"/g, '""')}"`
    );
    downloadBlob([header, ...rows].join("\n"), `${run.title.replace(/\s+/g, "_")}_flow.csv`);
  }

  function exportPowerCSV() {
    if (!run) return;
    const header = "timestamp,voltage,amperage";
    const rows = powerReadings.map((pr) =>
      `${pr.timestamp},${pr.voltage},${pr.amperage}`
    );
    downloadBlob([header, ...rows].join("\n"), `${run.title.replace(/\s+/g, "_")}_power.csv`);
  }

  function exportCommCSV() {
    if (!run) return;
    const header = "timestamp,rtt_ms,one_way_latency_ms,rssi,snr,distance_m,spread_factor,coding_rate,bandwidth_khz,frequency_mhz,tx_power_dbm,packet_loss_pct,payload_size_bytes,notes";
    const rows = commReadings.map((r) =>
      `${r.timestamp},${r.rtt_ms},${r.one_way_latency_ms},${r.rssi},${r.snr},${r.distance_m},${r.spread_factor},${r.coding_rate},${r.bandwidth_khz},${r.frequency_mhz},${r.tx_power_dbm},${r.packet_loss_pct},${r.payload_size_bytes},"${r.notes.replace(/"/g, '""')}"`
    );
    downloadBlob([header, ...rows].join("\n"), `${run.title.replace(/\s+/g, "_")}_comm.csv`);
  }

  function exportAllCSV() {
    if (!run) return;
    const flowHeader = "type,timestamp,method,time_sec,volume_ml,pulses,voltage,amperage,notes";
    const flowRows = flowReadings.map((r) =>
      `flow,${r.timestamp},${r.method},${r.time_sec},${r.volume_ml},${r.pulses},,,"${r.notes.replace(/"/g, '""')}"`
    );
    const powerRows = powerReadings.map((pr) =>
      `power,${pr.timestamp},,,,0,${pr.voltage},${pr.amperage},`
    );
    const commHeader = "type,timestamp,rtt_ms,one_way_latency_ms,rssi,snr,distance_m,spread_factor,coding_rate,bandwidth_khz,frequency_mhz,tx_power_dbm,packet_loss_pct,payload_size_bytes,notes";
    const commRows = commReadings.map((r) =>
      `comm,${r.timestamp},${r.rtt_ms},${r.one_way_latency_ms},${r.rssi},${r.snr},${r.distance_m},${r.spread_factor},${r.coding_rate},${r.bandwidth_khz},${r.frequency_mhz},${r.tx_power_dbm},${r.packet_loss_pct},${r.payload_size_bytes},"${r.notes.replace(/"/g, '""')}"`
    );
    downloadBlob(
      [flowHeader, ...flowRows, "", commHeader, ...commRows].join("\n"),
      `${run.title.replace(/\s+/g, "_")}_all.csv`
    );
  }

  function parseCSV(text: string): string[][] {
    const rows: string[][] = [];
    let current: string[] = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ",") { current.push(field); field = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r") { if (text[i + 1] === "\n") i++; }
        if (field || current.length > 0) { current.push(field); rows.push(current); }
        current = []; field = "";
      } else field += ch;
    }
    if (field || current.length > 0) { current.push(field); rows.push(current); }
    return rows;
  }

  async function importFlowFromCSV(file: File) {
    if (!id || !run) return;
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) return;
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const timestampIdx = headers.indexOf("timestamp");
    const methodIdx = headers.indexOf("method");
    const timeIdx = headers.indexOf("time_sec");
    const volIdx = headers.indexOf("volume_ml");
    const pulsesIdx = headers.indexOf("pulses");
    const notesIdx = headers.indexOf("notes");
    if (methodIdx === -1 || timeIdx === -1 || volIdx === -1) { alert("CSV must have headers: method, time_sec, volume_ml"); return; }
    const now = new Date().toISOString();
    const k = run.k_factor || 440;
    const batch: FlowReading[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const method = r[methodIdx]?.trim() === "with_sensor" ? "with_sensor" : "without_sensor";
      const time_sec = parseFloat(r[timeIdx]) || 0;
      const volume_ml = parseFloat(r[volIdx]) || 0;
      const pulses = pulsesIdx !== -1 ? parseFloat(r[pulsesIdx]) || 0 : 0;
      const notes = notesIdx !== -1 ? r[notesIdx] || "" : "";
      batch.push({
        id: generateId(), run_id: id,
        timestamp: timestampIdx !== -1 && r[timestampIdx] ? r[timestampIdx] : now,
        method, time_sec, volume_ml, pulses,
        flow_rate_lh: computeFlowRate(method, time_sec, volume_ml, pulses, k),
        notes, synced_at: null,
      });
    }
    if (batch.length === 0) return;
    await db.flow_readings.bulkAdd(batch);
    for (const r of batch) await syncManager.queueChange("flow_readings", "create", r as any);
    setFlowReadings([...flowReadings, ...batch]);
  }

  async function importPowerFromCSV(file: File) {
    if (!id) return;
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) return;
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const timestampIdx = headers.indexOf("timestamp");
    const voltageIdx = headers.indexOf("voltage");
    const amperageIdx = headers.indexOf("amperage");
    if (voltageIdx === -1 || amperageIdx === -1) { alert("CSV must have headers: voltage, amperage"); return; }
    const now = new Date().toISOString();
    const batch: PowerReading[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      batch.push({
        id: generateId(), run_id: id,
        timestamp: timestampIdx !== -1 && r[timestampIdx] ? r[timestampIdx] : now,
        voltage: parseFloat(r[voltageIdx]) || 0,
        amperage: parseFloat(r[amperageIdx]) || 0,
        synced_at: null,
      });
    }
    if (batch.length === 0) return;
    await db.power_readings.bulkAdd(batch);
    for (const r of batch) await syncManager.queueChange("power_readings", "create", r as any);
    setPowerReadings([...powerReadings, ...batch]);
  }

  async function importCommFromCSV(file: File) {
    if (!id) return;
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) return;
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const required = ["rtt_ms"];
    if (!required.every((h) => headers.includes(h))) { alert("CSV must have header: rtt_ms"); return; }
    const now = new Date().toISOString();
    const batch: CommReading[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      batch.push({
        id: generateId(), run_id: id, timestamp: now,
        rtt_ms: parseFloat(r[headers.indexOf("rtt_ms")]) || 0,
        one_way_latency_ms: headers.includes("one_way_latency_ms") ? parseFloat(r[headers.indexOf("one_way_latency_ms")]) || 0 : 0,
        rssi: headers.includes("rssi") ? parseFloat(r[headers.indexOf("rssi")]) || 0 : 0,
        snr: headers.includes("snr") ? parseFloat(r[headers.indexOf("snr")]) || 0 : 0,
        distance_m: headers.includes("distance_m") ? parseFloat(r[headers.indexOf("distance_m")]) || 0 : 0,
        spread_factor: headers.includes("spread_factor") ? parseInt(r[headers.indexOf("spread_factor")]) || 7 : 7,
        coding_rate: headers.includes("coding_rate") ? r[headers.indexOf("coding_rate")]?.trim() || "4/5" : "4/5",
        bandwidth_khz: headers.includes("bandwidth_khz") ? parseFloat(r[headers.indexOf("bandwidth_khz")]) || 125 : 125,
        frequency_mhz: headers.includes("frequency_mhz") ? parseFloat(r[headers.indexOf("frequency_mhz")]) || 915 : 915,
        tx_power_dbm: headers.includes("tx_power_dbm") ? parseFloat(r[headers.indexOf("tx_power_dbm")]) || 17 : 17,
        packet_loss_pct: headers.includes("packet_loss_pct") ? parseFloat(r[headers.indexOf("packet_loss_pct")]) || 0 : 0,
        payload_size_bytes: headers.includes("payload_size_bytes") ? parseInt(r[headers.indexOf("payload_size_bytes")]) || 32 : 32,
        notes: headers.includes("notes") ? r[headers.indexOf("notes")] || "" : "",
        synced_at: null,
      });
    }
    if (batch.length === 0) return;
    await db.comm_readings.bulkAdd(batch);
    for (const r of batch) await syncManager.queueChange("comm_readings", "create", r as any);
    setCommReadings([...commReadings, ...batch]);
  }

  async function handleFlowFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await importFlowFromCSV(file);
    e.target.value = "";
  }

  async function handlePowerFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await importPowerFromCSV(file);
    e.target.value = "";
  }

  async function handleCommFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await importCommFromCSV(file);
    e.target.value = "";
  }

  function exportRunJSON() {
    if (!run) return;
    const data = { run, flowReadings, powerReadings, commReadings };
    downloadBlob(JSON.stringify(data, null, 2), `${run.title.replace(/\s+/g, "_")}.json`, "application/json");
  }

  async function importRunJSON(file: File) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.run) { alert("Invalid JSON format"); return; }
    await db.test_runs.put(data.run);
    if (data.flowReadings?.length) await db.flow_readings.bulkAdd(data.flowReadings);
    if (data.powerReadings?.length) await db.power_readings.bulkAdd(data.powerReadings);
    if (data.commReadings?.length) await db.comm_readings.bulkAdd(data.commReadings);
    await loadAll();
  }

  async function handleJSONFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await importRunJSON(file);
    e.target.value = "";
  }

  if (!run) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isFlow = (run.run_type ?? "flow_rate") === "flow_rate";
  const isComm = run.run_type === "communication";

  const tabs = isFlow
    ? [
        { key: "overview" as const, label: "Overview" },
        { key: "flow" as const, label: `Flow (${flowReadings.length})` },
        { key: "power" as const, label: `Power (${powerReadings.length})` },
      ]
    : [
        { key: "overview" as const, label: "Overview" },
        { key: "comm" as const, label: `Comm (${commReadings.length})` },
        { key: "power" as const, label: `Power (${powerReadings.length})` },
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/runs")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{run.title}</h2>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isComm ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
              {isComm ? "Comm" : "Flow Rate"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{new Date(run.date).toLocaleDateString()} &middot; {run.location}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {!run.synced_at && <Badge variant="warning">Pending sync</Badge>}
          <Badge variant={run.status === "completed" ? "success" : "warning"}>{run.status}</Badge>
          <Button variant="outline" size="sm" onClick={() => updateRun({ status: run.status === "completed" ? "draft" : "completed" })} className="h-7 text-xs">
            {run.status === "completed" ? "Reopen" : "Complete"}
          </Button>
          <div className="w-px h-5 bg-border mx-0.5" />
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportAllCSV}><Download className="h-3 w-3" /> All CSV</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportRunJSON}><Download className="h-3 w-3" /> JSON</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => jsonFileRef.current?.click()}><Upload className="h-3 w-3" /> Import</Button>
          <input type="file" accept=".json" ref={jsonFileRef} onChange={handleJSONFile} className="hidden" />
          <div className="w-px h-5 bg-border mx-0.5" />
          <Button variant="ghost" size="icon" onClick={() => setShowDelete(true)} className="text-muted-foreground hover:text-red-400 h-7 w-7">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              tab === t.key ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <Card>
          <CardHeader><CardTitle>Run Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={run.title} onChange={(e) => updateRun({ title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={run.location} onChange={(e) => updateRun({ location: e.target.value })} />
              </div>
              {isFlow && (
                <div className="space-y-2">
                  <Label>Wave Condition</Label>
                  <Select
                    value={run.wave_condition}
                    onChange={(e) => updateRun({ wave_condition: e.target.value })}
                    options={[
                      { value: "calm", label: "Calm" },
                      { value: "moderate", label: "Moderate" },
                      { value: "rough", label: "Rough" },
                    ]}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={run.notes} onChange={(e) => updateRun({ notes: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        )}

      {tab === "flow" && isFlow && (
        <div className="space-y-4">
          <FlowFormulaCard
            kFactor={kFactor}
            onChange={(k) => {
              updateRun({ k_factor: k });
              flowReadings.forEach((r) => {
                if (r.method === "with_sensor") {
                  const updated = { ...r, flow_rate_lh: computeFlowRate(r.method, r.time_sec, r.volume_ml, r.pulses, k) };
                  db.flow_readings.put(updated);
                  setFlowReadings((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
                }
              });
            }}
          />
          {aggPpl.n > 0 && (
            <Card className="border-blue-500/30">
              <CardContent className="py-2.5 px-4">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-mono">
                  <span className="text-muted-foreground">Calculated PPL</span>
                  <span className="text-blue-400 font-semibold text-sm">{aggPpl.ppl.toFixed(1)} pulses/L</span>
                  <span className="text-muted-foreground">
                    avg pulses <span className="text-foreground">{aggPpl.avgPulses.toFixed(1)}</span>
                    {" / "}
                    avg vol <span className="text-foreground">{aggPpl.avgVolumeMl.toFixed(1)} mL</span>
                  </span>
                  <span className="text-muted-foreground">
                    {aggPpl.n} reading{aggPpl.n !== 1 ? "s" : ""} with both values
                  </span>
                  {Math.abs(aggPpl.ppl - kFactor) > 0.5 && (
                    <span className="text-yellow-400/90">
                      differs from the run K-factor of {kFactor}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm font-medium">Flow Readings</CardTitle>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-md border border-input bg-background overflow-hidden h-7">
                  <input type="number" min={1} max={100} value={batchCount} onChange={(e) => setBatchCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-10 h-full border-0 bg-transparent px-1.5 text-xs text-center [appearance:textfield] outline-none" />
                  <button onClick={() => addFlowReading(batchCount)} className="flex items-center gap-1 h-full px-2.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="w-px h-5 bg-border mx-0.5" />
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportFlowCSV}><Download className="h-3 w-3" /> CSV</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => flowFileRef.current?.click()}><Upload className="h-3 w-3" /> Import</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <input type="file" accept=".csv" ref={flowFileRef} onChange={handleFlowFile} className="hidden" />
              {flowReadings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No flow readings recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] text-xs table-fixed">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="text-center font-medium py-1.5 px-2 w-8">#</th>
                        <th className="text-right font-medium py-1.5 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <span>Elapsed (s)</span>
                            <input type="number" min={0} value={intervalSec || ""} onChange={(e) => setIntervalSec(parseFloat(e.target.value) || 0)} className="w-12 h-6 rounded border border-input bg-transparent px-1 text-[10px] text-center [appearance:textfield]" placeholder="Int" />
                          </div>
                        </th>
                        <th className="text-right font-medium py-1.5 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <span>Time (s)</span>
                            <input type="number" min={0} value={durationSec || ""} onChange={async (e) => {
                              const v = parseFloat(e.target.value) || 0;
                              setDurationSec(v);
                              if (v > 0) {
                                for (const r of flowReadings) {
                    const updated = { ...r, time_sec: v, flow_rate_lh: computeFlowRate(r.method, v, r.volume_ml, r.pulses, kFactor) };
                    await db.flow_readings.put(updated);
                  }
                  setFlowReadings((prev) => prev.map((r) => ({ ...r, time_sec: v, flow_rate_lh: computeFlowRate(r.method, v, r.volume_ml, r.pulses, kFactor) })));
                              }
                            }} className="w-12 h-6 rounded border border-input bg-transparent px-1 text-[10px] text-center [appearance:textfield]" placeholder="Dur" />
                          </div>
                        </th>
                        <th className="text-right font-medium py-1.5 px-2">Pulses</th>
                        <th className="text-right font-medium py-1.5 px-2 text-blue-400">Est. Vol</th>
                        <th className="text-right font-medium py-1.5 px-2">Vol (mL)</th>
                        <th className="text-right font-medium py-1.5 px-2">PPL</th>
                        <th className="text-right font-medium py-1.5 px-2 text-blue-400">Est. Flow</th>
                        <th className="text-right font-medium py-1.5 px-2 text-green-400">Act. Flow</th>
                        <th className="text-right font-medium py-1.5 px-2">Err %</th>
                        <th className="text-left font-medium py-1.5 px-2">Notes</th>
                        <th className="font-medium py-1.5 px-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {flowReadings.map((r, idx) => {
                        const estVol = estimateVolumeFromPulses(r.pulses, kFactor);
                        const pulseFlowLh = computeFlowRate("with_sensor", r.time_sec, r.volume_ml, r.pulses, kFactor);
                        const actualFlowLh = computeFlowRate("without_sensor", r.time_sec, r.volume_ml, r.pulses, kFactor);
                        return (
                        <tr key={r.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                          <td className="py-1 px-2 text-center text-muted-foreground">{idx + 1}</td>
                          <td className="py-1 px-2 text-right font-mono text-muted-foreground text-xs">
                            {intervalSec > 0 ? (intervalSec * (idx + 1)).toFixed(0) : "-"}
                          </td>
                          <td className="py-1 px-2">
                            <Input type="number" value={r.time_sec || ""} onChange={(e) => updateFlowReading(r.id, { time_sec: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                          </td>
                          <td className="py-1 px-2">
                            <Input type="number" value={r.pulses || ""} onChange={(e) => updateFlowReading(r.id, { pulses: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                          </td>
                          <td className="py-1 px-2 text-right font-mono text-xs text-blue-400">
                            {r.pulses > 0 ? estVol.toFixed(1) : "-"}
                          </td>
                          <td className="py-1 px-2">
                            <Input type="number" value={r.volume_ml || ""} onChange={(e) => updateFlowReading(r.id, { volume_ml: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                          </td>
                          <td className="py-1 px-2 text-right font-mono text-xs text-muted-foreground">
                            {r.pulses > 0 && r.volume_ml > 0 ? (r.pulses / (r.volume_ml / 1000)).toFixed(1) : "-"}
                          </td>
                          <td className="py-1 px-2 text-right font-mono text-xs text-blue-400">
                            {pulseFlowLh > 0 ? pulseFlowLh.toFixed(1) : "-"}
                          </td>
                          <td className="py-1 px-2 text-right font-mono text-xs font-semibold text-green-400">
                            {actualFlowLh > 0 ? actualFlowLh.toFixed(1) : "-"}
                          </td>
                          <td className="py-1 px-2 text-right font-mono text-xs">
                            <ErrorCell value={volumeErrorPct(estVol, r.volume_ml)} />
                          </td>
                          <td className="py-1 px-2">
                            <Input value={r.notes} onChange={(e) => updateFlowReading(r.id, { notes: e.target.value })} placeholder="Notes..." className="h-7 text-xs" />
                          </td>
                          <td className="py-1 px-2 text-center">
                            <button onClick={() => deleteFlowReading(r.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "comm" && isComm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm font-medium">Communication Readings</CardTitle>
            <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-md border border-input bg-background overflow-hidden h-7">
                  <input type="number" min={1} max={100} value={batchCount} onChange={(e) => setBatchCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-10 h-full border-0 bg-transparent px-1.5 text-xs text-center [appearance:textfield] outline-none" />
                  <button onClick={() => addCommReading(batchCount)} className="flex items-center gap-1 h-full px-2.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="w-px h-5 bg-border mx-0.5" />
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportCommCSV}><Download className="h-3 w-3" /> CSV</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => commFileRef.current?.click()}><Upload className="h-3 w-3" /> Import</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <input type="file" accept=".csv" ref={commFileRef} onChange={handleCommFile} className="hidden" />
            {commReadings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No communication readings recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs table-fixed">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-left font-medium py-1.5 px-2">RTT (ms)</th>
                      <th className="text-right font-medium py-1.5 px-2">One-way (ms)</th>
                      <th className="text-right font-medium py-1.5 px-2">RSSI</th>
                      <th className="text-right font-medium py-1.5 px-2">SNR</th>
                      <th className="text-right font-medium py-1.5 px-2">Dist (m)</th>
                      <th className="text-right font-medium py-1.5 px-2">SF</th>
                      <th className="text-center font-medium py-1.5 px-2">CR</th>
                      <th className="text-right font-medium py-1.5 px-2">BW</th>
                      <th className="text-right font-medium py-1.5 px-2">Freq</th>
                      <th className="text-right font-medium py-1.5 px-2">TX Pwr</th>
                      <th className="text-right font-medium py-1.5 px-2">Loss %</th>
                      <th className="text-right font-medium py-1.5 px-2">Payload</th>
                      <th className="text-left font-medium py-1.5 px-2">Notes</th>
                      <th className="font-medium py-1.5 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {commReadings.map((r) => (
                      <tr key={r.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                        <td className="py-1 px-2">
                          <Input type="number" value={r.rtt_ms || ""} onChange={(e) => updateCommReading(r.id, { rtt_ms: parseFloat(e.target.value) || 0 })} className="h-7 text-xs [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2">
                          <Input type="number" value={r.one_way_latency_ms || ""} onChange={(e) => updateCommReading(r.id, { one_way_latency_ms: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2">
                          <Input type="number" value={r.rssi || ""} onChange={(e) => updateCommReading(r.id, { rssi: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2">
                          <Input type="number" value={r.snr || ""} onChange={(e) => updateCommReading(r.id, { snr: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2">
                          <Input type="number" value={r.distance_m || ""} onChange={(e) => updateCommReading(r.id, { distance_m: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2">
                          <Input type="number" min={7} max={12} value={r.spread_factor || ""} onChange={(e) => updateCommReading(r.id, { spread_factor: parseInt(e.target.value) || 7 })} className="h-7 text-xs text-right [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2">
                          <Select
                            value={r.coding_rate}
                            onChange={(e) => updateCommReading(r.id, { coding_rate: e.target.value })}
                            options={[
                              { value: "4/5", label: "4/5" },
                              { value: "4/6", label: "4/6" },
                              { value: "4/7", label: "4/7" },
                              { value: "4/8", label: "4/8" },
                            ]}
                            className="h-7 text-xs w-16 min-w-0"
                          />
                        </td>
                        <td className="py-1 px-2">
                          <Select
                            value={r.bandwidth_khz.toString()}
                            onChange={(e) => updateCommReading(r.id, { bandwidth_khz: parseInt(e.target.value) || 125 })}
                            options={[
                              { value: "62.5", label: "62.5" },
                              { value: "125", label: "125" },
                              { value: "250", label: "250" },
                              { value: "500", label: "500" },
                            ]}
                            className="h-7 text-xs w-16 min-w-0"
                          />
                        </td>
                        <td className="py-1 px-2">
                          <Select
                            value={r.frequency_mhz.toString()}
                            onChange={(e) => updateCommReading(r.id, { frequency_mhz: parseFloat(e.target.value) || 915 })}
                            options={[
                              { value: "868", label: "868" },
                              { value: "915", label: "915" },
                              { value: "923", label: "923" },
                            ]}
                            className="h-7 text-xs w-14 min-w-0"
                          />
                        </td>
                        <td className="py-1 px-2">
                          <Input type="number" value={r.tx_power_dbm || ""} onChange={(e) => updateCommReading(r.id, { tx_power_dbm: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2">
                          <Input type="number" min={0} max={100} value={r.packet_loss_pct || ""} onChange={(e) => updateCommReading(r.id, { packet_loss_pct: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2">
                          <Input type="number" value={r.payload_size_bytes || ""} onChange={(e) => updateCommReading(r.id, { payload_size_bytes: parseInt(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2">
                          <Input value={r.notes} onChange={(e) => updateCommReading(r.id, { notes: e.target.value })} placeholder="Notes..." className="h-7 text-xs" />
                        </td>
                        <td className="py-1 px-2 text-center">
                          <button onClick={() => deleteCommReading(r.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "power" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm font-medium">Power Readings</CardTitle>
            <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-md border border-input bg-background overflow-hidden h-7">
                  <input type="number" min={1} max={100} value={batchCount} onChange={(e) => setBatchCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-10 h-full border-0 bg-transparent px-1.5 text-xs text-center [appearance:textfield] outline-none" />
                  <button onClick={() => addPowerReading(batchCount)} className="flex items-center gap-1 h-full px-2.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="w-px h-5 bg-border mx-0.5" />
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportPowerCSV}><Download className="h-3 w-3" /> CSV</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => powerFileRef.current?.click()}><Upload className="h-3 w-3" /> Import</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <input type="file" accept=".csv" ref={powerFileRef} onChange={handlePowerFile} className="hidden" />
            {powerReadings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No power readings recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                    <table className="w-full text-xs table-fixed">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-center font-medium py-1.5 px-2 w-8">#</th>
                      <th className="text-left font-medium py-1.5 px-2">Time</th>
                      <th className="text-right font-medium py-1.5 px-2">Voltage (V)</th>
                      <th className="text-right font-medium py-1.5 px-2">Current (A)</th>
                      <th className="text-right font-medium py-1.5 px-2">Power (W)</th>
                      <th className="font-medium py-1.5 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {powerReadings.map((pr, idx) => (
                      <tr key={pr.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                        <td className="py-1 px-2 text-center text-muted-foreground">{idx + 1}</td>
                        <td className="py-1 px-2 text-muted-foreground">{formatDateTime(pr.timestamp)}</td>
                        <td className="py-1 px-2">
                          <Input type="number" step="0.1" value={pr.voltage} onChange={(e) => updatePowerReading(pr.id, { voltage: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2">
                          <Input type="number" step="0.001" value={pr.amperage} onChange={(e) => updatePowerReading(pr.id, { amperage: parseFloat(e.target.value) || 0 })} className="h-7 text-xs text-right [appearance:textfield]" />
                        </td>
                        <td className="py-1 px-2 text-right font-mono font-semibold text-yellow-400">
                          {(pr.voltage * pr.amperage).toFixed(3)}
                        </td>
                        <td className="py-1 px-2 text-center">
                          <button onClick={() => deletePowerReading(pr.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={showDelete}
        title="Delete Run"
        message={`Permanently delete "${run.title}" and all its readings? This cannot be undone.`}
        confirmLabel="Delete Run"
        onConfirm={deleteEntireRun}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
