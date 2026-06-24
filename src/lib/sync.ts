import { db, type TestRun, type FlowReading, type PowerReading, type CommReading, type CodeSnippet, type CodeSnippetVersion } from "./db";
import { isSupabaseReady, getSupabase } from "./supabase";

type TableName =
  | "test_runs"
  | "flow_readings"
  | "power_readings"
  | "comm_readings"
  | "code_snippets"
  | "code_snippet_versions";

interface SyncQueueItem {
  id: string;
  table: TableName;
  action: "create" | "update" | "delete";
  record: Record<string, unknown>;
  timestamp: number;
}

class SyncManager {
  private queue: SyncQueueItem[] = [];
  private isSyncing = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private _ready: boolean | null = null;
  private _flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this._ready = isSupabaseReady();
    setInterval(() => this.trySync(), 10000);
  }

  private debouncedFlush() {
    if (this._flushTimer) clearTimeout(this._flushTimer);
    this._flushTimer = setTimeout(() => { this._flushTimer = null; this.flush(); }, 500);
  }

  get ready() {
    if (this._ready === null) {
      this._ready = isSupabaseReady();
    }
    return this._ready;
  }

  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => { this.listeners.delete(callback); };
  }

  private notify(status: SyncStatus) {
    this.listeners.forEach((cb) => cb(status));
  }

  async queueChange(table: TableName, action: "create" | "update" | "delete", record: Record<string, unknown>) {
    if (!this.ready) return;

    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      table,
      action,
      record,
      timestamp: Date.now(),
    };
    this.queue.push(item);
    this.notify({ pending: this.queue.length, lastSynced: null, ready: true });

    if (navigator.onLine) {
      this.debouncedFlush();
    }
  }

  async trySync() {
    if (!this.ready || !navigator.onLine || this.isSyncing || this.queue.length === 0) return;
    await this.flush();
  }

  private async flush() {
    if (!this.ready || this.isSyncing) return;
    this.isSyncing = true;

    const items = [...this.queue];
    this.queue = [];

    for (const item of items) {
      try {
        await this.syncItem(item);
      } catch {
        this.queue.unshift(item);
        this.notify({ pending: this.queue.length, lastSynced: null, ready: true });
        break;
      }
    }

    this.isSyncing = false;
    this.notify({
      pending: this.queue.length,
      lastSynced: this.queue.length === 0 ? new Date() : null,
      ready: true,
    });
  }

  private async syncItem(item: SyncQueueItem) {
    const supabase = getSupabase();
    const { error } = await supabase.from(item.table).upsert(item.record, { onConflict: "id" });
    if (error) throw error;

    const table = item.table;
    const id = item.record.id as string;

    const now = new Date().toISOString();
    if (table === "test_runs") {
      await db.test_runs.where("id").equals(id).modify({ synced_at: now });
    } else if (table === "flow_readings") {
      await db.flow_readings.where("id").equals(id).modify({ synced_at: now });
    } else if (table === "power_readings") {
      await db.power_readings.where("id").equals(id).modify({ synced_at: now });
    } else if (table === "comm_readings") {
      await db.comm_readings.where("id").equals(id).modify({ synced_at: now });
    } else if (table === "code_snippets") {
      await db.code_snippets.where("id").equals(id).modify({ synced_at: now });
    } else if (table === "code_snippet_versions") {
      await db.code_snippet_versions.where("id").equals(id).modify({ synced_at: now });
    }
  }

  async syncAllUnsynced() {
    if (!this.ready) return;

    const tables: TableName[] = [
      "test_runs",
      "flow_readings",
      "power_readings",
      "comm_readings",
      "code_snippets",
      "code_snippet_versions",
    ];

    for (const table of tables) {
      const unsynced = await (db[table] as any).where("synced_at").equals(null).toArray();
      for (const record of unsynced) {
        await this.queueChange(table, "create", record as Record<string, unknown>);
      }
    }
  }
}

export interface SyncStatus {
  pending: number;
  lastSynced: Date | null;
  ready?: boolean;
}

export const syncManager = new SyncManager();
