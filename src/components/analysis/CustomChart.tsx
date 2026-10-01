import { useState, useMemo } from "react";
import {
  LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { flowMethodLabel, type FlowReading, type PowerReading, type TestRun } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

type DataRow = Record<string, any>;

interface Props {
  flowReadings: FlowReading[];
  powerReadings: PowerReading[];
  runs?: TestRun[];
  title?: string;
  theme?: "dark" | "light";
  layout?: "connected" | "layered" | "separate";
}

const COLORS = ["#3B82F6", "#A855F7", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316"];

const NUMERIC_COLUMNS = [
  { key: "_test_num", label: "Test #", src: "both" as const },
  { key: "time_sec", label: "Time (s)", src: "flow" as const },
  { key: "volume_ml", label: "Volume (mL)", src: "flow" as const },
  { key: "pulses", label: "Pulses", src: "flow" as const },
  { key: "flow_rate_lh", label: "Flow Rate (L/h)", src: "flow" as const },
  { key: "voltage", label: "Voltage (V)", src: "power" as const },
  { key: "amperage", label: "Current (A)", src: "power" as const },
];

export function CustomChart({ flowReadings, powerReadings, runs, title, theme = "dark", layout = "separate" }: Props) {
  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "hsl(217 33% 20%)" : "#E2E8F0",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
    tick: isDark ? "#94A3B8" : "#64748B",
    label: isDark ? "#F8FAFC" : "#334155",
  };
  const [xCol, setXCol] = useState("_test_num");
  const [yCol, setYCol] = useState("flow_rate_lh");
  const [chartType, setChartType] = useState<"line" | "scatter">("line");
  const [splitBy, setSplitBy] = useState<"none" | "method" | "run">("run");

  const runTitles = useMemo(() => {
    const m = new Map<string, string>();
    if (runs) for (const r of runs) m.set(r.id, r.title);
    return m;
  }, [runs]);

  const allColumns = NUMERIC_COLUMNS;

  const xMeta = allColumns.find((c) => c.key === xCol);
  const yMeta = allColumns.find((c) => c.key === yCol);

  const xKey = xCol as keyof DataRow;
  const yKey = yCol as keyof DataRow;

  const { allData, groups, mergedData } = useMemo(() => {
    const xSrc = allColumns.find((c) => c.key === xCol)?.src || "flow";
    const ySrc = allColumns.find((c) => c.key === yCol)?.src || "flow";

    const flowByRun = new Map<string, FlowReading[]>();
    for (const r of flowReadings) {
      const arr = flowByRun.get(r.run_id) || [];
      arr.push(r);
      flowByRun.set(r.run_id, arr);
    }
    const flowRows: DataRow[] = [];
    for (const [, readings] of flowByRun) {
      readings.forEach((r, idx) => {
        flowRows.push({
          id: r.id, run_id: r.run_id, timestamp: r.timestamp, method: r.method, notes: r.notes, synced_at: r.synced_at,
          time_sec: r.time_sec,
          volume_ml: r.volume_ml,
          pulses: r.pulses,
          flow_rate_lh: r.flow_rate_lh,
          _test_num: idx + 1,
          _method: r.method,
          _run_id: r.run_id,
          _timestamp: formatDateTime(r.timestamp),
        });
      });
    }

    const powerByRun = new Map<string, PowerReading[]>();
    for (const r of powerReadings) {
      const arr = powerByRun.get(r.run_id) || [];
      arr.push(r);
      powerByRun.set(r.run_id, arr);
    }
    const powerRows: DataRow[] = [];
    for (const [, readings] of powerByRun) {
      readings.forEach((r, idx) => {
        powerRows.push({
          id: r.id, run_id: r.run_id, timestamp: r.timestamp, voltage: r.voltage, amperage: r.amperage, synced_at: r.synced_at,
          time_sec: 0,
          volume_ml: 0,
          pulses: 0,
          flow_rate_lh: 0,
          _test_num: idx + 1,
          _method: "power",
          _run_id: r.run_id,
          _timestamp: formatDateTime(r.timestamp),
        });
      });
    }

    const matchesSrc = (row: DataRow, src: string) =>
      src === "both" || (src === "flow" && row._method !== "power") || (src === "power" && row._method === "power");

    const all = [...flowRows, ...powerRows].filter((r) => {
      if (!matchesSrc(r, xSrc) || !matchesSrc(r, ySrc)) return false;
      const xv = r[xKey];
      const yv = r[yKey];
      return typeof xv === "number" && typeof yv === "number" && !isNaN(xv) && !isNaN(yv);
    }).sort((a, b) => (a[xKey] ?? 0) - (b[xKey] ?? 0));

    if (splitBy === "none" || layout === "connected") return { allData: all, groups: [{ name: "Data", data: all }] };

    const groupedMap = new Map<string, DataRow[]>();
    for (const row of all) {
      const rawKey = splitBy === "method" ? String(row._method || "unknown") : String(row._run_id || "unknown");
      const arr = groupedMap.get(rawKey) || [];
      arr.push(row);
      groupedMap.set(rawKey, arr);
    }
    const groups = Array.from(groupedMap.entries()).map(([rawKey, data]) => {
      const name = splitBy === "run"
        ? (runTitles.get(rawKey) || `Run ${rawKey.slice(0, 6)}...`)
        : flowMethodLabel(rawKey);
      return { name, data };
    });
    const mergedData = (() => {
      if (splitBy === "none" || groups.length <= 1) return null;
      const maxPerGroup = Math.max(...groups.map(g => g.data.length));
      return Array.from({ length: maxPerGroup }, (_, i) => {
        const row: Record<string, any> = { [xKey]: i + 1 };
        for (const g of groups) {
          const d = g.data[i];
          row[g.name] = d ? d[yKey] : undefined;
        }
        return row as DataRow;
      });
    })();

    return { allData: all, groups, mergedData };
  }, [flowReadings, powerReadings, xCol, yCol, splitBy, allColumns, xKey, yKey, layout]);

  const tooltipContent = (props: any) => {
    if (!props.active || !props.payload?.length) return null;
    const ts = props.payload[0]?.payload?._timestamp;
    return (
      <div style={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
        {ts && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>{ts}</p>}
        {props.payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color || "#F8FAFC", fontWeight: 600, fontSize: 13, margin: "2px 0" }}>
            {p.name}: {Number(p.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  };

  const chartTitleLabel = `${yMeta?.label || yCol} vs ${xMeta?.label || xCol}`;

  if (allData.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No data available for the selected columns. Try different X/Y selections.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = (data: DataRow[], colorIdx = 0) => {
    const color = COLORS[colorIdx % COLORS.length]!;
    if (chartType === "line") {
      return (
        <Line dataKey={yKey as string} data={data} type="monotone" stroke={color} strokeWidth={2} dot={{ r: 3 }} name={yMeta?.label || yCol} />
      );
    }

    return (
      <Scatter data={data} fill={color} name={yMeta?.label || yCol} />
    );
  };

  return (
    <div className="space-y-4 pt-7">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">X Axis</label>
          <Select value={xCol} onChange={(e) => setXCol(e.target.value)} options={allColumns.map((c) => ({ value: c.key, label: c.label }))} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Y Axis</label>
          <Select value={yCol} onChange={(e) => setYCol(e.target.value)} options={allColumns.map((c) => ({ value: c.key, label: c.label }))} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Chart Type</label>
          <Select value={chartType} onChange={(e) => setChartType(e.target.value as any)} options={[
            { value: "scatter", label: "Scatter" },
            { value: "line", label: "Line" },
          ]} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Split By</label>
          <Select value={splitBy} onChange={(e) => setSplitBy(e.target.value as any)} options={[
            { value: "none", label: "None" },
            { value: "method", label: "Flowrate Basis (Pulse-based / Actual)" },
            { value: "run", label: "Run (by title)" },
          ]} />
        </div>
      </div>

      {layout === "layered" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          <div className="text-center text-sm font-medium py-2" style={{ color: tc.label }}>{chartTitleLabel}</div>
          <ResponsiveContainer width="100%" height={370}>
            {chartType === "scatter" ? (
              <ScatterChart margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey={xCol} tick={{ fontSize: 10, fill: tc.tick }} name={xMeta?.label} unit={xCol === "time_sec" ? " s" : xCol === "volume_ml" ? " mL" : xCol === "flow_rate_lh" ? " L/h" : ""} />
                <YAxis tick={{ fontSize: 10, fill: tc.tick }} name={yMeta?.label} unit={yCol === "flow_rate_lh" ? " L/h" : yCol === "voltage" ? " V" : yCol === "amperage" ? " A" : ""} />
                <Tooltip content={tooltipContent} />
                <Legend />
                {groups.map((g, i) => (
                  <Scatter key={g.name} data={g.data} fill={COLORS[i % COLORS.length]!} name={g.name} />
                ))}
              </ScatterChart>
            ) : mergedData ? (
              <LineChart data={mergedData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey={xCol} tick={{ fontSize: 10, fill: tc.tick }} name={xMeta?.label} label={{ value: xMeta?.label || xCol, position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                <YAxis tick={{ fontSize: 10, fill: tc.tick }} name={yMeta?.label} label={{ value: yMeta?.label || yCol, position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                <Tooltip content={tooltipContent} />
                <Legend />
                {groups.map((g, i) => (
                  <Line key={g.name} type="monotone" dataKey={g.name} stroke={COLORS[i % COLORS.length]!} strokeWidth={2} dot={{ r: 3 }} name={g.name} />
                ))}
              </LineChart>
            ) : (
              <LineChart data={allData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey={xCol} tick={{ fontSize: 10, fill: tc.tick }} name={xMeta?.label} label={{ value: xMeta?.label || xCol, position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                <YAxis tick={{ fontSize: 10, fill: tc.tick }} name={yMeta?.label} label={{ value: yMeta?.label || yCol, position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                <Tooltip content={tooltipContent} />
                <Legend />
                {groups.map((g, i) => (
                  <Line key={g.name} type="monotone" dataKey={yKey as string} stroke={COLORS[i % COLORS.length]!} strokeWidth={2} dot={{ r: 3 }} name={g.name} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g, i) => (
            <div key={g.name}>
              <p className="text-xs text-muted-foreground mb-1">{g.name}</p>
              <ResponsiveContainer width="100%" height={280}>
                {chartType === "scatter" ? (
                  <ScatterChart margin={{ top: 25, right: 20, left: 20, bottom: 20 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis dataKey={xCol} tick={{ fontSize: 10, fill: tc.tick }} name={xMeta?.label || xCol} />
                    <YAxis tick={{ fontSize: 10, fill: tc.tick }} name={yMeta?.label || yCol} />
                    <Tooltip content={tooltipContent} />
                    <Scatter data={g.data} fill={COLORS[i % COLORS.length]!} name={g.name} />
                  </ScatterChart>
                ) : (
                  <LineChart data={g.data} margin={{ top: 25, right: 20, left: 20, bottom: 20 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis dataKey={xCol} tick={{ fontSize: 10, fill: tc.tick }} label={{ value: xMeta?.label || xCol, position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                    <YAxis tick={{ fontSize: 10, fill: tc.tick }} label={{ value: yMeta?.label || yCol, position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                    <Tooltip content={tooltipContent} />
                    <Line type="monotone" dataKey={yKey as string} stroke={COLORS[i % COLORS.length]!} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
