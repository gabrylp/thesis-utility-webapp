import { useSync } from "@/hooks/useSync";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { isSupabaseReady } from "@/lib/supabase";
import { Cloud, CloudOff, AlertCircle, CheckCircle2, Database } from "lucide-react";

export function SyncBadge() {
  const { pending, lastSynced } = useSync();
  const isOnline = useOnlineStatus();
  const supabaseReady = isSupabaseReady();

  if (!supabaseReady) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Database className="h-3.5 w-3.5" />
        <span>Local only</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-400">
        <CloudOff className="h-3.5 w-3.5" />
        <span>Offline</span>
      </div>
    );
  }

  if (pending > 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-yellow-400">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>{pending} pending</span>
      </div>
    );
  }

  if (lastSynced) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Synced</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Cloud className="h-3.5 w-3.5" />
      <span>Connecting...</span>
    </div>
  );
}
