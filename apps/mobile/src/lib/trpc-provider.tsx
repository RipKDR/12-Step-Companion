/**
 * tRPC Provider for React Native
 * 
 * Wraps app with tRPC and React Query providers
 */

import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { trpc, getTRPCClient } from "./trpc";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
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

