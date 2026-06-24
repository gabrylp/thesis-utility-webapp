import { useState, useMemo } from "react";
import {
  ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { CommReading } from "@/lib/db";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  readings: CommReading[];
  title?: string;
  theme: "dark" | "light";
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

export function CustomCommChart({ readings, theme, title }: Props) {
  const [xCol, setXCol] = useState("distance_m");
  const [yCol, setYCol] = useState("rssi");
  const [chartType, setChartType] = useState<"scatter" | "line">("scatter");
  const [splitBy, setSplitBy] = useState<"none" | "sf">("none");

  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "#1E293B" : "#E2E8F0",
    text: isDark ? "#94A3B8" : "#475569",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
  };

  const data = useMemo(() => {
    return readings
      .map((r) => ({
        x: (r as any)[xCol] ?? 0,
        y: (r as any)[yCol] ?? 0,
        sf: r.spread_factor,
      }))
      .sort((a, b) => a.x - b.x);
  }, [readings, xCol, yCol]);

  const sfGroups = useMemo(() => {
    const groups: Record<number, typeof data> = {};
    for (const d of data) {
      if (!groups[d.sf]) groups[d.sf] = [];
      groups[d.sf].push(d);
    }
    return groups;
  }, [data]);

  const SF_COLORS = ["#3B82F6", "#A855F7", "#10B981", "#EF4444", "#F59E0B", "#EC4899"];
  const splitData = Object.entries(sfGroups).sort(([a], [b]) => Number(a) - Number(b));

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No communication data to display.
      </div>
    );
  }

  return (
    <div>
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
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
          <Select value={splitBy} onChange={(e) => setSplitBy(e.target.value as any)} options={[{ value: "none", label: "None" }, { value: "sf", label: "Spread Factor" }]} className="h-8 text-xs w-32" />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        {splitBy === "none" ? (
          chartType === "scatter" ? (
            <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="x" tick={{ fontSize: 10, fill: tc.text }} name={xCol} />
              <YAxis dataKey="y" tick={{ fontSize: 10, fill: tc.text }} name={yCol} />
              <Tooltip
                contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
                labelStyle={{ color: tc.text }}
              />
              <Scatter data={data} fill="#3B82F6" name={`${yCol} vs ${xCol}`} />
            </ScatterChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="x" tick={{ fontSize: 10, fill: tc.text }} name={xCol} />
              <YAxis dataKey="y" tick={{ fontSize: 10, fill: tc.text }} name={yCol} />
              <Tooltip
                contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
                labelStyle={{ color: tc.text }}
              />
              <Line type="monotone" dataKey="y" stroke="#3B82F6" name={`${yCol} vs ${xCol}`} dot strokeWidth={2} />
            </LineChart>
          )
        ) : (
          <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
            <XAxis dataKey="x" tick={{ fontSize: 10, fill: tc.text }} name={xCol} />
            <YAxis dataKey="y" tick={{ fontSize: 10, fill: tc.text }} name={yCol} />
            <Tooltip
              contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
              labelStyle={{ color: tc.text }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {splitData.map(([sf, pts], i) => (
              <Scatter key={sf} data={pts} fill={SF_COLORS[i % SF_COLORS.length]} name={`SF ${sf}`} />
            ))}
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
