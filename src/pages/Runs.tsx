import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, type TestRun } from "@/lib/db";
import { syncManager } from "@/lib/sync";
import { generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Search, Trash2, X } from "lucide-react";

type RunType = "flow_rate" | "communication";

interface ModalState {
  open: boolean;
  runType: RunType;
}

export default function Runs() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [modal, setModal] = useState<ModalState>({ open: false, runType: "flow_rate" });
  const [searchFlow, setSearchFlow] = useState("");
  const [searchComm, setSearchComm] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    location: "",
    wave_condition: "",
    notes: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    loadRuns();
  }, []);

  async function loadRuns() {
    const data = await db.test_runs.toArray();
    setRuns(data.sort((a, b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity)));
  }

  async function createRun() {
    const now = new Date().toISOString();
    const run: TestRun = {
      id: generateId(),
      title: form.title,
      location: form.location,
      wave_condition: modal.runType === "flow_rate" ? form.wave_condition : "",
      notes: form.notes,
      date: now.split("T")[0] || "",
      k_factor: 450,
      status: "draft",
      run_type: modal.runType,
      sort_order: Date.now(),
      created_at: now,
      updated_at: now,
      synced_at: null,
    };

    await db.test_runs.add(run);
    await syncManager.queueChange("test_runs", "create", run as any);
    setModal({ open: false, runType: "flow_rate" });
    setForm({ title: "", location: "", wave_condition: "", notes: "" });
    await loadRuns();
  }

  async function deleteRun(id: string) {
    const relatedFlow = await db.flow_readings.where("run_id").equals(id).toArray();
    const relatedPower = await db.power_readings.where("run_id").equals(id).toArray();
    const relatedComm = await db.comm_readings.where("run_id").equals(id).toArray();
    for (const r of relatedFlow) await db.flow_readings.delete(r.id);
    for (const r of relatedPower) await db.power_readings.delete(r.id);
    for (const r of relatedComm) await db.comm_readings.delete(r.id);
    await db.test_runs.delete(id);
    await syncManager.queueChange("test_runs", "delete", { id } as any);
    setDeleteTarget(null);
    await loadRuns();
  }

  function openNewRun(type: RunType) {
    setForm({ title: "", location: "", wave_condition: "", notes: "" });
    setModal({ open: true, runType: type });
  }

  const flowRuns = runs.filter((r) => (r.run_type ?? "flow_rate") === "flow_rate");
  const commRuns = runs.filter((r) => r.run_type === "communication");

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Flow Rate Column */}
        <Card className="flex-1 min-w-0 border-blue-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/20 text-[10px] font-bold text-blue-400">F</span>
                Flow Rate Runs
                <span className="text-xs text-muted-foreground font-normal">({flowRuns.length})</span>
              </CardTitle>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => openNewRun("flow_rate")}>
                <Plus className="h-3 w-3" /> New
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search flow runs..." className="pl-7 h-8 text-xs" value={searchFlow} onChange={(e) => setSearchFlow(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <RunList
              runs={flowRuns}
              search={searchFlow}
              emptyMsg="No flow rate runs yet."
              onNavigate={(id) => navigate(`/runs/${id}`)}
              onDelete={(id) => setDeleteTarget(id)}
              onRunsChange={loadRuns}
            />
          </CardContent>
        </Card>

        {/* Communication Column */}
        <Card className="flex-1 min-w-0 border-purple-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-500/20 text-[10px] font-bold text-purple-400">C</span>
                Communication Runs
                <span className="text-xs text-muted-foreground font-normal">({commRuns.length})</span>
              </CardTitle>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => openNewRun("communication")}>
                <Plus className="h-3 w-3" /> New
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search comm runs..." className="pl-7 h-8 text-xs" value={searchComm} onChange={(e) => setSearchComm(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <RunList
              runs={commRuns}
              search={searchComm}
              emptyMsg="No communication runs yet."
              onNavigate={(id) => navigate(`/runs/${id}`)}
              onDelete={(id) => setDeleteTarget(id)}
              onRunsChange={loadRuns}
            />
          </CardContent>
        </Card>
      </div>

      {/* New Run Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setModal({ open: false, runType: "flow_rate" }); }}
        >
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New {modal.runType === "flow_rate" ? "Flow Rate" : "Communication"} Run</h3>
              <button onClick={() => setModal({ open: false, runType: "flow_rate" })} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Pool Test #1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g., USC Pool" />
                </div>
                {modal.runType === "flow_rate" && (
                  <div className="space-y-2">
                    <Label htmlFor="wave">Wave Condition</Label>
                    <Select
                      id="wave"
                      value={form.wave_condition}
                      onChange={(e) => setForm({ ...form, wave_condition: e.target.value })}
                      placeholder="Select condition"
                      options={[
                        { value: "calm", label: "Calm" },
                        { value: "moderate", label: "Moderate" },
                        { value: "rough", label: "Rough" },
                      ]}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any preliminary notes..." />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModal({ open: false, runType: "flow_rate" })}>Cancel</Button>
                <Button onClick={createRun}>Create Run</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Test Run"
        message="This will permanently delete this run and all its readings (flow, power, comm). This cannot be undone."
        onConfirm={() => deleteTarget && deleteRun(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function RunList({
  runs,
  search,
  emptyMsg,
  onNavigate,
  onDelete,
  onRunsChange,
}: {
  runs: TestRun[];
  search: string;
  emptyMsg: string;
  onNavigate: (id: string) => void;
  onDelete: (id: string) => void;
  onRunsChange: () => Promise<void>;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const filtered = runs.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDragDrop(from: number, to: number) {
    const items = [...filtered];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    const updates = items.map((r, i) => ({ ...r, sort_order: i }));
    for (const u of updates) await db.test_runs.put(u);
    await onRunsChange();
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8 px-4">
        {search ? "No runs match your search." : emptyMsg}
      </p>
    );
  }

  return (
    <div className="space-y-0.5 px-2 pb-2">
      {filtered.map((run, idx) => (
        <div
          key={run.id}
          draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
          onDragLeave={() => setDragOverIdx(null)}
          onDrop={async (e) => {
            e.preventDefault();
            if (dragIdx === null || dragIdx === idx) return;
            await handleDragDrop(dragIdx, idx);
            setDragIdx(null);
            setDragOverIdx(null);
          }}
          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
          className={`flex items-center justify-between rounded-lg border p-3 transition-colors cursor-pointer hover:bg-secondary/30 ${
            dragOverIdx === idx ? "border-primary" : "border-border/60"
          }`}
          onClick={() => onNavigate(run.id)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-secondary/50 text-[10px] font-mono font-semibold text-muted-foreground shrink-0">
              {idx + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{run.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {new Date(run.date).toLocaleDateString()} &middot; {run.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {!run.synced_at && <span className="text-[10px] text-yellow-400">Pending</span>}
            <Badge variant={run.status === "completed" ? "success" : "warning"} className="text-[10px] px-1.5 py-0">{run.status}</Badge>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(run.id); }}
              className="text-muted-foreground hover:text-red-400 transition-colors p-0.5"
              title="Delete run"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
