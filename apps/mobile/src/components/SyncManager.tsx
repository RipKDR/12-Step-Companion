import { useEffect } from "react";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Sync Manager Component
 *
 * Handles automatic sync when connection is restored
 */
export function SyncManager() {
  const { isOnline, sync, lastSyncTime } = useOfflineSync();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Sync when coming back online
    if (isOnline && lastSyncTime === null) {
      sync();
    }
  }, [isOnline, lastSyncTime, sync]);

  // Configure TanStack Query for offline support
  useEffect(() => {
    // Set retry configuration for offline scenarios
    queryClient.setDefaultOptions({
      queries: {
        retry: (failureCount, error: any) => {
          // Retry on network errors
          if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
            return failureCount < 3;
          }
          return false;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    });
  }, [queryClient]);

  return null;
}

