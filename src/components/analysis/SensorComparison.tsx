import { useMemo } from "react";
import { independentTTest, computeStats, computePPL, computeSensorResistance, formatNum } from "@/lib/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FlowReading } from "@/lib/db";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface Props {
  readings: FlowReading[];
  title?: string;
  theme?: "dark" | "light";
}

const COLORS = ["#3B82F6", "#A855F7"];

export function SensorComparison({ readings, title, theme = "dark" }: Props) {
  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "hsl(217 33% 20%)" : "#E2E8F0",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
    tick: isDark ? "#94A3B8" : "#64748B",
    label: isDark ? "#F8FAFC" : "#334155",
  };

  const sensorReadings = readings.filter((r) => r.method === "with_sensor");
  const noSensorReadings = readings.filter((r) => r.method === "without_sensor");
  const sensor = sensorReadings.map((r) => r.flow_rate_lh);
  const noSensor = noSensorReadings.map((r) => r.flow_rate_lh);

  const ppl = useMemo(() => computePPL(sensorReadings), [sensorReadings]);

  const resistance = useMemo(
    () => computeSensorResistance(sensor, noSensor),
    [sensor, noSensor]
  );

  if (sensor.length < 2 || noSensor.length < 2) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {readings.length === 0
              ? "No flow readings to compare."
              : "Need at least 2 readings with sensor AND 2 without sensor for t-test."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const ttest = independentTTest(sensor, noSensor);
  const sensorStats = computeStats(sensor);
  const noSensorStats = computeStats(noSensor);

  const chartData = [
    { name: "With Sensor", mean: sensorStats.mean, moe: sensorStats.marginOfError },
    { name: "No Sensor", mean: noSensorStats.mean, moe: noSensorStats.marginOfError },
  ];

  return (
    <div className="space-y-6">
      {title && <h4 className="text-sm font-medium">{title}</h4>}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">With Sensor</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm font-mono">
            <p className="text-muted-foreground">n = <span className="text-foreground">{sensorStats.n}</span></p>
            <p className="text-muted-foreground">Mean = <span className="text-blue-400 font-semibold">{formatNum(sensorStats.mean)} L/h</span></p>
            <p className="text-muted-foreground">Std Dev = <span className="text-foreground">{formatNum(sensorStats.stdDev)}</span></p>
            <p className="text-muted-foreground">CoV = <span className="text-foreground">{formatNum(sensorStats.coeffOfVar)}%</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Without Sensor</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm font-mono">
            <p className="text-muted-foreground">n = <span className="text-foreground">{noSensorStats.n}</span></p>
            <p className="text-muted-foreground">Mean = <span className="text-purple-400 font-semibold">{formatNum(noSensorStats.mean)} L/h</span></p>
            <p className="text-muted-foreground">Std Dev = <span className="text-foreground">{formatNum(noSensorStats.stdDev)}</span></p>
            <p className="text-muted-foreground">CoV = <span className="text-foreground">{formatNum(noSensorStats.coeffOfVar)}%</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Resistance Factor */}
      <Card className={`border-2 ${resistance.volumeLossPct > 10 ? "border-yellow-500/50" : "border-green-500/50"}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            Sensor Resistance Analysis
            <span className={`text-xs px-2 py-0.5 rounded ${resistance.volumeLossPct > 10 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
              {resistance.volumeLossPct > 10 ? "Significant" : "Minimal"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-center font-mono text-sm">
            <div className="rounded-lg border border-border p-2">
              <p className="text-[10px] text-muted-foreground">Resistance Factor</p>
              <p className="font-bold text-lg">{formatNum(resistance.resistanceFactor, 4)}</p>
            </div>
            <div className="rounded-lg border border-border p-2">
              <p className="text-[10px] text-muted-foreground">Volume Loss</p>
              <p className={`font-bold text-lg ${resistance.volumeLossPct > 10 ? "text-yellow-400" : "text-green-400"}`}>
                {formatNum(resistance.volumeLossPct, 1)}%
              </p>
            </div>
            <div className="rounded-lg border border-border p-2">
              <p className="text-[10px] text-muted-foreground">Flow Difference</p>
              <p className="font-bold text-lg text-muted-foreground">
                {formatNum(resistance.withoutSensorMean - resistance.withSensorMean)} L/h
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border pt-2">
            Resistance Factor = mean(with sensor) / mean(without sensor) = {formatNum(resistance.withSensorMean)} / {formatNum(resistance.withoutSensorMean)} = {formatNum(resistance.resistanceFactor, 4)}
          </p>
          <p className="text-xs text-muted-foreground">
            The flow sensor reduces the measured flow rate by approximately {formatNum(resistance.volumeLossPct, 1)}%.
            In deployment (without sensor), actual flow rate is expected to be higher by this factor.
          </p>
        </CardContent>
      </Card>

      {/* PPL Calibration */}
      {ppl.n > 0 && (
        <Card className="border-2 border-blue-500/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              PPL Calibration
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                {ppl.n} sample{ppl.n !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center font-mono text-sm">
              <div className="rounded-lg border border-border p-2">
                <p className="text-[10px] text-muted-foreground">Calibrated PPL</p>
                <p className="font-bold text-lg text-blue-400">{formatNum(ppl.calibratedPPL, 1)}</p>
              </div>
              <div className="rounded-lg border border-border p-2">
                <p className="text-[10px] text-muted-foreground">Std Dev</p>
                <p className="font-bold text-lg">{formatNum(ppl.stdDev, 1)}</p>
              </div>
              <div className="rounded-lg border border-border p-2">
                <p className="text-[10px] text-muted-foreground">CoV</p>
                <p className={`font-bold text-lg ${ppl.coeffOfVar < 5 ? "text-green-400" : ppl.coeffOfVar < 10 ? "text-yellow-400" : "text-red-400"}`}>
                  {formatNum(ppl.coeffOfVar, 1)}%
                </p>
              </div>
            </div>
            {ppl.n >= 3 && (
              <p className="text-xs text-muted-foreground border-t border-border pt-2">
                Suggested K-factor for this sensor: <span className="text-foreground font-semibold">{formatNum(ppl.calibratedPPL, 1)}</span> pulses/L.
                Use this value in your TestRun settings for accurate volume estimation from pulses.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className={`border-2 ${ttest.significant ? "border-red-500/50" : "border-green-500/50"}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            Welch's t-Test Result
            <span className={`text-xs px-2 py-0.5 rounded ${ttest.significant ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
              {ttest.significant ? "Significant" : "Not Significant"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm font-mono">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-muted-foreground text-xs">t-statistic</p>
              <p className="text-lg font-bold">{formatNum(ttest.tStat, 4)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Degrees of Freedom</p>
              <p className="text-lg font-bold">{formatNum(ttest.df, 1)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">p-value</p>
              <p className={`text-lg font-bold ${ttest.significant ? "text-red-400" : "text-green-400"}`}>{formatNum(ttest.pValue, 6)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            {ttest.significant
              ? "The flow sensor significantly affects the flow rate (p < 0.05)."
              : "No significant difference detected — the flow sensor resistance does NOT meaningfully reduce the flow rate (p ≥ 0.05)."}
            {" "}α = 0.05.
          </p>
        </CardContent>
      </Card>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} style={{ background: isDark ? 'transparent' : '#FFFFFF', borderRadius: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: tc.tick }} />
          <YAxis tick={{ fontSize: 11, fill: tc.tick }} unit=" L/h" />
          <Tooltip
            contentStyle={{ background: tc.tooltipBg, border: `1px solid ${tc.tooltipBorder}`, borderRadius: 8 }}
            labelStyle={{ color: tc.label }}
          />
          <Bar dataKey="mean" name="Mean Flow Rate (L/h)">
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]!} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
