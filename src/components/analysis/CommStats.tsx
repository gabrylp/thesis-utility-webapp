import type { CommReading } from "@/lib/db";
import { computeStats, formatNum } from "@/lib/stats";

interface Props {
  readings: CommReading[];
}

export function CommStats({ readings }: Props) {
  if (readings.length === 0) return null;

  const rttVals = readings.map((r) => r.rtt_ms);
  const rssiVals = readings.map((r) => r.rssi);
  const snrVals = readings.map((r) => r.snr);
  const lossVals = readings.map((r) => r.packet_loss_pct);

  const rttStats = computeStats(rttVals);
  const rssiStats = computeStats(rssiVals);
  const snrStats = computeStats(snrVals);
  const lossStats = computeStats(lossVals);

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Mean RTT", value: formatNum(rttStats.mean) + " ms", color: "text-blue-400" },
        { label: "Mean RSSI", value: formatNum(rssiStats.mean), color: "text-purple-400" },
        { label: "Mean SNR", value: formatNum(snrStats.mean), color: "text-emerald-400" },
        { label: "Mean Packet Loss", value: formatNum(lossStats.mean) + "%", color: "text-red-400" },
      ].map(({ label, value, color }) => (
        <div key={label} className="rounded-lg border border-border p-2 text-center">
          <p className="text-[11px] text-muted-foreground">{label}</p>
          <p className={`text-sm font-mono font-semibold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
