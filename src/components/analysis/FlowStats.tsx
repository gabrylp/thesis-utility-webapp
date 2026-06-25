import { computeStats, computePPL, formatNum } from "@/lib/stats";
import { Card, CardContent } from "@/components/ui/card";
import type { FlowReading } from "@/lib/db";

interface Props {
  readings: FlowReading[];
  label?: string;
}

export function FlowStats({ readings, label }: Props) {
  const sensor = readings.filter((r) => r.method === "with_sensor");
  const noSensor = readings.filter((r) => r.method === "without_sensor");
  const all = readings;

  const groups = [
    { name: "All", color: "text-green-400", data: all },
    { name: "With Sensor", color: "text-blue-400", data: sensor },
    { name: "No Sensor", color: "text-purple-400", data: noSensor },
  ];

  const rows = [
    "n", "mean", "median", "stdDev", "variance", "coeffOfVar", "marginOfError", "min", "max",
  ];

  const ppl = computePPL(sensor);

  return (
    <div className="space-y-4">
      {label && <h4 className="text-sm font-medium">{label}</h4>}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Metric</th>
                {groups.map((g) => g.data.length > 0 && (
                  <th key={g.name} className={`text-right px-3 py-2 font-medium ${g.color}`}>{g.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((metric) => {
                const activeGroups = groups.filter((g) => g.data.length > 0);
                if (activeGroups.length === 0) return null;
                return (
                  <tr key={metric} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2 text-muted-foreground capitalize">{metric === "coeffOfVar" ? "CoV (%)" : metric === "marginOfError" ? "MoE (95%)" : metric}</td>
                    {activeGroups.map((g) => {
                      const s = computeStats(g.data.map((r) => r.flow_rate_lh));
                      const val = metric === "n" ? s.n.toString()
                        : metric === "mean" ? formatNum(s.mean)
                        : metric === "median" ? formatNum(s.median)
                        : metric === "stdDev" ? formatNum(s.stdDev)
                        : metric === "variance" ? formatNum(s.variance)
                        : metric === "coeffOfVar" ? formatNum(s.coeffOfVar)
                        : metric === "marginOfError" ? "±" + formatNum(s.marginOfError)
                        : metric === "min" ? formatNum(s.min)
                        : metric === "max" ? formatNum(s.max) : "";
                      return (
                        <td key={g.name} className={`px-3 py-2 text-right font-mono ${metric === "mean" || metric === "marginOfError" || metric === "min" || metric === "max" ? "font-medium" : ""} ${metric === "mean" ? g.color : ""}`}>{val}</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {ppl.n > 0 && (
        <Card className="border-blue-500/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-4 text-sm font-mono">
              <span className="text-muted-foreground">PPL Calibration:</span>
              <span className="text-blue-400 font-semibold">{formatNum(ppl.calibratedPPL, 1)} pulses/L</span>
              <span className="text-muted-foreground text-xs">({ppl.n} sample{ppl.n !== 1 ? "s" : ""}, CoV {formatNum(ppl.coeffOfVar, 1)}%)</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
