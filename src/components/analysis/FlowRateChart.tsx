import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";
import type { FlowReading } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

interface Props {
  readings: FlowReading[];
  title?: string;
  theme?: "dark" | "light";
}

export function FlowRateChart({ readings, title, theme = "dark" }: Props) {
  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "hsl(217 33% 20%)" : "#E2E8F0",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
    tick: isDark ? "#94A3B8" : "#64748B",
    label: isDark ? "#F8FAFC" : "#334155",
  };

  const sorted = [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const data = sorted.map((r) => ({
    time: formatDateTime(r.timestamp),
    flowRate: r.flow_rate_lh,
    method: r.method,
    volume: r.volume_ml,
    pulses: r.pulses,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No flow readings to display.
      </div>
    );
  }

  return (
    <div>
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: tc.tick }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: tc.tick }} unit=" L/h" />
          <Tooltip
            contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
            labelStyle={{ color: tc.label }}
          />
          <Legend />
          <ReferenceLine y={1000} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: "Target: 1000 L/h", fill: "#F59E0B", fontSize: 11 }} />
          <Line type="monotone" dataKey="flowRate" stroke="#22C55E" name="Flow Rate" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
