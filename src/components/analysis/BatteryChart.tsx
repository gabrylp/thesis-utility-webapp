import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { PowerReading, TestRun } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

interface Props {
  readings: PowerReading[];
  title?: string;
  theme?: "dark" | "light";
  layout?: "connected" | "layered" | "separate";
  runs?: TestRun[];
}

const COLORS = ["#3B82F6", "#A855F7", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316"];

export function BatteryChart({ readings, title, theme = "dark", layout = "separate", runs }: Props) {
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
    const byRun = new Map<string, PowerReading[]>();
    for (const r of readings) {
      const arr = byRun.get(r.run_id) || [];
      arr.push(r);
      byRun.set(r.run_id, arr);
    }
    return Array.from(byRun.entries()).map(([runId, rs]) => ({
      name: runMap.get(runId) || `Run ${runId.slice(0, 6)}...`,
      data: [...rs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((r, idx) => ({ _test_num: idx + 1, voltage: r.voltage, amperage: r.amperage, time: formatDateTime(r.timestamp) })),
    }));
  }, [readings, runMap]);

  const connectedData = useMemo(() =>
    [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((r, idx) => ({ _test_num: idx + 1, voltage: r.voltage, amperage: r.amperage, time: formatDateTime(r.timestamp) })),
  [readings]);

  const mergedData = useMemo(() => {
    if (groups.length <= 1) return null;
    const xSet = new Set<number>();
    for (const g of groups) for (const d of g.data) xSet.add(d._test_num);
    const allX = [...xSet].sort((a, b) => a - b);
    return allX.map((x) => {
      const row: Record<string, any> = { _test_num: x };
      for (const g of groups) {
        const match = g.data.find((d) => d._test_num === x);
        if (match) {
          row[`${g.name} V`] = match.voltage;
          row[`${g.name} A`] = match.amperage;
          if (!row.time) row.time = match.time;
        }
      }
      return row;
    });
  }, [groups]);

  const tooltipContent = (props: any) => {
    if (!props.active || !props.payload?.length) return null;
    const time = props.payload[0]?.payload?.time;
    return (
      <div style={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
        {time && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>{time}</p>}
        {props.payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color || "#F8FAFC", fontWeight: 600, fontSize: 13, margin: "2px 0" }}>
            {p.name}: {Number(p.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  };

  const avgV = readings.length > 0 ? readings.reduce((s, r) => s + r.voltage, 0) / readings.length : 0;
  const avgA = readings.length > 0 ? readings.reduce((s, r) => s + r.amperage, 0) / readings.length : 0;
  const allPower = readings.map((r) => r.voltage * r.amperage);
  const avgP = allPower.length > 0 ? allPower.reduce((s, v) => s + v, 0) / allPower.length : 0;

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No power readings to display.
      </div>
    );
  }

  const statCards = (
    <div className="grid grid-cols-3 gap-3 mb-3">
      {[
        { label: "Avg Voltage", value: avgV.toFixed(2) + " V", color: "text-blue-400" },
        { label: "Avg Current", value: avgA.toFixed(3) + " A", color: "text-purple-400" },
        { label: "Avg Power", value: avgP.toFixed(2) + " W", color: "text-yellow-400" },
      ].map(({ label, value, color }) => (
        <div key={label} className="rounded-lg border border-border p-2 text-center">
          <p className="text-[11px] text-muted-foreground">{label}</p>
          <p className={`text-sm font-mono font-semibold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pt-7">
      {statCards}

      {layout === "connected" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.label }}>{title}</div>}
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={connectedData} margin={{ top: 15, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="_test_num" tick={{ fontSize: 10, fill: tc.tick }} name="Test #" label={{ value: "Test #", position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis yAxisId="v" tick={{ fontSize: 11, fill: tc.tick }} unit=" V" domain={["auto", "auto"]} label={{ value: "Voltage (V)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis yAxisId="a" orientation="right" tick={{ fontSize: 11, fill: tc.tick }} unit=" A" domain={["auto", "auto"]} label={{ value: "Current (A)", position: "insideRight", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <Legend />
              <Line yAxisId="v" type="monotone" dataKey="voltage" stroke="#3B82F6" name="Voltage (V)" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="a" type="monotone" dataKey="amperage" stroke="#A855F7" name="Current (A)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : layout === "layered" && mergedData ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.label }}>{title}</div>}
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={mergedData} margin={{ top: 15, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="_test_num" tick={{ fontSize: 10, fill: tc.tick }} name="Test #" label={{ value: "Test #", position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis yAxisId="v" tick={{ fontSize: 11, fill: tc.tick }} unit=" V" domain={["auto", "auto"]} label={{ value: "Voltage (V)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis yAxisId="a" orientation="right" tick={{ fontSize: 11, fill: tc.tick }} unit=" A" domain={["auto", "auto"]} label={{ value: "Current (A)", position: "insideRight", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {groups.flatMap((g, i) => [
                <Line key={`${g.name} V`} yAxisId="v" type="monotone" dataKey={`${g.name} V`} stroke={COLORS[i % COLORS.length]!} name={`${g.name} V`} strokeWidth={2} dot={{ r: 3 }} />,
                <Line key={`${g.name} A`} yAxisId="a" type="monotone" dataKey={`${g.name} A`} stroke={COLORS[i % COLORS.length]!} name={`${g.name} A`} strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 2" />,
              ])}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : layout === "layered" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.label }}>{title}</div>}
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={connectedData} margin={{ top: 15, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="_test_num" tick={{ fontSize: 10, fill: tc.tick }} name="Test #" label={{ value: "Test #", position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis yAxisId="v" tick={{ fontSize: 11, fill: tc.tick }} unit=" V" domain={["auto", "auto"]} label={{ value: "Voltage (V)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis yAxisId="a" orientation="right" tick={{ fontSize: 11, fill: tc.tick }} unit=" A" domain={["auto", "auto"]} label={{ value: "Current (A)", position: "insideRight", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <Legend />
              <Line yAxisId="v" type="monotone" dataKey="voltage" stroke="#3B82F6" name="Voltage (V)" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="a" type="monotone" dataKey="amperage" stroke="#A855F7" name="Current (A)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g, i) => (
            <div key={g.name}>
              <p className="text-xs text-muted-foreground mb-1">{g.name}</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={g.data} margin={{ top: 25, right: 20, left: 20, bottom: 40 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="_test_num" tick={{ fontSize: 10, fill: tc.tick }} name="Test #" label={{ value: "Test #", position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                  <YAxis yAxisId="v" tick={{ fontSize: 10, fill: tc.tick }} unit=" V" domain={["auto", "auto"]} label={{ value: "Voltage (V)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                  <YAxis yAxisId="a" orientation="right" tick={{ fontSize: 10, fill: tc.tick }} unit=" A" domain={["auto", "auto"]} label={{ value: "Current (A)", position: "insideRight", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                  <Tooltip content={tooltipContent} />
                  <Line yAxisId="v" type="monotone" dataKey="voltage" stroke="#3B82F6" name="Voltage (V)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="a" type="monotone" dataKey="amperage" stroke="#A855F7" name="Current (A)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
