import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { CommReading } from "@/lib/db";
import { computeStats, formatNum } from "@/lib/stats";

interface Props {
  readings: CommReading[];
  theme: "dark" | "light";
  title?: string;
}

export function RTTChart({ readings, theme, title }: Props) {
  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "#1E293B" : "#E2E8F0",
    text: isDark ? "#94A3B8" : "#475569",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
  };

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No communication data to display.
      </div>
    );
  }

  const data = readings.map((r) => ({
    label: new Date(r.timestamp).toLocaleTimeString(),
    rtt_ms: r.rtt_ms,
    one_way: r.one_way_latency_ms,
  }));

  const rttVals = readings.map((r) => r.rtt_ms);
  const stats = computeStats(rttVals);

  return (
    <div>
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { label: "Mean RTT", value: formatNum(stats.mean) + " ms", color: "text-blue-400" },
          { label: "Min RTT", value: formatNum(Math.min(...rttVals)) + " ms", color: "text-green-400" },
          { label: "Max RTT", value: formatNum(Math.max(...rttVals)) + " ms", color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border border-border p-2 text-center">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className={`text-sm font-mono font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: tc.text }} />
          <YAxis tick={{ fontSize: 10, fill: tc.text }} unit=" ms" />
          <Tooltip
            contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
            labelStyle={{ color: tc.text }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="rtt_ms" stroke="#3B82F6" name="RTT (ms)" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="one_way" stroke="#8B5CF6" name="One-way (ms)" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
