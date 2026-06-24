import { useState, useRef, useEffect, useMemo } from "react";
import type { TestRun } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search } from "lucide-react";

interface Props {
  runs: TestRun[];
  selected: string[];
  onChange: (ids: string[]) => void;
  filter?: string;
}

export function RunSelector({ runs, selected, onChange, filter = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const selectedType = useMemo(() => {
    if (selected.length === 0) return null;
    const first = runs.find((r) => r.id === selected[0]);
    return first?.run_type ?? null;
  }, [selected, runs]);

  const available = useMemo(() => {
    let result = !selectedType ? runs : runs.filter((r) => r.run_type === selectedType);
    if (filter) {
      result = result.filter((r) =>
        r.title.toLowerCase().includes(filter.toLowerCase()) ||
        r.location.toLowerCase().includes(filter.toLowerCase())
      );
    }
    return result;
  }, [runs, selectedType, filter]);

  function clear() {
    onChange([]);
  }

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  const label = selected.length === 0
    ? "Select runs to analyze..."
    : selected.length === 1
      ? runs.find((r) => r.id === selected[0])?.title || "1 run selected"
      : `${selected.length} runs selected`;

  const filtered = query ? available.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.location.toLowerCase().includes(query.toLowerCase())
  ) : available;

  const flowCount = available.filter((r) => r.run_type === "flow_rate").length;
  const commCount = available.filter((r) => r.run_type === "communication").length;

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-secondary/30 transition-colors"
      >
        <span className={cn(selected.length === 0 && "text-muted-foreground", "flex items-center gap-2 truncate")}>
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {selectedType && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${selectedType === "communication" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
              {selectedType === "communication" ? "Comm" : "Flow"}
            </span>
          )}
          {label}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg max-h-80 overflow-hidden">
          <div className="relative border-b border-border">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={selectedType ? `Search ${selectedType === "communication" ? "comm" : "flow"} runs...` : "Search runs..."}
              className="w-full bg-transparent py-2.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-56 overflow-auto">
            {!selectedType && flowCount > 0 && commCount > 0 && (
              <div className="px-3 py-1.5 text-[10px] text-muted-foreground font-medium border-b border-border/50">
                Select a run to filter by type
              </div>
            )}
            {selectedType && selected.length > 0 && (
              <button
                onClick={clear}
                className="w-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors text-left border-b border-border/50"
              >
                Clear selection ({selectedType === "communication" ? "Comm" : "Flow"})
              </button>
            )}
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No runs match your search.</p>
            ) : (
              filtered.map((run) => (
                <button
                  key={run.id}
                  onClick={() => toggle(run.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary/50 transition-colors text-left",
                    selectedType && run.run_type !== selectedType && "opacity-30 pointer-events-none"
                  )}
                >
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border transition-colors shrink-0",
                    selected.includes(run.id) ? "bg-primary border-primary" : "border-input"
                  )}>
                    {selected.includes(run.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm">{run.title}</p>
                      <span className={`text-[9px] font-medium px-1 py-0.5 rounded shrink-0 ${run.run_type === "communication" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {run.run_type === "communication" ? "Comm" : "Flow"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{run.location} &middot; {new Date(run.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{run.status}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
