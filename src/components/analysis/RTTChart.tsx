import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { CommReading, TestRun } from "@/lib/db";
import { computeStats, formatNum } from "@/lib/stats";
import { formatDateTime } from "@/lib/utils";

interface Props {
  readings: CommReading[];
  theme: "dark" | "light";
  title?: string;
  layout?: "connected" | "layered" | "separate";
  runs?: TestRun[];
}

const COLORS = ["#3B82F6", "#A855F7", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316"];

export function RTTChart({ readings, theme, title, layout = "separate", runs }: Props) {
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

  const connectedData = useMemo(() =>
    [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((r) => ({
        label: formatDateTime(r.timestamp),
        rtt_ms: r.rtt_ms,
        one_way: r.one_way_latency_ms,
      })),
  [readings]);

  const grouped = useMemo(() => {
    const byRun = new Map<string, CommReading[]>();
    for (const r of readings) {
      const arr = byRun.get(r.run_id) || [];
      arr.push(r);
      byRun.set(r.run_id, arr);
    }
    return Array.from(byRun.entries()).map(([runId, rs]) => ({
      name: runMap.get(runId) || `Run ${runId.slice(0, 6)}...`,
      data: rs.map((r) => ({
        label: formatDateTime(r.timestamp),
        rtt_ms: r.rtt_ms,
        one_way: r.one_way_latency_ms,
      })),
    }));
  }, [readings, runMap]);

  const layeredData = useMemo(() => {
    if (grouped.length === 0) return [];
    const allKeys = new Set<string>();
    for (const g of grouped) for (const d of g.data) allKeys.add(d.label);
    return [...allKeys].map(key => {
      const row: Record<string, any> = { label: key };
      for (const g of grouped) {
        const match = g.data.find(d => d.label === key);
        if (match) row[`${g.name} RTT`] = match.rtt_ms;
      }
      return row;
    });
  }, [grouped]);

  const tooltipContent = (props: any) => {
    if (!props.active || !props.payload?.length) return null;
    const label = props.payload[0]?.payload?.label;
    return (
      <div style={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
        {label && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>{label}</p>}
        {props.payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color || "#F8FAFC", fontWeight: 600, fontSize: 13, margin: "2px 0" }}>
            {p.name}: {Number(p.value).toFixed(2)} ms
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

  const rttVals = readings.map((r) => r.rtt_ms);
  const stats = computeStats(rttVals);

  return (
    <div className="pt-7">
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { label: "Mean RTT", value: formatNum(stats.mean) + " ms", color: "text-blue-400" },
          { label: "Min RTT", value: formatNum(Math.min(...rttVals)) + " ms", color: "text-green-400" },
          { label: "Max RTT", value: formatNum(Math.max(...rttVals)) + " ms", color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border border-border p-2 text-center">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className={`text-sm font-mono font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {layout === "connected" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.text }}>{title}</div>}
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={connectedData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: tc.text }} label={{ value: "Time", position: "insideBottom", offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 10, fill: tc.text }} unit=" ms" label={{ value: "RTT (ms)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="rtt_ms" stroke="#3B82F6" name="RTT (ms)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="one_way" stroke="#8B5CF6" name="One-way (ms)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : layout === "layered" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.text }}>{title}</div>}
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={layeredData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: tc.text }} label={{ value: "Time", position: "insideBottom", offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 10, fill: tc.text }} unit=" ms" label={{ value: "RTT (ms)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {grouped.map((g, i) => (
                <Line key={g.name} type="monotone" dataKey={`${g.name} RTT`} stroke={COLORS[i % COLORS.length]!} name={`${g.name} RTT`} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {grouped.map((g, i) => (
            <div key={g.name}>
              <p className="text-xs text-muted-foreground mb-1">{g.name}</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={g.data} margin={{ top: 25, right: 20, left: 20, bottom: 40 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: tc.text }} label={{ value: "Time", position: "insideBottom", offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
                  <YAxis tick={{ fontSize: 10, fill: tc.text }} unit=" ms" label={{ value: "RTT (ms)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
                  <Tooltip content={tooltipContent} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="rtt_ms" stroke={COLORS[i % COLORS.length]!} name="RTT (ms)" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="one_way" stroke="#8B5CF6" name="One-way (ms)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
