import { useState, useMemo } from "react";
import {
  ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { CommReading, TestRun } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  readings: CommReading[];
  title?: string;
  theme: "dark" | "light";
  layout?: "connected" | "layered" | "separate";
  runs?: TestRun[];
}

const COMM_COLS = [
  { value: "rtt_ms", label: "RTT (ms)" },
  { value: "one_way_latency_ms", label: "One-way Latency (ms)" },
  { value: "rssi", label: "RSSI" },
  { value: "snr", label: "SNR" },
  { value: "distance_m", label: "Distance (m)" },
  { value: "spread_factor", label: "Spread Factor" },
  { value: "bandwidth_khz", label: "Bandwidth (kHz)" },
  { value: "frequency_mhz", label: "Frequency (MHz)" },
  { value: "tx_power_dbm", label: "TX Power (dBm)" },
  { value: "packet_loss_pct", label: "Packet Loss (%)" },
  { value: "payload_size_bytes", label: "Payload (B)" },
];

const COLORS = ["#3B82F6", "#A855F7", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316"];

export function CustomCommChart({ readings, theme, title, layout = "separate", runs }: Props) {
  const [xCol, setXCol] = useState("distance_m");
  const [yCol, setYCol] = useState("rssi");
  const [chartType, setChartType] = useState<"scatter" | "line">("line");
  const [splitBy, setSplitBy] = useState<"none" | "sf" | "run">("none");

  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "#1E293B" : "#E2E8F0",
    text: isDark ? "#94A3B8" : "#475569",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
  };

  const runMap = useMemo(() => {
    const m = new Map<string, string>();
    if (runs) for (const r of runs) m.set(r.id, r.title);
    return m;
  }, [runs]);

  const { data, groups } = useMemo(() => {
    const base = readings.map((r) => ({
      x: (r as any)[xCol] ?? 0,
      y: (r as any)[yCol] ?? 0,
      sf: r.spread_factor,
      run_id: r.run_id,
      time: formatDateTime(r.timestamp),
    })).sort((a, b) => a.x - b.x);

    if (splitBy === "none" || layout === "connected") return { data: base, groups: null };

    if (splitBy === "sf") {
      const bySf = new Map<number, typeof base>();
      for (const d of base) {
        const arr = bySf.get(d.sf) || [];
        arr.push(d);
        bySf.set(d.sf, arr);
      }
      return { data: base, groups: Array.from(bySf.entries()).map(([sf, pts]) => ({ name: `SF ${sf}`, data: pts })) };
    }
    const byRun = new Map<string, typeof base>();
    for (const d of base) {
      const arr = byRun.get(d.run_id) || [];
      arr.push(d);
      byRun.set(d.run_id, arr);
    }
    return { data: base, groups: Array.from(byRun.entries()).map(([runId, pts]) => ({ name: runMap.get(runId) || `Run ${runId.slice(0, 6)}...`, data: pts })) };
  }, [readings, xCol, yCol, splitBy, runMap, layout]);

  const chartTitleLabel = (() => {
    const xLabel = COMM_COLS.find(c => c.value === xCol)?.label || xCol;
    const yLabel = COMM_COLS.find(c => c.value === yCol)?.label || yCol;
    return `${yLabel} vs ${xLabel}`;
  })();

  const tooltipContent = (props: any) => {
    if (!props.active || !props.payload?.length) return null;
    const time = props.payload[0]?.payload?.time;
    const xv = props.payload[0]?.payload?.x;
    return (
      <div style={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
        {time && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 2 }}>{time}</p>}
        {xv != null && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>x: {Number(xv).toFixed(2)}</p>}
        {props.payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color || "#F8FAFC", fontWeight: 600, fontSize: 13, margin: "2px 0" }}>
            {p.name}: {Number(p.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  };

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No communication data to display.
      </div>
    );
  }

  return (
    <div className="pt-7">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="space-y-1">
          <Label className="text-xs">X-Axis</Label>
          <Select value={xCol} onChange={(e) => setXCol(e.target.value)} options={COMM_COLS} className="h-8 text-xs w-36" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Y-Axis</Label>
          <Select value={yCol} onChange={(e) => setYCol(e.target.value)} options={COMM_COLS} className="h-8 text-xs w-36" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Chart Type</Label>
          <div className="flex gap-1">
            <Button size="sm" variant={chartType === "scatter" ? "default" : "outline"} className="h-8 text-xs px-3" onClick={() => setChartType("scatter")}>Scatter</Button>
            <Button size="sm" variant={chartType === "line" ? "default" : "outline"} className="h-8 text-xs px-3" onClick={() => setChartType("line")}>Line</Button>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Split By</Label>
          <Select value={splitBy} onChange={(e) => setSplitBy(e.target.value as any)} options={[
            { value: "none", label: "None" },
            { value: "sf", label: "Spread Factor" },
            { value: "run", label: "Run" },
          ]} className="h-8 text-xs w-32" />
        </div>
      </div>

      <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
        <div className="text-center text-sm font-medium py-2" style={{ color: tc.text }}>{chartTitleLabel}</div>
        <ResponsiveContainer width="100%" height={360}>
          {!groups ? (
            chartType === "scatter" ? (
              <ScatterChart margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="x" tick={{ fontSize: 10, fill: tc.text }} name={xCol} />
                <YAxis dataKey="y" tick={{ fontSize: 10, fill: tc.text }} name={yCol} />
                <Tooltip content={tooltipContent} />
                <Scatter data={data} fill="#3B82F6" name={`${yCol} vs ${xCol}`} />
              </ScatterChart>
            ) : (
              <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="x" tick={{ fontSize: 10, fill: tc.text }} name={xCol} label={{ value: COMM_COLS.find(c => c.value === xCol)?.label || xCol, position: "insideBottom", offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
                <YAxis dataKey="y" tick={{ fontSize: 10, fill: tc.text }} name={yCol} label={{ value: COMM_COLS.find(c => c.value === yCol)?.label || yCol, position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
                <Tooltip content={tooltipContent} />
                <Line type="monotone" dataKey="y" stroke="#3B82F6" name={`${yCol} vs ${xCol}`} dot strokeWidth={2} />
              </LineChart>
            )
          ) : chartType === "scatter" ? (
            <ScatterChart margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="x" tick={{ fontSize: 10, fill: tc.text }} name={xCol} />
              <YAxis dataKey="y" tick={{ fontSize: 10, fill: tc.text }} name={yCol} />
              <Tooltip content={tooltipContent} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {groups.map((g, i) => (
                <Scatter key={g.name} data={g.data} fill={COLORS[i % COLORS.length]!} name={g.name} />
              ))}
            </ScatterChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="x" tick={{ fontSize: 10, fill: tc.text }} name={xCol} label={{ value: COMM_COLS.find(c => c.value === xCol)?.label || xCol, position: "insideBottom", offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
                <YAxis dataKey="y" tick={{ fontSize: 10, fill: tc.text }} name={yCol} label={{ value: COMM_COLS.find(c => c.value === yCol)?.label || yCol, position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
                <Tooltip content={tooltipContent} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {groups.map((g, i) => (
                  <Line key={g.name} type="monotone" dataKey="y" data={g.data} stroke={COLORS[i % COLORS.length]!} strokeWidth={2} dot name={g.name} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
