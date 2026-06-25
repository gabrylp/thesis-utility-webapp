import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { CommReading, TestRun } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

interface Props {
  readings: CommReading[];
  theme: "dark" | "light";
  title?: string;
  layout?: "connected" | "layered" | "separate";
  runs?: TestRun[];
}

const COLORS = ["#3B82F6", "#A855F7", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316"];

export function PacketLossChart({ readings, theme, title, layout = "separate", runs }: Props) {
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
    readings.map((r) => ({
      label: formatDateTime(r.timestamp),
      loss: r.packet_loss_pct,
      distance: r.distance_m,
    })),
  [readings]);

  const groups = useMemo(() => {
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
        loss: r.packet_loss_pct,
        distance: r.distance_m,
      })),
    }));
  }, [readings, runMap]);

  const mergedData = useMemo(() => {
    if (groups.length <= 1) return null;
    const xSet = new Set<string>();
    for (const g of groups) for (const d of g.data) xSet.add(d.label);
    const allX = [...xSet];
    return allX.map((x) => {
      const row: Record<string, any> = { label: x };
      for (const g of groups) {
        const match = g.data.find((d) => d.label === x);
        if (match) row[g.name] = match.loss;
      }
      return row;
    });
  }, [groups]);

  const tooltipContent = (props: any) => {
    if (!props.active || !props.payload?.length) return null;
    const label = props.payload[0]?.payload?.label;
    return (
      <div style={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
        {label && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>{label}</p>}
        {props.payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color || "#F8FAFC", fontWeight: 600, fontSize: 13, margin: "2px 0" }}>
            {p.name}: {Number(p.value).toFixed(2)}%
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
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { label: "Avg Packet Loss", value: (readings.reduce((s, r) => s + r.packet_loss_pct, 0) / readings.length).toFixed(1) + "%", color: "text-red-400" },
          { label: "Min Loss", value: Math.min(...readings.map((r) => r.packet_loss_pct)).toFixed(1) + "%", color: "text-green-400" },
          { label: "Max Loss", value: Math.max(...readings.map((r) => r.packet_loss_pct)).toFixed(1) + "%", color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border border-border p-2 text-center">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className={`text-sm font-mono font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {layout !== "separate" && title && <div className="text-center text-sm font-medium mb-2" style={{ color: tc.text }}>{title}</div>}

      {layout === "connected" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.text }}>{title}</div>}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={connectedData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: tc.text }} label={{ value: "Time", position: "insideBottom", offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 10, fill: tc.text }} unit=" %" domain={[0, 100]} label={{ value: "Packet Loss (%)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <Bar dataKey="loss" fill="#EF4444" radius={[4, 4, 0, 0]} name="Packet Loss %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : layout === "layered" && mergedData ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.text }}>{title}</div>}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mergedData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: tc.text }} label={{ value: "Time", position: "insideBottom", offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 10, fill: tc.text }} unit=" %" domain={[0, 100]} label={{ value: "Packet Loss (%)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {groups.map((g, i) => (
                <Bar key={g.name} dataKey={g.name} fill={COLORS[i % COLORS.length]!} radius={[4, 4, 0, 0]} name={g.name} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : layout === "layered" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.text }}>{title}</div>}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={connectedData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: tc.text }} label={{ value: "Time", position: "insideBottom", offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 10, fill: tc.text }} unit=" %" domain={[0, 100]} label={{ value: "Packet Loss (%)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <Bar dataKey="loss" fill="#EF4444" radius={[4, 4, 0, 0]} name="Packet Loss %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g, i) => (
            <div key={g.name}>
              <p className="text-xs text-muted-foreground mb-1">{g.name}</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={g.data} margin={{ top: 25, right: 20, left: 20, bottom: 20 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: tc.text }} label={{ value: "Time", position: "insideBottom", offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
                  <YAxis tick={{ fontSize: 10, fill: tc.text }} unit=" %" domain={[0, 100]} label={{ value: "Packet Loss (%)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.text, fontSize: 11 } }} />
                  <Tooltip content={tooltipContent} />
                  <Bar dataKey="loss" fill={COLORS[i % COLORS.length]!} radius={[4, 4, 0, 0]} name="Packet Loss %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
