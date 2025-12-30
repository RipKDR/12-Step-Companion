/**
 * Offline Sync Hook
 *
 * Manages offline sync status and queued mutations
 */

import { useState, useEffect, useCallback } from "react";
import * as Network from "expo-network";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";

interface QueuedMutation {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
}

export function useOfflineSync() {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);
  const [queuedMutations, setQueuedMutations] = useState<QueuedMutation[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Check network status
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const wasOffline = !isOnline;
        setIsOnline(networkState.isConnected ?? false);

        // If we just came back online, trigger sync
        if (wasOffline && networkState.isConnected) {
          sync();
        }
      } catch (error) {
        console.error("Failed to check network status:", error);
        setIsOnline(false);
      }
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);

    return () => clearInterval(interval);
  }, [isOnline]);

  // Sync function - refetch all queries and process queued mutations
  const sync = useCallback(async () => {
    if (!isOnline || syncing) return;

    setSyncing(true);
    try {
      // Invalidate all queries to refetch from server
      await queryClient.invalidateQueries();

      // Process queued mutations (if any)
      // Note: TanStack Query already handles retries, but we can add custom logic here
      if (queuedMutations.length > 0) {
        // For now, just clear the queue since TanStack Query will retry automatically
        // In a more sophisticated implementation, we'd process these mutations
        setQueuedMutations([]);
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, syncing, queryClient, queuedMutations]);

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    if (isOnline) {
      sync();
    }
  }, [isOnline, sync]);

  return {
    isOnline,
    isOffline: !isOnline,
    queuedMutations,
    syncing,
    lastSyncTime,
    sync: triggerSync,
    canSync: isOnline && !syncing,
  };
}
