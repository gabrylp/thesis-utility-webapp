import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projectVolume } from "@/lib/stats";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  avgFlowRate: number;
  actualHours: number;
  moe: number;
  minFlowRate?: number;
  maxFlowRate?: number;
  theme?: "dark" | "light";
  title?: string;
}

export function ProjectionCard({ avgFlowRate, actualHours, moe, minFlowRate, maxFlowRate, theme = "dark", title }: Props) {
  const [targetHours, setTargetHours] = useState(1);
  const [showFormula, setShowFormula] = useState(false);

  const isDark = theme === "dark";
  const chartColors = {
    grid: isDark ? "hsl(217 33% 20%)" : "#E2E8F0",
    tick: isDark ? "#94A3B8" : "#64748B",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
    label: isDark ? "#F8FAFC" : "#334155",
    line: isDark ? "#3B82F6" : "#2563EB",
  };

  const proj = projectVolume(avgFlowRate, targetHours, actualHours, moe);
  const scale = actualHours > 0 ? Math.sqrt(targetHours / actualHours) : 0;

  const chartData = useMemo(() => {
    const totalMin = targetHours * 60;
    const pts = [];
    for (let m = 0; m <= totalMin; m++) {
      const h = m / 60;
      const vol = avgFlowRate * h;
      const moeAtMin = actualHours > 0 ? moe * Math.sqrt(h / actualHours) : 0;
      pts.push({
        min: m,
        volume: vol,
        lower: Math.max(0, vol - moeAtMin),
        upper: vol + moeAtMin,
      });
    }
    return pts;
  }, [avgFlowRate, targetHours, actualHours, moe]);

  return (
    <Card>
      <CardHeader>
        {title && <h4 className="text-sm font-medium mb-1">{title}</h4>}
        <CardTitle className="text-sm text-center">Volume Projection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center text-sm font-mono">
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] text-muted-foreground">Avg Flow Rate</p>
            <p className="font-semibold text-blue-400">{avgFlowRate.toFixed(1)} L/h</p>
          </div>
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] text-muted-foreground">Actual Duration</p>
            <p className="font-semibold text-muted-foreground">{(actualHours * 60).toFixed(0)} min</p>
          </div>
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] text-muted-foreground">MoE of Mean</p>
            <p className="font-semibold text-yellow-400">±{moe.toFixed(2)} L/h</p>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Project to (hours)</Label>
            <Input
              type="number"
              value={targetHours}
              onChange={(e) => setTargetHours(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-24 h-8 font-mono text-sm"
              step={0.25}
              min={0.1}
            />
          </div>
        </div>

        <div className="rounded-lg bg-primary/10 border border-primary/30 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Projected Volume at {targetHours}h
          </p>
          <p className="text-2xl font-bold text-primary">{proj.volume.toFixed(1)} L</p>
          <p className="text-xs text-muted-foreground mt-1">
            95% CI: {proj.lower.toFixed(1)} L – {proj.upper.toFixed(1)} L
          </p>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 20, bottom: 30 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="min" tick={{ fontSize: 10, fill: chartColors.tick }} unit=" min" label={{ value: "Time (min)", position: "insideBottom", offset: -5, style: { fill: chartColors.tick, fontSize: 11 } }} />
            <YAxis tick={{ fontSize: 10, fill: chartColors.tick }} unit=" L" label={{ value: "Volume (L)", position: "insideLeft", angle: -90, offset: -5, style: { fill: chartColors.tick, fontSize: 11 } }} />
            <Tooltip
              content={(props: any) => {
                if (!props.active || !props.payload?.length) return null;
                return (
                  <div style={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
                    <p style={{ color: chartColors.label, marginBottom: 4 }}>{props.label} min</p>
                    {props.payload.map((p: any, i: number) => {
                      const labels: Record<string, string> = { volume: "Volume", lower: "Lower CI", upper: "Upper CI" };
                      return (
                        <p key={p.name} style={{ color: p.color || chartColors.label, fontWeight: 600, fontSize: 13, margin: "2px 0" }}>
                          {labels[p.name] || p.name}: {Number(p.value).toFixed(2)} L
                        </p>
                      );
                    })}
                    {(minFlowRate != null || maxFlowRate != null) && (
                      <>
                        <hr style={{ margin: "4px 0", borderColor: chartColors.tooltipBorder }} />
                        <p style={{ fontSize: 10, color: "#94A3B8", margin: "2px 0" }}>
                          Min: {minFlowRate?.toFixed(1)} L/h &nbsp;|&nbsp; Max: {maxFlowRate?.toFixed(1)} L/h
                        </p>
                      </>
                    )}
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="upper" stroke="transparent" fill={chartColors.line} fillOpacity={0.08} />
            <Area type="monotone" dataKey="lower" stroke="transparent" fill={chartColors.line} fillOpacity={0.08} />
            <Area type="monotone" dataKey="volume" stroke={chartColors.line} fill={chartColors.line} fillOpacity={0.06} strokeWidth={2} name="volume" />
          </AreaChart>
        </ResponsiveContainer>

        <div>
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showFormula ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {showFormula ? "Hide formula" : "Show formula"}
          </button>
          {showFormula && (
            <div className="mt-2 rounded-lg border border-border bg-secondary/20 p-3 font-mono text-xs space-y-1.5 text-muted-foreground">
              <p><span className="text-foreground">Projected Volume</span> = Avg Flow Rate × Target Hours</p>
              <p className="pl-4">= {avgFlowRate.toFixed(1)} × {targetHours.toFixed(1)}</p>
              <p className="pl-4">= <span className="text-primary font-semibold">{proj.volume.toFixed(1)} L</span></p>
              <div className="border-t border-border/50 my-1.5" />
              <p><span className="text-foreground">MoE Scaling</span> = √(Target / Actual)</p>
              <p className="pl-4">= √({targetHours.toFixed(1)} / {actualHours.toFixed(1)})</p>
              <p className="pl-4">= {scale.toFixed(3)}</p>
              <p><span className="text-foreground">Scaled MoE</span> = {moe.toFixed(2)} × {scale.toFixed(3)}</p>
              <p className="pl-4">= <span className="text-yellow-400 font-semibold">±{proj.moe.toFixed(2)} L</span></p>
              <div className="border-t border-border/50 my-1.5" />
              <p><span className="text-foreground">95% CI</span> = {proj.volume.toFixed(1)} ± {proj.moe.toFixed(1)} L</p>
              <p className="pl-4">= [{proj.lower.toFixed(1)} L, {proj.upper.toFixed(1)} L]</p>
              <div className="border-t border-border/50 my-1.5" />
              <p className="text-foreground">Note: Projection uses simple avg of flow_rate_lh values.</p>
              <p className="text-foreground">Volume tab uses time-weighted avg (sum vol ÷ sum time) — values may differ.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
