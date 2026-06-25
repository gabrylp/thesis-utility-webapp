import { useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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

export function SignalChart({ readings, theme, title, layout = "separate", runs }: Props) {
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

  const groups = useMemo(() => {
    const byRun = new Map<string, CommReading[]>();
    for (const r of readings) {
      const arr = byRun.get(r.run_id) || [];
      arr.push(r);
      byRun.set(r.run_id, arr);
    }
    return Array.from(byRun.entries()).map(([runId, rs]) => ({
      name: runMap.get(runId) || `Run ${runId.slice(0, 6)}...`,
      data: rs.map((r) => ({ distance: r.distance_m, rssi: r.rssi, snr: r.snr, time: formatDateTime(r.timestamp) })),
    }));
  }, [readings, runMap]);

  const allData = useMemo(() =>
    readings.map((r) => ({ distance: r.distance_m, rssi: r.rssi, snr: r.snr, time: formatDateTime(r.timestamp) })),
  [readings]);

  const tooltipContent = (props: any) => {
    if (!props.active || !props.payload?.length) return null;
    const time = props.payload[0]?.payload?.time;
    const dist = props.payload[0]?.payload?.distance;
    return (
      <div style={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
        {time && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 2 }}>{time}</p>}
        {dist != null && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>{dist} m</p>}
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

  const renderScatter = (data: any[], color: string, name: string, dataKey: string, height = 280) => (
    <ResponsiveContainer width="100%" height={height + 20}>
      <ScatterChart margin={{ top: 25, right: 20, left: 10, bottom: 15 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
        <XAxis dataKey="distance" tick={{ fontSize: 10, fill: tc.text }} unit=" m" name="Distance" />
        <YAxis dataKey={dataKey} tick={{ fontSize: 10, fill: tc.text }} name={dataKey.toUpperCase()} />
        <Tooltip content={tooltipContent} />
        {name && <Legend wrapperStyle={{ fontSize: 11 }} />}
        <Scatter data={data} fill={color} name={name} />
      </ScatterChart>
    </ResponsiveContainer>
  );

  return (
    <div className="pt-7">
      {title && <h4 className="text-sm font-medium mb-3 text-center">{title}</h4>}

      {layout === "connected" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">RSSI vs Distance</p>
            {renderScatter(allData, "#A855F7", "RSSI", "rssi", 280)}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">SNR vs Distance</p>
            {renderScatter(allData, "#10B981", "SNR", "snr", 280)}
          </div>
        </div>
      ) : layout === "layered" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">RSSI vs Distance</p>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 25, right: 20, left: 10, bottom: 15 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="distance" tick={{ fontSize: 10, fill: tc.text }} unit=" m" name="Distance" />
                <YAxis dataKey="rssi" tick={{ fontSize: 10, fill: tc.text }} name="RSSI" />
                <Tooltip content={tooltipContent} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {groups.map((g, i) => (
                  <Scatter key={g.name} data={g.data} fill={COLORS[i % COLORS.length]!} name={g.name} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">SNR vs Distance</p>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 25, right: 20, left: 10, bottom: 15 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="distance" tick={{ fontSize: 10, fill: tc.text }} unit=" m" name="Distance" />
                <YAxis dataKey="snr" tick={{ fontSize: 10, fill: tc.text }} name="SNR" />
                <Tooltip content={tooltipContent} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {groups.map((g, i) => (
                  <Scatter key={g.name} data={g.data} fill={COLORS[i % COLORS.length]!} name={g.name} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g, i) => (
            <div key={g.name}>
              <p className="text-xs text-muted-foreground mb-1">{g.name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">RSSI vs Distance</p>
                  {renderScatter(g.data, COLORS[i % COLORS.length]!, "", "rssi", 220)}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">SNR vs Distance</p>
                  {renderScatter(g.data, COLORS[i % COLORS.length]!, "", "snr", 220)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
