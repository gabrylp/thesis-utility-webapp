import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { CommReading } from "@/lib/db";

interface Props {
  readings: CommReading[];
  theme: "dark" | "light";
  title?: string;
}

export function PacketLossChart({ readings, theme, title }: Props) {
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
    label: `${new Date(r.timestamp).toLocaleTimeString()}`,
    loss: r.packet_loss_pct,
    distance: r.distance_m,
  }));

  return (
    <div>
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { label: "Avg Packet Loss", value: (readings.reduce((s, r) => s + r.packet_loss_pct, 0) / readings.length).toFixed(1) + "%", color: "text-red-400" },
          { label: "Min Loss", value: Math.min(...readings.map((r) => r.packet_loss_pct)).toFixed(1) + "%", color: "text-green-400" },
          { label: "Max Loss", value: Math.max(...readings.map((r) => r.packet_loss_pct)).toFixed(1) + "%", color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border border-border p-2 text-center">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className={`text-sm font-mono font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: tc.text }} />
          <YAxis tick={{ fontSize: 10, fill: tc.text }} unit=" %" domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
            labelStyle={{ color: tc.text }}
          />
          <Bar dataKey="loss" fill="#EF4444" radius={[4, 4, 0, 0]} name="Packet Loss %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
