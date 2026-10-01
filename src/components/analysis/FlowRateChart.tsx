import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import type { FlowReading, TestRun } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { computeElapsedMin, linearExtrapolate, computeFlowRate } from "@/lib/stats";

interface Props {
  readings: FlowReading[];
  title?: string;
  theme?: "dark" | "light";
  layout?: "connected" | "layered" | "separate";
  runs?: TestRun[];
  pumpCount?: number;
  kFactor?: number;
}

const COLORS = ["#22C55E", "#3B82F6", "#A855F7", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316"];

export function FlowRateChart({ readings, title, theme = "dark", layout = "separate", runs, pumpCount = 1, kFactor = 440 }: Props) {
  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "hsl(217 33% 20%)" : "#E2E8F0",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
    tick: isDark ? "#94A3B8" : "#64748B",
    label: isDark ? "#F8FAFC" : "#334155",
  };

  const [xMode, setXMode] = useState<"test" | "elapsed">("elapsed");
  const [extrapolate, setExtrapolate] = useState(false);
  const [basis, setBasis] = useState<"pulse" | "actual">("actual");
  const [legendOpen, setLegendOpen] = useState(false);

  const xKey = xMode === "elapsed" ? "_elapsed_min" : "_test_num";
  const xLabel = xMode === "elapsed" ? "Time (min)" : "Test #";
  const lineName = basis === "pulse" ? "Pulse Flow" : "Flow Rate";

  const runMap = useMemo(() => {
    const m = new Map<string, string>();
    if (runs) for (const r of runs) m.set(r.id, r.title);
    return m;
  }, [runs]);

  const sortedByRun = useMemo(() => {
    const byRun = new Map<string, FlowReading[]>();
    for (const r of readings) {
      const arr = byRun.get(r.run_id) || [];
      arr.push(r);
      byRun.set(r.run_id, arr);
    }
    return Array.from(byRun.entries()).map(([runId, rs]) => {
      const sorted = [...rs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const elapsed = computeElapsedMin(sorted);
      return {
        runId,
        name: runMap.get(runId) || `Run ${runId.slice(0, 6)}...`,
        readings: sorted,
        data: sorted.map((r, idx) => {
          const flow = computeFlowRate(basis === "pulse" ? "with_sensor" : "without_sensor", r.time_sec, r.volume_ml, r.pulses, kFactor);
          return {
            _test_num: idx + 1,
            _elapsed_min: elapsed[idx]!.elapsedMin,
            flow_rate_lh: flow > 0 ? flow * pumpCount : null,
            method: r.method,
            time: formatDateTime(r.timestamp),
          };
        }),
      };
    });
  }, [readings, runMap, basis, kFactor]);

  const groups = useMemo(() =>
    sortedByRun.map((r) => ({ name: r.name, data: r.data })),
  [sortedByRun]);

  const connectedData = useMemo(() =>
    sortedByRun.flatMap((r) => r.data),
  [sortedByRun]);

  const mergedData = useMemo(() => {
    if (groups.length <= 1) return null;
    const xSet = new Set<number>();
    for (const g of groups) for (const d of g.data) xSet.add(d[xKey]);
    const allX = [...xSet].sort((a, b) => a - b);

    if (!extrapolate) {
      return allX.map((x) => {
        const row: Record<string, any> = { [xKey]: x };
        for (const g of groups) {
          const match = g.data.find((d) => d[xKey] === x);
          if (match) {
            row[g.name] = match.flow_rate_lh;
            if (!row.time) row.time = match.time;
          }
        }
        return row;
      });
    }

    const groupLookup = new Map(groups.map((g) => [g.name, g]));
    return allX.map((x) => {
      const row: Record<string, any> = { [xKey]: x };
      for (const g of groups) {
        const match = g.data.find((d) => d[xKey] === x);
        if (match) {
          row[g.name] = match.flow_rate_lh;
          row[`${g.name}_projected`] = null;
          if (!row.time) row.time = match.time;
        } else {
          const actual = groupLookup.get(g.name)?.data;
          if (actual && actual.length > 0) {
            const pts = actual.filter((d) => d.flow_rate_lh != null).map((d) => ({ x: d[xKey], y: d.flow_rate_lh as number }));
            const projVal = linearExtrapolate(pts, x);
            row[g.name] = null;
            row[`${g.name}_projected`] = projVal;
          }
        }
      }
      return row;
    });
  }, [groups, xKey, extrapolate]);

  const tooltipContent = (props: any) => {
    if (!props.active || !props.payload?.length) return null;
    const time = props.payload[0]?.payload?.time;
    return (
      <div style={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
        {time && <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>{time}</p>}
        {props.payload.map((p: any) => (
<p key={p.name} style={{ color: p.color || "#F8FAFC", fontWeight: 600, fontSize: 13, margin: "2px 0" }}>
              {p.name}: {p.value === null ? "—" : `${Number(p.value).toFixed(2)} L/h`}{p.name.includes("projected") ? " (projected)" : ""}{pumpCount > 1 ? " (combined)" : ""}
            </p>
        ))}
      </div>
    );
  };

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No flow readings to display.
      </div>
    );
  }

  const controls = (
    <div className="flex items-center justify-center gap-4 mb-3">
      <div className="flex rounded-md border border-input overflow-hidden">
        {(["test", "elapsed"] as const).map((mode) => (
          <button key={mode} onClick={() => setXMode(mode)}
            className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${xMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >{mode === "test" ? "Test #" : "Elapsed (min)"}</button>
        ))}
      </div>
      <div className="flex rounded-md border border-input overflow-hidden">
        {(["actual", "pulse"] as const).map((b) => (
          <button key={b} onClick={() => setBasis(b)}
            className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${basis === b ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >{b === "pulse" ? "Pulse-based" : "Actual"}</button>
        ))}
      </div>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
        <input type="checkbox" checked={extrapolate} onChange={(e) => setExtrapolate(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-input accent-primary" />
        Extrapolate
      </label>
    </div>
  );

  const sharedDims = { margin: { top: 5, right: 20, left: 20, bottom: 20 } };

  return (
    <div className="pt-7">
      {controls}

      {layout === "connected" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.label }}>{title}</div>}
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={connectedData} {...sharedDims}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: tc.tick }} name={xLabel} label={{ value: xLabel, position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 11, fill: tc.tick }} unit=" L/h" label={{ value: pumpCount > 1 ? "Combined Flow (L/h)" : "Flow Rate (L/h)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <ReferenceLine y={1000} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: "Target: 1000 L/h", fill: "#F59E0B", fontSize: 11 }} />
              <Line type="monotone" dataKey="flow_rate_lh" stroke="#22C55E" name={lineName} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : layout === "layered" && mergedData ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.label }}>{title}</div>}
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={mergedData} {...sharedDims}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: tc.tick }} name={xLabel} label={{ value: xLabel, position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 11, fill: tc.tick }} unit=" L/h" label={{ value: pumpCount > 1 ? "Combined Flow (L/h)" : "Flow Rate (L/h)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <ReferenceLine y={1000} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: "Target: 1000 L/h", fill: "#F59E0B", fontSize: 11 }} />
              {groups.map((g, i) => (
                <Line key={g.name} type="monotone" dataKey={g.name} stroke={COLORS[i % COLORS.length]!} name={g.name} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
              ))}
              {extrapolate && groups.map((g, i) => (
                <Line key={`${g.name}_proj`} type="monotone" dataKey={`${g.name}_projected`} stroke={COLORS[i % COLORS.length]!} name={`${g.name} (projected)`} strokeWidth={1.5} dot={{ r: 2, fillOpacity: 0.5 }} strokeDasharray="5 5" strokeOpacity={0.5} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : layout === "layered" ? (
        <div style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          {title && <div className="text-center text-sm font-medium py-2" style={{ color: tc.label }}>{title}</div>}
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={connectedData} {...sharedDims}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: tc.tick }} name={xLabel} label={{ value: xLabel, position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 11, fill: tc.tick }} unit=" L/h" label={{ value: pumpCount > 1 ? "Combined Flow (L/h)" : "Flow Rate (L/h)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
              <Tooltip content={tooltipContent} />
              <ReferenceLine y={1000} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: "Target: 1000 L/h", fill: "#F59E0B", fontSize: 11 }} />
              <Line type="monotone" dataKey="flow_rate_lh" stroke="#22C55E" name={lineName} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g, i) => (
            <div key={g.name}>
              <p className="text-xs text-muted-foreground mb-1">{g.name}</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={g.data} margin={{ top: 5, right: 20, left: 20, bottom: 40 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: tc.tick }} name={xLabel} label={{ value: xLabel, position: "insideBottom", offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                  <YAxis tick={{ fontSize: 10, fill: tc.tick }} unit=" L/h" label={{ value: pumpCount > 1 ? "Combined Flow (L/h)" : "Flow Rate (L/h)", position: "insideLeft", angle: -90, offset: -5, style: { fill: tc.tick, fontSize: 11 } }} />
                  <Tooltip content={tooltipContent} />
                  <Line type="monotone" dataKey="flow_rate_lh" stroke={COLORS[i % COLORS.length]!} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setLegendOpen(!legendOpen)}
        className="w-full flex items-center justify-center gap-1 mt-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
      >
        {legendOpen ? "Hide Legend" : "Show Legend"}
      </button>
      {legendOpen && groups.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 justify-center">
          {(layout === "layered" ? groups : [{ name: lineName, data: [] }]).map((g, i) => (
            <div key={g.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span>{g.name}</span>
              {extrapolate && layout === "layered" && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                  <span className="inline-block h-px w-3 border-t border-dashed" style={{ borderColor: COLORS[i % COLORS.length] }} />
                  <span>(projected)</span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

