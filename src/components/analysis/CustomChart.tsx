import { useState, useMemo } from "react";
import {
  LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Layers, Columns3 } from "lucide-react";
import type { FlowReading, PowerReading, TestRun } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataRow = Record<string, any>;

interface Props {
  flowReadings: FlowReading[];
  powerReadings: PowerReading[];
  runs?: TestRun[];
  title?: string;
  theme?: "dark" | "light";
}

const COLORS = ["#3B82F6", "#A855F7", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316"];

const NUMERIC_COLUMNS = [
  { key: "time_sec", label: "Time (s)", src: "flow" as const },
  { key: "volume_ml", label: "Volume (mL)", src: "flow" as const },
  { key: "pulses", label: "Pulses", src: "flow" as const },
  { key: "flow_rate_lh", label: "Flow Rate (L/h)", src: "flow" as const },
  { key: "voltage", label: "Voltage (V)", src: "power" as const },
  { key: "amperage", label: "Current (A)", src: "power" as const },
];

export function CustomChart({ flowReadings, powerReadings, runs, title, theme = "dark" }: Props) {
  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "hsl(217 33% 20%)" : "#E2E8F0",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
    tick: isDark ? "#94A3B8" : "#64748B",
    label: isDark ? "#F8FAFC" : "#334155",
  };
  const [xCol, setXCol] = useState("volume_ml");
  const [yCol, setYCol] = useState("flow_rate_lh");
  const [chartType, setChartType] = useState<"line" | "scatter">("scatter");
  const [layout, setLayout] = useState<"layered" | "side">("layered");
  const [splitBy, setSplitBy] = useState<"none" | "method" | "run">("run");
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([]);

  const runTitles = useMemo(() => {
    const m = new Map<string, string>();
    if (runs) for (const r of runs) m.set(r.id, r.title);
    return m;
  }, [runs]);

  const flowColumns = NUMERIC_COLUMNS.filter((c) => c.src === "flow");
  const powerColumns = NUMERIC_COLUMNS.filter((c) => c.src === "power");
  const allColumns = NUMERIC_COLUMNS;

  const xMeta = allColumns.find((c) => c.key === xCol);
  const yMeta = allColumns.find((c) => c.key === yCol);

  const xKey = xCol as keyof DataRow;
  const yKey = yCol as keyof DataRow;

  const { allData, groups } = useMemo(() => {
    const flowRows: DataRow[] = flowReadings.map((r) => ({
      id: r.id, run_id: r.run_id, timestamp: r.timestamp, method: r.method, notes: r.notes, synced_at: r.synced_at,
      time_sec: r.time_sec,
      volume_ml: r.volume_ml,
      pulses: r.pulses,
      flow_rate_lh: r.flow_rate_lh,
      _method: r.method,
      _run_id: r.run_id,
      _timestamp: formatDateTime(r.timestamp),
    }));

    const powerRows: DataRow[] = powerReadings.map((r) => ({
      id: r.id, run_id: r.run_id, timestamp: r.timestamp, voltage: r.voltage, amperage: r.amperage, synced_at: r.synced_at,
      time_sec: 0,
      volume_ml: 0,
      pulses: 0,
      flow_rate_lh: 0,
      _method: "power",
      _run_id: r.run_id,
      _timestamp: formatDateTime(r.timestamp),
    }));

    const all = [...flowRows, ...powerRows].filter((r) => {
      const xv = r[xKey];
      const yv = r[yKey];
      return typeof xv === "number" && typeof yv === "number" && !isNaN(xv) && !isNaN(yv);
    }).sort((a, b) => (a[xKey] ?? 0) - (b[xKey] ?? 0));

    if (splitBy === "none") return { allData: all, groups: [{ name: "Data", data: all }] };

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
        : rawKey;
      return { name, data };
    });
    return { allData: all, groups };
  }, [flowReadings, powerReadings, xCol, yCol, splitBy]);

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
    <div className="space-y-4">
      {title && <h4 className="text-sm font-medium">{title}</h4>}

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
            { value: "method", label: "Method (sensor/no sensor)" },
            { value: "run", label: "Run (by title)" },
          ]} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Layout:</span>
        <div className="flex rounded-md border border-input overflow-hidden">
          <button
            onClick={() => setLayout("layered")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs transition-colors ${layout === "layered" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Layers className="h-3.5 w-3.5" /> Layered
          </button>
          <button
            onClick={() => setLayout("side")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs transition-colors ${layout === "side" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Columns3 className="h-3.5 w-3.5" /> Side by Side
          </button>
        </div>
      </div>

      {layout === "layered" ? (
        <ResponsiveContainer width="100%" height={350}>
          {chartType === "scatter" ? (
            <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey={xCol} tick={{ fontSize: 10, fill: tc.tick }} name={xMeta?.label} unit={xCol === "time_sec" ? " s" : xCol === "volume_ml" ? " mL" : xCol === "flow_rate_lh" ? " L/h" : ""} />
              <YAxis tick={{ fontSize: 10, fill: tc.tick }} name={yMeta?.label} unit={yCol === "flow_rate_lh" ? " L/h" : yCol === "voltage" ? " V" : yCol === "amperage" ? " A" : ""} />
              <Tooltip contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }} />
              <Legend />
              {groups.map((g, i) => (
                <Scatter key={g.name} data={g.data} fill={COLORS[i % COLORS.length]!} name={g.name} />
              ))}
            </ScatterChart>
          ) : (
            <LineChart data={allData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey={xCol} tick={{ fontSize: 10, fill: tc.tick }} name={xMeta?.label} />
              <YAxis tick={{ fontSize: 10, fill: tc.tick }} name={yMeta?.label} />
              <Tooltip contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }} />
              <Legend />
              {groups.map((g, i) => (
                <Line key={g.name} type="monotone" dataKey={yKey as string} data={g.data} stroke={COLORS[i % COLORS.length]!} strokeWidth={2} dot={{ r: 3 }} name={g.name} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g, i) => (
            <div key={g.name}>
              <p className="text-xs text-muted-foreground mb-1">{g.name}</p>
              <ResponsiveContainer width="100%" height={260}>
                {chartType === "scatter" ? (
                  <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis dataKey={xCol} tick={{ fontSize: 10, fill: tc.tick }} />
                    <YAxis tick={{ fontSize: 10, fill: tc.tick }} />
                    <Tooltip contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }} />
                    <Scatter data={g.data} fill={COLORS[i % COLORS.length]!} name={g.name} />
                  </ScatterChart>
                ) : (
                  <LineChart data={g.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis dataKey={xCol} tick={{ fontSize: 10, fill: tc.tick }} />
                    <YAxis tick={{ fontSize: 10, fill: tc.tick }} />
                    <Tooltip contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }} />
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
