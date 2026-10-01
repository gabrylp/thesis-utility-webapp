import { useState, useEffect, useRef, useMemo } from "react";
import { db, type TestRun, type FlowReading, type PowerReading, type CommReading, FLOW_METHOD_LABELS } from "@/lib/db";
import { computeStats, formatNum, computeAggregatePPL, computeSensorResistance, computeFlowRate, buildFlowSeries } from "@/lib/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RunSelector } from "@/components/analysis/RunSelector";
import { FlowRateChart } from "@/components/analysis/FlowRateChart";
import { FlowStats } from "@/components/analysis/FlowStats";
import { VolumeChart } from "@/components/analysis/VolumeChart";
import { BatteryChart } from "@/components/analysis/BatteryChart";
import { SensorComparison } from "@/components/analysis/SensorComparison";
import { CustomChart } from "@/components/analysis/CustomChart";
import { ProjectionCard } from "@/components/analysis/ProjectionCard";
import { RTTChart } from "@/components/analysis/RTTChart";
import { SignalChart } from "@/components/analysis/SignalChart";
import { PacketLossChart } from "@/components/analysis/PacketLossChart";
import { CommStats } from "@/components/analysis/CommStats";
import { CustomCommChart } from "@/components/analysis/CustomCommChart";
import { DataInterpretation, type Insight } from "@/components/analysis/DataInterpretation";
import { Activity, Droplets, Battery, Beaker, BarChart3, ChartLine, Radio, Signal, Wifi, Settings2, Filter, Check, ChevronDown, Sun, Moon, Eye, EyeOff, LayoutIcon, Plus, Minus } from "lucide-react";

