import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { PowerReading } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

interface Props {
  readings: PowerReading[];
  title?: string;
  theme?: "dark" | "light";
}

export function BatteryChart({ readings, title, theme = "dark" }: Props) {
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
        No power readings to display.
      </div>
    );
  }

  const sorted = [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const data = sorted.map((r) => ({
    time: formatDateTime(r.timestamp),
    voltage: r.voltage,
    amperage: r.amperage,
    power: r.voltage * r.amperage,
  }));

  return (
    <div>
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { label: "Avg Voltage", value: (readings.reduce((s, r) => s + r.voltage, 0) / readings.length).toFixed(2) + " V", color: "text-blue-400" },
          { label: "Avg Current", value: (readings.reduce((s, r) => s + r.amperage, 0) / readings.length).toFixed(3) + " A", color: "text-purple-400" },
          { label: "Avg Power", value: (data.reduce((s, d) => s + d.power, 0) / data.length).toFixed(2) + " W", color: "text-yellow-400" },
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
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: tc.tick }} interval="preserveStartEnd" />
          <YAxis yAxisId="v" tick={{ fontSize: 11, fill: tc.tick }} unit=" V" domain={["auto", "auto"]} />
          <YAxis yAxisId="a" orientation="right" tick={{ fontSize: 11, fill: tc.tick }} unit=" A" domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
            labelStyle={{ color: tc.label }}
          />
          <Legend />
          <Line yAxisId="v" type="monotone" dataKey="voltage" stroke="#3B82F6" name="Voltage (V)" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="a" type="monotone" dataKey="amperage" stroke="#A855F7" name="Current (A)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
