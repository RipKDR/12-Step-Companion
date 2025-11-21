import { useSync } from "../hooks/useOfflineMutation";

export function SyncManager() {
  useSync();
  return null;
}

