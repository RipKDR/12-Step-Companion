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

export function useStepEntryVersions(stepId: string | null) {
  const { entries } = useStepEntries();

  const versions = entries
    .filter((e) => e.step_id === stepId)
    .sort((a, b) => b.version - a.version);

  return {
    versions,
    isLoading: false,
  };
}

