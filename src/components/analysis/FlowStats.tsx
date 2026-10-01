import { computeStats, computeAggregatePPL, buildFlowSeries, formatNum, formatDispersion } from "@/lib/stats";
import { Card, CardContent } from "@/components/ui/card";
import { FLOW_METHOD_LABELS, type FlowReading } from "@/lib/db";

interface Props {
  readings: FlowReading[];
  label?: string;
  pumpCount?: number;
  kFactor?: number;
}

export function FlowStats({ readings, label, pumpCount = 1, kFactor = 440 }: Props) {
  const { pulse, actual } = buildFlowSeries(readings, kFactor);

  const groups = [
    { name: "All", color: "text-green-400", values: [...pulse, ...actual] },
    { name: FLOW_METHOD_LABELS.with_sensor, color: "text-blue-400", values: pulse },
    { name: FLOW_METHOD_LABELS.without_sensor, color: "text-purple-400", values: actual },
  ];

  const rows = [
    "n", "mean", "median", "stdDev", "variance", "coeffOfVar", "marginOfError", "min", "max",
  ];

  const aggPpl = computeAggregatePPL(readings);

  return (
    <div className="space-y-4">
      {label && <h4 className="text-sm font-medium">{label}{pumpCount > 1 ? ` (${pumpCount} pumps)` : ""}</h4>}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Metric</th>
                {groups.map((g) => g.values.length > 0 && (
                  <th key={g.name} className={`text-right px-3 py-2 font-medium ${g.color}`}>{g.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((metric) => {
                const activeGroups = groups.filter((g) => g.values.length > 0);
                if (activeGroups.length === 0) return null;
                return (
                  <tr key={metric} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2 text-muted-foreground capitalize">{metric === "coeffOfVar" ? "CoV (%)" : metric === "marginOfError" ? "MoE (95%)" : metric}</td>
                    {activeGroups.map((g) => {
                      const s = computeStats(g.values.map((v) => v * pumpCount));
                      const val = metric === "n" ? s.n.toString()
                        : metric === "mean" ? formatNum(s.mean)
                        : metric === "median" ? formatNum(s.median)
                        : metric === "stdDev" ? formatDispersion(s.n, s.stdDev)
                        : metric === "variance" ? formatDispersion(s.n, s.variance)
                        : metric === "coeffOfVar" ? formatDispersion(s.n, s.coeffOfVar)
                        : metric === "marginOfError" ? s.n < 2 ? "—" : "±" + formatNum(s.marginOfError)
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

      {aggPpl.n > 0 && (
        <Card className="border-blue-500/30">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-mono">
              <span className="text-muted-foreground">Calculated PPL:</span>
              <span className="text-blue-400 font-semibold">{formatNum(aggPpl.ppl, 1)} pulses/L</span>
              <span className="text-muted-foreground text-xs">
                ({formatNum(aggPpl.avgPulses, 1)} avg pulses / {formatNum(aggPpl.avgVolumeMl, 1)} mL avg volume, {aggPpl.n} sample{aggPpl.n !== 1 ? "s" : ""})
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
