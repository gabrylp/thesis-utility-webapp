import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { CommReading } from "@/lib/db";

interface Props {
  readings: CommReading[];
  theme: "dark" | "light";
  title?: string;
}

export function SignalChart({ readings, theme, title }: Props) {
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
    distance: r.distance_m,
    rssi: r.rssi,
    snr: r.snr,
  }));

  return (
    <div>
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">RSSI vs Distance</p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="distance" tick={{ fontSize: 10, fill: tc.text }} unit=" m" name="Distance" />
              <YAxis dataKey="rssi" tick={{ fontSize: 10, fill: tc.text }} name="RSSI" />
              <Tooltip
                contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
                labelStyle={{ color: tc.text }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Scatter data={data} fill="#A855F7" name="RSSI" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">SNR vs Distance</p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="distance" tick={{ fontSize: 10, fill: tc.text }} unit=" m" name="Distance" />
              <YAxis dataKey="snr" tick={{ fontSize: 10, fill: tc.text }} name="SNR" />
              <Tooltip
                contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
                labelStyle={{ color: tc.text }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Scatter data={data} fill="#10B981" name="SNR" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
