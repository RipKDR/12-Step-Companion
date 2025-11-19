/**
 * tRPC Provider Component
 * 
 * Wraps app with tRPC and React Query providers
 */

import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { trpc, getTRPCClient } from "./trpc";
import { QUERY_STALE_TIME_MS, QUERY_GC_TIME_MS } from "@/constants";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_STALE_TIME_MS,
            gcTime: QUERY_GC_TIME_MS,
            refetchOnWindowFocus: false,
            retry: false,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() => getTRPCClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
}

