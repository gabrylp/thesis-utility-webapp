import { useState, useEffect } from "react";
import { db, type CodeSnippet } from "@/lib/db";
import { syncManager } from "@/lib/sync";
import { generateId, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Download, Search, Copy, Check, Trash2 } from "lucide-react";

const subsystems = [
  { value: "propulsion", label: "Propulsion (VSP)" },
  { value: "sampling", label: "Sampling (Pump/Filter)" },
  { value: "navigation", label: "Navigation (LoRa)" },
  { value: "power", label: "Power Distribution" },
  { value: "controller", label: "Handheld Controller" },
  { value: "general", label: "General/Utility" },
];

export default function Code() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [search, setSearch] = useState("");
  const [filterSubsystem, setFilterSubsystem] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    filename: "",
    content: "",
    subsystem: "general",
  });

  useEffect(() => {
    loadSnippets();
  }, []);

  async function loadSnippets() {
    const data = await db.code_snippets.toArray();
    setSnippets(data.sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
  }

  async function createSnippet() {
    const now = new Date().toISOString();
    const snippet: CodeSnippet = {
      id: generateId(),
      ...form,
      version: 1,
      created_at: now,
      updated_at: now,
      synced_at: null,
    };
    await db.code_snippets.add(snippet);
    await syncManager.queueChange("code_snippets", "create", snippet as any);
    setShowForm(false);
    setForm({ title: "", description: "", filename: "", content: "", subsystem: "general" });
    await loadSnippets();
  }

  async function updateSnippet(id: string, updates: Partial<CodeSnippet>) {
    const existing = await db.code_snippets.get(id);
    if (!existing) return;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    await db.code_snippets.put(updated);
    await syncManager.queueChange("code_snippets", "update", updated as any);
    setSnippets(snippets.map((s) => (s.id === id ? updated : s)));
  }

  async function deleteSnippet(id: string) {
    await db.code_snippets.delete(id);
    await syncManager.queueChange("code_snippets", "delete", { id } as any);
    setDeleteTarget(null);
    await loadSnippets();
  }

  async function copyContent(content: string, id: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function downloadSnippet(snippet: CodeSnippet) {
    const blob = new Blob([snippet.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = snippet.filename || `${snippet.title.replace(/\s+/g, "_")}.ino`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredSnippets = snippets.filter(
    (s) =>
      (s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())) &&
      (!filterSubsystem || s.subsystem === filterSubsystem)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search snippets..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select
            value={filterSubsystem}
            onChange={(e) => setFilterSubsystem(e.target.value)}
            placeholder="All subsystems"
            options={subsystems}
            className="w-48"
          />
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> New Snippet
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Code Snippet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="stitle">Title</Label>
                <Input id="stitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., LoRa Init" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sfile">Filename</Label>
                <Input id="sfile" value={form.filename} onChange={(e) => setForm({ ...form, filename: e.target.value })} placeholder="lora_init.ino" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ssub">Subsystem</Label>
                <Select id="ssub" value={form.subsystem} onChange={(e) => setForm({ ...form, subsystem: e.target.value })} options={subsystems} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sdesc">Description</Label>
              <Input id="sdesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this snippet..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scontent">Code</Label>
              <Textarea
                id="scontent"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Paste your Arduino code here..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={createSnippet}>Save Snippet</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredSnippets.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              {search || filterSubsystem ? "No snippets match your filters." : "No code snippets yet. Click 'New Snippet' to add your Arduino code."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSnippets.map((snippet) => (
            <Card key={snippet.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{snippet.title}</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">
                        {subsystems.find((s) => s.value === snippet.subsystem)?.label || snippet.subsystem}
                      </Badge>
                      {!snippet.synced_at && (
                        <span className="text-[10px] text-yellow-400">Pending</span>
                      )}
                    </div>
                    {snippet.description && (
                      <p className="text-sm text-muted-foreground mt-1">{snippet.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {snippet.filename} &middot; v{snippet.version} &middot; {formatDateTime(snippet.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => copyContent(snippet.content, snippet.id)} title="Copy">
                      {copiedId === snippet.id ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => downloadSnippet(snippet)} title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(snippet.id)} title="Delete" className="hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setExpanded(expanded === snippet.id ? null : snippet.id)}
                  className="text-xs text-muted-foreground hover:text-primary mb-2"
                >
                  {expanded === snippet.id ? "Collapse" : "Show code"}
                </button>
                {expanded === snippet.id && (
                  <pre className="rounded-lg bg-black/40 p-4 overflow-x-auto">
                    <code className="text-sm font-mono text-green-400 whitespace-pre-wrap">{snippet.content}</code>
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Code Snippet"
        message="This will permanently delete this snippet and all its versions. This cannot be undone."
        onConfirm={() => deleteTarget && deleteSnippet(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
