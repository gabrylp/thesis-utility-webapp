import { useMemo } from "react";
import { formatDateTime } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import type { FlowReading, TestRun } from "@/lib/db";
interface Props {
  readings: FlowReading[];
  title?: string;
  theme?: "dark" | "light";
  layout?: "connected" | "layered" | "separate";
  runs?: TestRun[];
  pumpCount?: number;
}

const COLORS = ["#22C55E", "#3B82F6", "#A855F7", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316"];

export function VolumeChart({ readings, title, theme = "dark", layout = "separate", runs, pumpCount = 1 }: Props) {
  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "hsl(217 33% 20%)" : "#E2E8F0",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
    tick: isDark ? "#94A3B8" : "#64748B",
    label: isDark ? "#F8FAFC" : "#334155",
  };

  const runMap = useMemo(() => {
    const m = new Map<string, string>();
    if (runs) for (const r of runs) m.set(r.id, r.title);
    return m;
  }, [runs]);

  const groups = useMemo(() => {
    const byRun = new Map<string, FlowReading[]>();
    for (const r of readings) {
      const arr = byRun.get(r.run_id) || [];
      arr.push(r);
      byRun.set(r.run_id, arr);
    }
    return Array.from(byRun.entries()).map(([runId, rs]) => ({
      name: runMap.get(runId) || `Run ${runId.slice(0, 6)}...`,
      data: [...rs].sort((a, b) => a.time_sec - b.time_sec),
    }));
  }, [readings, runMap]);

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No volume data to display.
      </div>
    );
  }

  function accumulate(rs: FlowReading[]) {
    let cumTimeSec = 0, cumVolumeMl = 0;
    const sorted = [...rs].sort((a, b) => a.time_sec - b.time_sec);
    return sorted.map((r) => {
      cumTimeSec += r.time_sec;
      cumVolumeMl += r.volume_ml * pumpCount;
      return {
        elapsedMin: Math.round((cumTimeSec / 60) * 10) / 10,
        volume: Math.round((cumVolumeMl / 1000) * 10) / 10,
        time: formatDateTime(r.timestamp),
      };
    });
  }

  const connectedData = accumulate(readings);
  const totalVolume = connectedData[connectedData.length - 1]?.volume || 0;
  const lastElapsedMin = connectedData[connectedData.length - 1]?.elapsedMin || 1;
  const projectedHour = totalVolume / (lastElapsedMin / 60);

  const layeredData = useMemo(() => {
    if (groups.length === 0) return [];
    const accumulated = groups.map(g => ({ name: g.name, data: accumulate(g.data) }));
    const allKeys = new Set<number>();
    for (const g of accumulated) for (const d of g.data) allKeys.add(d.elapsedMin);
    return [...allKeys].sort((a, b) => a - b).map(key => {
      const row: Record<string, any> = { elapsedMin: key };
      for (const g of accumulated) {
        const match = g.data.find(d => d.elapsedMin === key);
        if (match) {
          row[g.name] = match.volume;
          if (!row.time) row.time = match.time;
        }
      }
      return row;
    });
  }, [groups]);

  const tooltipContent = (props: any) => {
    if (!props.active || !props.payload?.length) return null;
    const time = props.payload[0]?.payload?.time;
    const elapsed = props.payload[0]?.payload?.elapsedMin;
    return (
      <div style={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
        {time && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 2 }}>{time}</p>}
        {elapsed != null && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>{elapsed.toFixed(1)} min</p>}
        {props.payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color || "#F8FAFC", fontWeight: 600, fontSize: 13, margin: "2px 0" }}>
            {p.name}: {Number(p.value).toFixed(2)} L
          </p>
        ))}
      </div>
    );
  };

  const statCards = (
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div className="rounded-lg border border-border p-3 text-center">
        <p className="text-[11px] text-muted-foreground">{pumpCount > 1 ? `Est. Combined Volume (${pumpCount} pumps)` : "Est. Total Volume"}</p>
        <p className="text-lg font-bold text-green-400">{totalVolume.toFixed(1)} L</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">sum of volume_ml → L</p>
      </div>
      <div className="rounded-lg border border-border p-3 text-center">
        <p className="text-[11px] text-muted-foreground">{pumpCount > 1 ? `Proj. 1h (${pumpCount} pumps)` : "Projected to 1h"}</p>
        <p className="text-lg font-bold text-yellow-400">{projectedHour.toFixed(1)} L</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">total L ÷ total h (time-weighted avg)</p>
      </div>
    </div>
  );

  return (
    <div className="pt-7">
      {statCards}

      {layout === "connected" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.label }}>{title}</div>}
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={connectedData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="elapsedMin" tick={{ fontSize: 10, fill: tc.tick }} unit=" min" label={{ value: "Time (min)", position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 11, fill: tc.tick }} unit=" L" label={{ value: pumpCount > 1 ? "Combined Volume (L)" : "Volume (L)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <ReferenceLine y={1000} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: "1000 L Target", fill: "#F59E0B", fontSize: 11 }} />
              <Area type="monotone" dataKey="volume" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} strokeWidth={2} name="Volume" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : layout === "layered" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.label }}>{title}</div>}
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={layeredData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="elapsedMin" tick={{ fontSize: 10, fill: tc.tick }} unit=" min" type="number" domain={["auto", "auto"]} label={{ value: "Time (min)", position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 11, fill: tc.tick }} unit=" L" label={{ value: pumpCount > 1 ? "Combined Volume (L)" : "Volume (L)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <Legend />
              <ReferenceLine y={1000} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: "1000 L Target", fill: "#F59E0B", fontSize: 11 }} />
              {groups.map((g, i) => (
                <Area key={g.name} type="monotone" dataKey={g.name} stroke={COLORS[i % COLORS.length]!} fill={COLORS[i % COLORS.length]!} fillOpacity={0.1} strokeWidth={2} name={g.name} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g, i) => {
            const gData = accumulate(g.data);
            return (
              <div key={g.name}>
                <p className="text-xs text-muted-foreground mb-1">{g.name}</p>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={gData} margin={{ top: 25, right: 20, left: 20, bottom: 40 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis dataKey="elapsedMin" tick={{ fontSize: 10, fill: tc.tick }} unit=" min" label={{ value: "Time (min)", position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                    <YAxis tick={{ fontSize: 10, fill: tc.tick }} unit=" L" label={{ value: pumpCount > 1 ? "Combined Volume (L)" : "Volume (L)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                    <Tooltip content={tooltipContent} />
                    <Area type="monotone" dataKey="volume" stroke={COLORS[i % COLORS.length]!} fill={COLORS[i % COLORS.length]!} fillOpacity={0.15} strokeWidth={2} name="Volume" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground mt-3 text-center">
        Volume = running sum of volume_ml per reading → L (time-weighted). Proj. 1h = total L ÷ total h.
        Differs from simple avg of flow_rate_lh used in Projection tab.
      </p>
    </div>
  );
}