export default function Analysis() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [flowReadings, setFlowReadings] = useState<FlowReading[]>([]);
  const [powerReadings, setPowerReadings] = useState<PowerReading[]>([]);
  const [commReadings, setCommReadings] = useState<CommReading[]>([]);
  const [chartTheme, setChartTheme] = useState<"dark" | "light">("dark");
  const [showStats, setShowStats] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"flow_rate" | "communication" | null>(null);
  const [chartLayout, setChartLayout] = useState<"connected" | "layered" | "separate">("separate");
  const [pumpCount, setPumpCount] = useState(2);

  useEffect(() => {
    db.test_runs.toArray().then((data) => {
      setRuns(data.sort((a, b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity)));
    });
  }, []);

  const filteredRuns = typeFilter ? runs.filter((r) => r.run_type === typeFilter) : runs;

  useEffect(() => {
    if (selectedIds.length === 0) {
      setFlowReadings([]);
      setPowerReadings([]);
      setCommReadings([]);
      return;
    }
    async function load() {
      const allFlow: FlowReading[] = [];
      const allPower: PowerReading[] = [];
      const allComm: CommReading[] = [];
      for (const id of selectedIds) {
        allFlow.push(...(await db.flow_readings.where("run_id").equals(id).toArray()));
        allPower.push(...(await db.power_readings.where("run_id").equals(id).toArray()));
        allComm.push(...(await db.comm_readings.where("run_id").equals(id).toArray()));
      }
      setFlowReadings(allFlow);
      setPowerReadings(allPower);
      setCommReadings(allComm);
    }
    load();
  }, [selectedIds]);

  const selectedRuns = runs.filter((r) => selectedIds.includes(r.id));
  const hasFlow = selectedRuns.some((r) => (r.run_type ?? "flow_rate") === "flow_rate");
  const hasComm = selectedRuns.some((r) => r.run_type === "communication");

  const kFactor = selectedRuns[0]?.k_factor || 440;

  const totalFlowRate = flowReadings
    .filter((r) => r.time_sec > 0 && r.volume_ml > 0)
    .map((r) => computeFlowRate("without_sensor", r.time_sec, r.volume_ml, r.pulses, kFactor));
  const flowStats = computeStats(totalFlowRate);
  const totalHours = flowReadings.length > 0
    ? Math.max(...flowReadings.map((r) => r.time_sec)) / 3600
    : 0;

  const flowInsights = useMemo((): Insight[] => {
    if (flowReadings.length === 0) return [];
    const insights: Insight[] = [];
    const combinedFlow = flowStats.mean * pumpCount;
    const targetPct = (combinedFlow / 1000) * 100;
    insights.push({
      icon: targetPct >= 95 ? "check" : targetPct >= 80 ? "warning" : "alert",
      text: `Combined flow (${pumpCount} pumps): ${formatNum(combinedFlow)} L/h (${targetPct.toFixed(0)}% of the 1000 L/h target). Per-pump mean: ${formatNum(flowStats.mean)} L/h.`,
    });
    const cov = flowStats.coeffOfVar;
    const rating = cov < 5 ? "excellent" : cov < 10 ? "good" : cov < 20 ? "fair" : "poor";
    insights.push({
      icon: cov < 10 ? "check" : cov < 20 ? "warning" : "alert",
      text: `Flow consistency: ${rating} (CoV = ${formatNum(cov)}%).`,
    });
    const { pulse, actual } = buildFlowSeries(flowReadings, kFactor);
    if (pulse.length > 0 && actual.length > 0) {
      const pulseMean = computeStats(pulse).mean;
      const actualMean = computeStats(actual).mean;
      const diff = Math.abs(pulseMean - actualMean);
      insights.push({
        icon: diff < 50 ? "info" : "warning",
        text: `Pulse-based vs actual: ${FLOW_METHOD_LABELS.with_sensor} averages ${formatNum(pulseMean)} L/h, ${FLOW_METHOD_LABELS.without_sensor} averages ${formatNum(actualMean)} L/h (${diff.toFixed(1)} L/h difference).`,
      });
      const resistance = computeSensorResistance(pulse, actual);
      insights.push({
        icon: resistance.volumeLossPct < 10 ? "check" : "warning",
        text: `Sensor resistance factor: ${formatNum(resistance.resistanceFactor, 4)} (flow reduced by ${formatNum(resistance.volumeLossPct, 1)}%).`,
      });
    }
    const aggPpl = computeAggregatePPL(flowReadings);
    if (aggPpl.n > 0) {
      const drift = Math.abs(aggPpl.ppl - kFactor) / kFactor * 100;
      insights.push({
        icon: drift < 2 ? "check" : drift < 10 ? "warning" : "alert",
        text: `Calculated PPL: ${formatNum(aggPpl.ppl, 1)} pulses/L from ${formatNum(aggPpl.avgPulses, 1)} avg pulses over ${formatNum(aggPpl.avgVolumeMl, 1)} mL avg volume (${aggPpl.n} sample${aggPpl.n !== 1 ? "s" : ""}) — ${drift < 0.05 ? "matches" : `${drift.toFixed(1)}% ${aggPpl.ppl > kFactor ? "above" : "below"}`} the K-factor of ${kFactor}.`,
      });
    }
    insights.push({
      icon: "info",
      text: `Based on ${flowStats.n} flow reading${flowStats.n !== 1 ? "s" : ""} across ${selectedRuns.length} run${selectedRuns.length !== 1 ? "s" : ""}.`,
    });
    return insights;
  }, [flowReadings, flowStats, selectedRuns, pumpCount, kFactor]);

  const volumeInsights = useMemo((): Insight[] => {
    if (flowReadings.length === 0) return [];
    const insights: Insight[] = [];
    const totalVolMl = flowReadings.reduce((s, r) => s + r.volume_ml, 0);
    const totalVolL = totalVolMl / 1000;
    const totalTimeSec = flowReadings.reduce((s, r) => s + r.time_sec, 0);
    const avgFlowLh = totalTimeSec > 0 ? (totalVolMl * 3.6) / totalTimeSec : 0;
    insights.push({
      icon: "info",
      text: `Total accumulated volume (${pumpCount} pumps): ${(totalVolL * pumpCount).toFixed(2)} L (${flowReadings.length} reading${flowReadings.length !== 1 ? "s" : ""}).`,
    });
    insights.push({
      icon: "info",
      text: `Time-weighted average flow rate (${pumpCount} pumps): ${formatNum(avgFlowLh * pumpCount)} L/h.`,
    });
    if (avgFlowLh > 0) {
      const hoursToTarget = 1000 / (avgFlowLh * pumpCount);
      insights.push({
        icon: hoursToTarget <= 1 ? "check" : hoursToTarget <= 2 ? "warning" : "alert",
        text: `At current rate, filling a 1000L container would take approximately ${hoursToTarget.toFixed(1)} hours.`,
      });
    }
    return insights;
  }, [flowReadings]);

  const powerInsights = useMemo((): Insight[] => {
    if (powerReadings.length === 0) return [];
    const insights: Insight[] = [];
    const voltages = powerReadings.map((r) => r.voltage);
    const amperages = powerReadings.map((r) => r.amperage);
    const vStats = computeStats(voltages);
    const aStats = computeStats(amperages);
    const avgW = vStats.mean * aStats.mean;
    insights.push({
      icon: "info",
      text: `Average power consumption: ${formatNum(avgW)} W (${formatNum(vStats.mean)} V × ${formatNum(aStats.mean)} A).`,
    });
    const vCov = vStats.coeffOfVar;
    const vRating = vCov < 2 ? "very stable" : vCov < 5 ? "stable" : vCov < 10 ? "moderate fluctuation" : "significant fluctuation";
    insights.push({
      icon: vCov < 5 ? "check" : vCov < 10 ? "warning" : "alert",
      text: `Voltage stability: ${vRating} (CoV = ${formatNum(vCov)}%).`,
    });
    if (vStats.mean >= 11 && vStats.mean <= 14) {
      insights.push({ icon: "check", text: "Voltage is within typical 12V operating range (11–14V)." });
    } else {
      insights.push({ icon: "warning", text: `Voltage (${formatNum(vStats.mean)} V) is outside typical 12V operating range (11–14V).` });
    }
    insights.push({
      icon: "info",
      text: `Based on ${powerReadings.length} power reading${powerReadings.length !== 1 ? "s" : ""}.`,
    });
    return insights;
  }, [powerReadings]);

  const rttInsights = useMemo((): Insight[] => {
    if (commReadings.length === 0) return [];
    const insights: Insight[] = [];
    const rttVals = commReadings.map((r) => r.rtt_ms);
    const rttStats = computeStats(rttVals);
    const oneWay = rttStats.mean / 2;
    insights.push({
      icon: "info",
      text: `Mean round-trip time: ${formatNum(rttStats.mean)} ms (estimated one-way: ${formatNum(oneWay)} ms).`,
    });
    const cov = rttStats.coeffOfVar;
    const rating = cov < 10 ? "excellent" : cov < 20 ? "good" : cov < 30 ? "fair" : "poor";
    insights.push({
      icon: cov < 20 ? "check" : cov < 30 ? "warning" : "alert",
      text: `Latency consistency: ${rating} (CoV = ${formatNum(cov)}%).`,
    });
    const jitter = rttStats.max - rttStats.min;
    insights.push({
      icon: jitter < 50 ? "check" : jitter < 200 ? "warning" : "alert",
      text: `RTT range: ${formatNum(rttStats.min)} – ${formatNum(rttStats.max)} ms (jitter: ${formatNum(jitter)} ms).`,
    });
    return insights;
  }, [commReadings]);

  const signalInsights = useMemo((): Insight[] => {
    if (commReadings.length === 0) return [];
    const insights: Insight[] = [];
    const rssiVals = commReadings.map((r) => r.rssi);
    const snrVals = commReadings.map((r) => r.snr);
    const rssiStats = computeStats(rssiVals);
    const snrStats = computeStats(snrVals);
    const rssiRating = rssiStats.mean > -67 ? "excellent" : rssiStats.mean > -70 ? "good" : rssiStats.mean > -80 ? "marginal" : "poor";
    insights.push({
      icon: rssiStats.mean > -70 ? "check" : rssiStats.mean > -80 ? "warning" : "alert",
      text: `Mean RSSI: ${formatNum(rssiStats.mean)} dBm — signal strength is ${rssiRating}.`,
    });
    const snrRating = snrStats.mean > 10 ? "good" : snrStats.mean > 5 ? "fair" : "poor";
    insights.push({
      icon: snrStats.mean > 10 ? "check" : snrStats.mean > 5 ? "warning" : "alert",
      text: `Mean SNR: ${formatNum(snrStats.mean)} dB — signal quality is ${snrRating}.`,
    });
    if (commReadings.length > 1) {
      const distances = commReadings.map((r) => r.distance_m);
      const dStats = computeStats(distances);
      insights.push({
        icon: "info",
        text: `Test distances ranged from ${formatNum(dStats.min, 0)} m to ${formatNum(dStats.max, 0)} m (mean: ${formatNum(dStats.mean, 0)} m).`,
      });
    }
    return insights;
  }, [commReadings]);

  const packetLossInsights = useMemo((): Insight[] => {
    if (commReadings.length === 0) return [];
    const insights: Insight[] = [];
    const lossVals = commReadings.map((r) => r.packet_loss_pct);
    const lossStats = computeStats(lossVals);
    const rating = lossStats.mean < 1 ? "excellent" : lossStats.mean < 5 ? "good" : lossStats.mean < 10 ? "fair" : "poor";
    insights.push({
      icon: lossStats.mean < 5 ? "check" : lossStats.mean < 10 ? "warning" : "alert",
      text: `Average packet loss: ${formatNum(lossStats.mean)}% — reliability is ${rating}.`,
    });
    if (lossStats.max > 0) {
      insights.push({
        icon: lossStats.max < 10 ? "info" : "warning",
        text: `Worst-case loss: ${formatNum(lossStats.max)}%.`,
      });
    }
    return insights;
  }, [commReadings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex-1 max-w-md">
          <RunSelector runs={filteredRuns} selected={selectedIds} onChange={setSelectedIds} />
        </div>
        <FilterDropdown value={typeFilter} onChange={setTypeFilter} />
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-1 px-3 py-2 text-xs rounded-md border border-input text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {showStats ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showStats ? "Hide Stats" : "Show Stats"}
        </button>
      </div>

      {selectedIds.length === 0 ? (
        <Card><CardContent><p className="text-sm text-muted-foreground text-center py-12">Select a test run above.</p></CardContent></Card>
      ) : (
        <>
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mx-auto max-w-4xl">
              <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Flow Readings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{flowReadings.length}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Comm Readings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{commReadings.length}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Power Readings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{powerReadings.length}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Selected Runs</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{selectedIds.length}</p></CardContent></Card>
            </div>
          )}

          <Tabs defaultValue={hasFlow ? "flow" : "rtt"}>
            <div className="flex items-center justify-center mb-4">
              <TabsList>
              {hasFlow && (
                <>
                  <TabsTrigger value="flow"><Activity className="h-4 w-4 mr-1.5" />Flow Rate</TabsTrigger>
                  <TabsTrigger value="volume"><Droplets className="h-4 w-4 mr-1.5" />Volume</TabsTrigger>
                  <TabsTrigger value="power"><Battery className="h-4 w-4 mr-1.5" />Power</TabsTrigger>
                  <TabsTrigger value="sensor"><Beaker className="h-4 w-4 mr-1.5" />Pulse vs Actual t-Test</TabsTrigger>
                  <TabsTrigger value="custom"><ChartLine className="h-4 w-4 mr-1.5" />Custom Graph</TabsTrigger>
                  <TabsTrigger value="projection"><BarChart3 className="h-4 w-4 mr-1.5" />Projection</TabsTrigger>
                </>
              )}
              {hasComm && (
                <>
                  <TabsTrigger value="rtt"><Radio className="h-4 w-4 mr-1.5" />RTT</TabsTrigger>
                  <TabsTrigger value="signal"><Signal className="h-4 w-4 mr-1.5" />Signal</TabsTrigger>
                  <TabsTrigger value="packet_loss"><Wifi className="h-4 w-4 mr-1.5" />Packet Loss</TabsTrigger>
                  <TabsTrigger value="custom_comm"><Settings2 className="h-4 w-4 mr-1.5" />Custom Graph</TabsTrigger>
                </>
              )}
            </TabsList>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Layout:</span>
                <div className="flex rounded-md border border-input overflow-hidden">
                  {(["connected", "layered", "separate"] as const).map((l) => (
                    <button key={l} onClick={() => setChartLayout(l)}
                      className={`px-2.5 py-1.5 text-[11px] font-medium transition-colors ${chartLayout === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >{l.charAt(0).toUpperCase() + l.slice(1)}</button>
                  ))}
                </div>
              </div>
              <span className="text-muted-foreground/30">|</span>
              <button
                onClick={() => setChartTheme(t => t === "dark" ? "light" : "dark")}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded-md border border-input text-muted-foreground hover:text-foreground transition-colors"
              >
                {chartTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {chartTheme === "dark" ? "Light" : "Dark"}
              </button>
              <span className="text-muted-foreground/30">|</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Pumps:</span>
                <div className="flex rounded-md border border-input overflow-hidden">
                  <button onClick={() => setPumpCount(Math.max(1, pumpCount - 1))}
                    className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors leading-none"
                  ><Minus className="h-3 w-3" /></button>
                  <span className="px-2.5 py-1.5 text-[11px] font-semibold text-foreground border-x border-input">{pumpCount}</span>
                  <button onClick={() => setPumpCount(pumpCount + 1)}
                    className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors leading-none"
                  ><Plus className="h-3 w-3" /></button>
                </div>
              </div>
            </div>

            {hasFlow && (
              <>
                <TabsContent value="flow" className="space-y-6">
                  <FlowRateChart readings={flowReadings} title="Flow Rate Over Time" theme={chartTheme} layout={chartLayout} runs={selectedRuns} pumpCount={pumpCount} />
                  <FlowStats readings={flowReadings} label="Flow Rate Statistics by Basis" pumpCount={pumpCount} kFactor={kFactor} />
                  <DataInterpretation insights={flowInsights} />
                </TabsContent>

                <TabsContent value="volume" className="space-y-6">
                  <VolumeChart readings={flowReadings} title="Accumulated Sampling Volume" theme={chartTheme} layout={chartLayout} runs={selectedRuns} pumpCount={pumpCount} />
                  <DataInterpretation insights={volumeInsights} />
                </TabsContent>

                <TabsContent value="power" className="space-y-6">
                  <BatteryChart readings={powerReadings} title="Power Monitoring" theme={chartTheme} layout={chartLayout} runs={selectedRuns} />
                  <DataInterpretation insights={powerInsights} />
                </TabsContent>

                <TabsContent value="sensor" className="space-y-6">
                  <SensorComparison readings={flowReadings} title={`${FLOW_METHOD_LABELS.with_sensor} vs ${FLOW_METHOD_LABELS.without_sensor} Comparison`} theme={chartTheme} kFactor={kFactor} />
                </TabsContent>

                <TabsContent value="custom" className="space-y-6">
                  <CustomChart flowReadings={flowReadings} powerReadings={powerReadings} runs={selectedRuns} title="Custom Graph Builder" theme={chartTheme} layout={chartLayout} />
                </TabsContent>

                <TabsContent value="projection" className="space-y-6">
                  <ProjectionCard
                    avgFlowRate={flowStats.mean * pumpCount}
                    actualHours={totalHours || 0.5}
                    moe={flowStats.marginOfError}
                    minFlowRate={flowStats.min * pumpCount}
                    maxFlowRate={flowStats.max * pumpCount}
                    theme={chartTheme}
                  />
                </TabsContent>
              </>
            )}

            {hasComm && (
              <>
                <TabsContent value="rtt" className="space-y-6">
                  <RTTChart readings={commReadings} title="Round-Trip Time Analysis" theme={chartTheme} layout={chartLayout} runs={selectedRuns} />
                  <DataInterpretation insights={rttInsights} />
                </TabsContent>

                <TabsContent value="signal" className="space-y-6">
                  <SignalChart readings={commReadings} title="Signal Strength vs Distance" theme={chartTheme} layout={chartLayout} runs={selectedRuns} />
                  <DataInterpretation insights={signalInsights} />
                </TabsContent>

                <TabsContent value="packet_loss" className="space-y-6">
                  <PacketLossChart readings={commReadings} title="Packet Loss Analysis" theme={chartTheme} layout={chartLayout} runs={selectedRuns} />
                  <CommStats readings={commReadings} />
                  <DataInterpretation insights={packetLossInsights} />
                </TabsContent>

                <TabsContent value="custom_comm" className="space-y-6">
                  <CustomCommChart readings={commReadings} title="Custom Comm Graph Builder" theme={chartTheme} layout={chartLayout} runs={selectedRuns} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
}

function FilterDropdown({ value, onChange }: { value: "flow_rate" | "communication" | null; onChange: (v: "flow_rate" | "communication" | null) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLabel = value === "flow_rate" ? "Flow Rate" : value === "communication" ? "Comm" : null;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-md border transition-colors font-medium ${
          activeLabel ? "bg-primary/10 border-primary/30 text-primary" : "border-input text-muted-foreground hover:text-foreground"
        }`}
      >
        <Filter className="h-3.5 w-3.5" />
        {activeLabel || "Filter"}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 rounded-md border border-border bg-card shadow-lg py-1">
          <button
            onClick={() => { onChange(value === "flow_rate" ? null : "flow_rate"); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-secondary/50 transition-colors"
          >
            <div className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${value === "flow_rate" ? "bg-blue-500/20 border-blue-500/40" : "border-input"}`}>
              {value === "flow_rate" && <Check className="h-2.5 w-2.5 text-blue-400" />}
            </div>
            <span className="text-foreground">Flow Rate</span>
          </button>
          <button
            onClick={() => { onChange(value === "communication" ? null : "communication"); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-secondary/50 transition-colors"
          >
            <div className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${value === "communication" ? "bg-purple-500/20 border-purple-500/40" : "border-input"}`}>
              {value === "communication" && <Check className="h-2.5 w-2.5 text-purple-400" />}
            </div>
            <span className="text-foreground">Communication</span>
          </button>
        </div>
      )}
    </div>
  );
}
