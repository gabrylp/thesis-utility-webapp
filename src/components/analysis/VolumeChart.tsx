import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import type { FlowReading } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

interface Props {
  readings: FlowReading[];
  title?: string;
  theme?: "dark" | "light";
}

export function VolumeChart({ readings, title, theme = "dark" }: Props) {
  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "hsl(217 33% 20%)" : "#E2E8F0",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
    tick: isDark ? "#94A3B8" : "#64748B",
    label: isDark ? "#F8FAFC" : "#334155",
  };

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No volume data to display.
      </div>
    );
  }

  const sorted = [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const firstTime = new Date(sorted[0]!.timestamp).getTime();
  let accumulated = 0;

  const data = sorted.map((r, i) => {
    const elapsedMin = (new Date(r.timestamp).getTime() - firstTime) / 60000;
    const intervalH =
      i === 0 ? 0 : (new Date(r.timestamp).getTime() - new Date(sorted[i - 1]!.timestamp).getTime()) / 3600000;
    accumulated += r.flow_rate_lh * intervalH;
    return {
      time: formatDateTime(r.timestamp),
      elapsedMin: Math.round(elapsedMin * 10) / 10,
      volume: Math.round(accumulated * 10) / 10,
      flowRate: r.flow_rate_lh,
    };
  });

  const totalVolume = data[data.length - 1]?.volume || 0;
  const lastElapsedMin = data[data.length - 1]?.elapsedMin || 1;
  const projectedHour = totalVolume / (lastElapsedMin / 60);

  return (
    <div>
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-lg border border-border p-3 text-center">
          <p className="text-[11px] text-muted-foreground">Est. Total Volume</p>
          <p className="text-lg font-bold text-green-400">{totalVolume.toFixed(1)} L</p>
        </div>
        <div className="rounded-lg border border-border p-3 text-center">
          <p className="text-[11px] text-muted-foreground">Projected to 1h</p>
          <p className="text-lg font-bold text-yellow-400">{projectedHour.toFixed(1)} L</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
          <XAxis dataKey="elapsedMin" tick={{ fontSize: 10, fill: tc.tick }} unit=" min" />
          <YAxis tick={{ fontSize: 11, fill: tc.tick }} unit=" L" />
          <Tooltip
            contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
            labelStyle={{ color: tc.label }}
            formatter={(value: any) => [`${Number(value).toFixed(1)} L`, "Volume"]}
            labelFormatter={(label: any) => `${label} min`}
          />
          <ReferenceLine y={1000} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: "1000 L Target", fill: "#F59E0B", fontSize: 11 }} />
          <Area type="monotone" dataKey="volume" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
