import { useState, useEffect } from "react";
import { syncManager, type SyncStatus } from "@/lib/sync";

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>({ pending: 0, lastSynced: null });

  useEffect(() => {
    const unsub = syncManager.subscribe(setStatus);
    return () => { unsub(); };
  }, []);

  return status;
}
