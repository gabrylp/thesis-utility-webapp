import { computeStats, formatNum } from "@/lib/stats";
import { Card, CardContent } from "@/components/ui/card";
import type { TestRun, FlowReading } from "@/lib/db";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface RunWithStats {
  run: TestRun;
  stats: ReturnType<typeof computeStats>;
}

interface Props {
  runs: RunWithStats[];
  label?: string;
}

const COLORS = ["#3B82F6", "#A855F7", "#22C55E", "#F59E0B", "#EF4444", "#EC4899"];

export function RunComparisonTable({ runs, label }: Props) {
  if (runs.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Select multiple runs to compare.
      </div>
    );
  }

  const chartData = runs.map((r, i) => ({
    name: r.run.title.length > 18 ? r.run.title.slice(0, 16) + "…" : r.run.title,
    mean: r.stats.mean,
    moe: r.stats.marginOfError,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div>
      {label && <h4 className="text-sm font-medium mb-3">{label}</h4>}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} unit=" L/h" />
          <Tooltip
            contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#F8FAFC" }}
          />
          <Bar dataKey="mean" name="Mean Flow (L/h)">
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <Card className="mt-4">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Run</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Readings</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Mean (L/h)</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Std Dev</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">MoE (95%)</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">CoV (%)</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Min</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Max</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r, i) => (
                <tr key={r.run.id} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2 font-medium" style={{ color: COLORS[i % COLORS.length] }}>
                    {r.run.title}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{r.stats.n}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatNum(r.stats.mean)}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatNum(r.stats.stdDev)}</td>
                  <td className="px-3 py-2 text-right font-mono">±{formatNum(r.stats.marginOfError)}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatNum(r.stats.coeffOfVar)}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatNum(r.stats.min)}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatNum(r.stats.max)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
