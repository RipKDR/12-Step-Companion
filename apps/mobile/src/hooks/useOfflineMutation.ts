import { useState, useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Network from "expo-network";
import { addToQueue, MutationType, processQueue } from "../lib/sync-engine";

/**
 * Hook to handle offline mutations
 * 
 * Wraps a tRPC mutation to automatically queue it if offline.
 * 
 * @param path The tRPC mutation path (e.g. "dailyEntries.create")
 * @param trpcHookResult The result of calling trpc.[path].useMutation()
 */
export function useOfflineMutation<TData, TError, TVariables>(
  path: MutationType,
  trpcHookResult: {
    mutate: (variables: TVariables, options?: any) => void;
    mutateAsync: (variables: TVariables, options?: any) => Promise<TData>;
    isPending: boolean;
    error: TError | null;
    [key: string]: any;
  }
) {
  const [isOffline, setIsOffline] = useState(false);

  // Check network status on mount and resume
  useEffect(() => {
    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsOffline(!state.isConnected || !state.isInternetReachable);
      if (state.isConnected && state.isInternetReachable) {
        processQueue();
      }
    };

    checkNetwork();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkNetwork();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const mutateOffline = async (variables: TVariables, options?: any) => {
    const state = await Network.getNetworkStateAsync();
    
    if (!state.isConnected || !state.isInternetReachable) {
      await addToQueue(path, variables);
      // Call onSuccess if provided to simulate success (optimistic UI update)
      options?.onSuccess?.({ offline: true } as any, variables, undefined);
      return { offline: true } as any;
    }
    
    return trpcHookResult.mutateAsync(variables, options);
  };

  return {
    ...trpcHookResult,
    mutate: (variables: TVariables, options?: any) => {
      mutateOffline(variables, options).catch(console.error);
    },
    mutateAsync: mutateOffline,
    isOffline // expose status so UI can show "Saved Offline" badge
  };
}

/**
 * Hook to globally sync when coming online
 * Use this in the root layout
 */
export function useSync() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        processQueue();
      }
    });
    
    // Initial check
    processQueue();

    return () => {
      subscription.remove();
    };
  }, []);
}

