import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { CommReading } from "@/lib/db";

interface Props {
  readings: CommReading[];
  title?: string;
}

export function CommsChart({ readings, title }: Props) {
  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No communication test data to display.
      </div>
    );
  }

  const chartData = readings.map((r) => ({
    distance: r.distance_m,
    latency: r.rtt_ms,
    rssi: r.rssi,
    loss: r.packet_loss_pct,
  }));

  return (
    <div>
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">RTT vs Distance</p>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
              <XAxis dataKey="distance" tick={{ fontSize: 10, fill: "#94A3B8" }} unit=" m" name="Distance" />
              <YAxis dataKey="latency" tick={{ fontSize: 10, fill: "#94A3B8" }} unit=" ms" name="RTT" />
              <Tooltip
                contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#F8FAFC" }}
              />
              <Scatter data={chartData} fill="#3B82F6" name="RTT" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">RSSI vs Distance</p>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
              <XAxis dataKey="distance" tick={{ fontSize: 10, fill: "#94A3B8" }} unit=" m" name="Distance" />
              <YAxis dataKey="rssi" tick={{ fontSize: 10, fill: "#94A3B8" }} name="RSSI" />
              <Tooltip
                contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#F8FAFC" }}
              />
              <Scatter data={chartData} fill="#A855F7" name="RSSI" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
