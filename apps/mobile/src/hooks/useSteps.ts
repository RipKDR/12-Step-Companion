/**
 * Steps Hook for Mobile - tRPC Integration
 */

import { trpc } from "../lib/trpc";
import { useMemo } from "react";

export function useSteps(program: "NA" | "AA" = "NA") {
  const { data: steps, isLoading, error } = trpc.steps.getAll.useQuery({ program });

  return {
    steps: steps || [],
    isLoading,
    error,
  };
}

export function useStepEntries() {
  const { data: entries, isLoading, error } = trpc.steps.getEntries.useQuery();

  return {
    entries: entries || [],
    isLoading,
    error,
  };
}

export function useStepEntry(entryId: string | null) {
  const { data: entry, isLoading, error } = trpc.steps.getEntry.useQuery(
    { id: entryId! },
    { enabled: !!entryId }
  );

  return {
    entry,
    isLoading,
    error,
  };
}

export function useUpsertStepEntry() {
  const utils = trpc.useUtils();

  const mutation = trpc.steps.upsertEntry.useMutation({
    onSuccess: () => {
      utils.steps.getEntries.invalidate();
    },
  });

  return mutation;
}

