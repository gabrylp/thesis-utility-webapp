import { useMemo } from "react";
import { independentTTest, computeStats, computePPL, computeAggregatePPL, computeSensorResistance, buildFlowSeries, countPairedRows, formatNum, formatDispersion } from "@/lib/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FLOW_METHOD_LABELS, type FlowReading } from "@/lib/db";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface Props {
  readings: FlowReading[];
  title?: string;
  theme?: "dark" | "light";
  kFactor?: number;
}

const COLORS = ["#3B82F6", "#A855F7"];

export function SensorComparison({ readings, title, theme = "dark", kFactor = 440 }: Props) {
  const isDark = theme === "dark";
  const tc = {
    grid: isDark ? "hsl(217 33% 20%)" : "#E2E8F0",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipBorder: isDark ? "#334155" : "#CBD5E1",
    tick: isDark ? "#94A3B8" : "#64748B",
    label: isDark ? "#F8FAFC" : "#334155",
  };

  const { pulse, actual } = useMemo(() => buildFlowSeries(readings, kFactor), [readings, kFactor]);
  const pairedRows = useMemo(() => countPairedRows(readings), [readings]);

  const ppl = useMemo(() => computePPL(readings), [readings]);
  const aggPpl = useMemo(() => computeAggregatePPL(readings), [readings]);

  const resistance = useMemo(
    () => computeSensorResistance(pulse, actual),
    [pulse, actual]
  );

  if (pulse.length === 0 || actual.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {readings.length === 0
              ? "No flow readings to compare."
              : `Need ${FLOW_METHOD_LABELS.with_sensor} data (pulses) and ${FLOW_METHOD_LABELS.without_sensor} data (measured volume) to compare. Record both on a reading to get a paired comparison.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  const canTTest = pulse.length >= 2 && actual.length >= 2;
  const ttest = canTTest ? independentTTest(pulse, actual) : null;
  const pulseStats = computeStats(pulse);
  const actualStats = computeStats(actual);

  const chartData = [
    { name: FLOW_METHOD_LABELS.with_sensor, mean: pulseStats.mean, moe: pulseStats.marginOfError },
    { name: FLOW_METHOD_LABELS.without_sensor, mean: actualStats.mean, moe: actualStats.marginOfError },
  ];

  return (
    <div className="space-y-6">
      {title && <h4 className="text-sm font-medium">{title}</h4>}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">{FLOW_METHOD_LABELS.with_sensor}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm font-mono">
            <p className="text-muted-foreground">n = <span className="text-foreground">{pulseStats.n}</span></p>
            <p className="text-muted-foreground">Mean = <span className="text-blue-400 font-semibold">{formatNum(pulseStats.mean)} L/h</span></p>
            <p className="text-muted-foreground">Std Dev = <span className="text-foreground">{formatDispersion(pulseStats.n, pulseStats.stdDev)}</span></p>
            <p className="text-muted-foreground">CoV = <span className="text-foreground">{formatDispersion(pulseStats.n, pulseStats.coeffOfVar)}%</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{FLOW_METHOD_LABELS.without_sensor}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm font-mono">
            <p className="text-muted-foreground">n = <span className="text-foreground">{actualStats.n}</span></p>
            <p className="text-muted-foreground">Mean = <span className="text-purple-400 font-semibold">{formatNum(actualStats.mean)} L/h</span></p>
            <p className="text-muted-foreground">Std Dev = <span className="text-foreground">{formatDispersion(actualStats.n, actualStats.stdDev)}</span></p>
            <p className="text-muted-foreground">CoV = <span className="text-foreground">{formatDispersion(actualStats.n, actualStats.coeffOfVar)}%</span></p>
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
            Resistance Factor = mean({FLOW_METHOD_LABELS.with_sensor}) / mean({FLOW_METHOD_LABELS.without_sensor}) = {formatNum(resistance.withSensorMean)} / {formatNum(resistance.withoutSensorMean)} = {formatNum(resistance.resistanceFactor, 4)}
          </p>
          <p className="text-xs text-muted-foreground">
            Installing the YF-S201 reduces the measured flow rate by approximately {formatNum(resistance.volumeLossPct, 1)}%.
            In deployment (no sensor fitted), the actual flow rate is expected to be higher by this factor.
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
            <div className="grid grid-cols-4 gap-4 text-center font-mono text-sm">
              <div className="rounded-lg border border-border p-2">
                <p className="text-[10px] text-muted-foreground">Calculated PPL</p>
                <p className="font-bold text-lg text-blue-400">{formatNum(aggPpl.ppl, 1)}</p>
              </div>
              <div className="rounded-lg border border-border p-2">
                <p className="text-[10px] text-muted-foreground">Avg Pulses</p>
                <p className="font-bold text-lg">{formatNum(aggPpl.avgPulses, 1)}</p>
              </div>
              <div className="rounded-lg border border-border p-2">
                <p className="text-[10px] text-muted-foreground">Avg Vol (mL)</p>
                <p className="font-bold text-lg">{formatNum(aggPpl.avgVolumeMl, 1)}</p>
              </div>
              <div className="rounded-lg border border-border p-2">
                <p className="text-[10px] text-muted-foreground">PPL CoV</p>
                <p className={`font-bold text-lg ${ppl.coeffOfVar < 5 ? "text-green-400" : ppl.coeffOfVar < 10 ? "text-yellow-400" : "text-red-400"}`}>
                  {formatDispersion(ppl.n, ppl.coeffOfVar, 1)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground border-t border-border pt-2">
              PPL = {formatNum(aggPpl.totalPulses, 0)} total pulses ÷ {formatNum(aggPpl.totalVolumeMl / 1000, 3)} L measured ={" "}
              <span className="text-foreground font-semibold">{formatNum(aggPpl.ppl, 1)}</span> pulses/L
              {Math.abs(aggPpl.ppl - kFactor) > 0.5 && (
                <> — differs from the run K-factor of {kFactor}; update the run settings to calibrate the Est. Vol column.</>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {ttest ? (
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
                ? "The flow measurement method significantly affects the flow rate (p < 0.05)."
                : "No significant difference detected — the YF-S201's hydraulic resistance does NOT meaningfully reduce the flow rate (p ≥ 0.05)."}
              {" "}α = 0.05.
            </p>
            {pairedRows > 0 && (
              <p className="text-xs text-yellow-400/80 border-t border-border pt-2">
                Note: {pairedRows} reading{pairedRows !== 1 ? "s" : ""} contribute{pairedRows !== 1 ? "" : "s"} to both groups, so the two samples
                are paired rather than independent. Welch's t-test assumes independence; a paired t-test is the stricter test here.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              Welch&apos;s t-test needs at least 2 samples in each group
              (currently {pulse.length} {FLOW_METHOD_LABELS.with_sensor}, {actual.length} {FLOW_METHOD_LABELS.without_sensor}).
            </p>
          </CardContent>
        </Card>
      )}

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
