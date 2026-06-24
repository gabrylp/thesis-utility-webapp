import { useState, useEffect, useRef } from "react";
import { db, type TestRun, type FlowReading, type PowerReading, type CommReading } from "@/lib/db";
import { computeStats, formatNum } from "@/lib/stats";
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
import { Activity, Droplets, Battery, Beaker, BarChart3, ChartLine, Sun, Moon, Radio, Signal, Wifi, Settings2, Filter, Check, ChevronDown } from "lucide-react";

export default function Analysis() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [flowReadings, setFlowReadings] = useState<FlowReading[]>([]);
  const [powerReadings, setPowerReadings] = useState<PowerReading[]>([]);
  const [commReadings, setCommReadings] = useState<CommReading[]>([]);
  const [chartTheme, setChartTheme] = useState<"dark" | "light">("dark");
  const [typeFilter, setTypeFilter] = useState<"flow_rate" | "communication" | null>(null);

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

  const totalFlowRate = flowReadings.map((r) => r.flow_rate_lh);
  const flowStats = computeStats(totalFlowRate);
  const totalHours = flowReadings.length > 0
    ? Math.max(...flowReadings.map((r) => r.time_sec)) / 3600
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2">
        <div className="flex-1 max-w-md">
          <p className="text-sm text-muted-foreground mb-2">
            Select one or more test runs to analyze.
          </p>
          <RunSelector runs={filteredRuns} selected={selectedIds} onChange={setSelectedIds} />
        </div>
        <FilterDropdown value={typeFilter} onChange={setTypeFilter} />
      </div>

      {selectedIds.length === 0 ? (
        <Card><CardContent><p className="text-sm text-muted-foreground text-center py-12">Select a test run above.</p></CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Flow Readings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{flowReadings.length}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Comm Readings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{commReadings.length}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Power Readings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{powerReadings.length}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Selected Runs</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{selectedIds.length}</p></CardContent></Card>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => setChartTheme(chartTheme === "dark" ? "light" : "dark")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {chartTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {chartTheme === "dark" ? "Light" : "Dark"} Chart
            </button>
          </div>

          <Tabs defaultValue={hasFlow ? "flow" : "rtt"}>
            <TabsList>
              {hasFlow && (
                <>
                  <TabsTrigger value="flow"><Activity className="h-4 w-4 mr-1.5" />Flow Rate</TabsTrigger>
                  <TabsTrigger value="volume"><Droplets className="h-4 w-4 mr-1.5" />Volume</TabsTrigger>
                  <TabsTrigger value="power"><Battery className="h-4 w-4 mr-1.5" />Power</TabsTrigger>
                  <TabsTrigger value="sensor"><Beaker className="h-4 w-4 mr-1.5" />Sensor t-Test</TabsTrigger>
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

            {hasFlow && (
              <>
                <TabsContent value="flow" className="space-y-6">
                  <FlowRateChart readings={flowReadings} title="Flow Rate Over Time" theme={chartTheme} />
                  <FlowStats readings={flowReadings} label="Flow Rate Statistics by Method" />
                </TabsContent>

                <TabsContent value="volume" className="space-y-6">
                  <VolumeChart readings={flowReadings} title="Accumulated Sampling Volume" theme={chartTheme} />
                </TabsContent>

                <TabsContent value="power" className="space-y-6">
                  <BatteryChart readings={powerReadings} title="Power Monitoring" theme={chartTheme} />
                </TabsContent>

                <TabsContent value="sensor" className="space-y-6">
                  <SensorComparison readings={flowReadings} title="With Sensor vs Without Sensor Comparison" theme={chartTheme} />
                </TabsContent>

                <TabsContent value="custom" className="space-y-6">
                  <CustomChart flowReadings={flowReadings} powerReadings={powerReadings} runs={selectedRuns} title="Custom Graph Builder" theme={chartTheme} />
                </TabsContent>

                <TabsContent value="projection" className="space-y-6">
                  <ProjectionCard
                    avgFlowRate={flowStats.mean}
                    actualHours={totalHours || 0.5}
                    moe={flowStats.marginOfError}
                  />
                </TabsContent>
              </>
            )}

            {hasComm && (
              <>
                <TabsContent value="rtt" className="space-y-6">
                  <RTTChart readings={commReadings} title="Round-Trip Time Analysis" theme={chartTheme} />
                </TabsContent>

                <TabsContent value="signal" className="space-y-6">
                  <SignalChart readings={commReadings} title="Signal Strength vs Distance" theme={chartTheme} />
                </TabsContent>

                <TabsContent value="packet_loss" className="space-y-6">
                  <PacketLossChart readings={commReadings} title="Packet Loss Analysis" theme={chartTheme} />
                  <CommStats readings={commReadings} />
                </TabsContent>

                <TabsContent value="custom_comm" className="space-y-6">
                  <CustomCommChart readings={commReadings} title="Custom Comm Graph Builder" theme={chartTheme} />
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
    <div ref={ref} className="relative shrink-0 mt-7">
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
