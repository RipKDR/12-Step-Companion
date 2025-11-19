/**
 * Steps Hook - tRPC Integration Example
 * 
 * Example hook showing how to use tRPC for steps data
 * This can replace the existing loadStepContent/loadAllSteps pattern
 */

import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

/**
 * Get all steps for a program (NA or AA)
 */
export function useSteps(program: "NA" | "AA" = "NA") {
  const { data: steps, isLoading, error } = trpc.steps.getAll.useQuery({ program });

  return {
    steps: steps || [],
    isLoading,
    error,
  };
}

/**
 * Get step entries for current user
 */
export function useStepEntries() {
  const { data: entries, isLoading, error } = trpc.steps.getEntries.useQuery();

  return {
    entries: entries || [],
    isLoading,
    error,
  };
}

/**
 * Get a specific step entry
 */
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

/**
 * Mutation hook for creating/updating step entries
 */
export function useUpsertStepEntry() {
  const utils = trpc.useUtils();

  const mutation = trpc.steps.upsertEntry.useMutation({
    onSuccess: () => {
      // Invalidate and refetch step entries
      utils.steps.getEntries.invalidate();
    },
  });

  return mutation;
}

/**
 * Get steps with completion status
 */
export function useStepsWithProgress(program: "NA" | "AA" = "NA") {
  const { steps, isLoading: stepsLoading } = useSteps(program);
  const { entries, isLoading: entriesLoading } = useStepEntries();

  const stepsWithProgress = useMemo(() => {
    if (!steps || !entries) return [];

    return steps.map((step) => {
      const stepEntries = entries.filter((e) => e.step_id === step.id);
      const latestEntry = stepEntries.sort((a, b) => b.version - a.version)[0];

      return {
        ...step,
        hasEntry: !!latestEntry,
        latestVersion: latestEntry?.version || 0,
        isSharedWithSponsor: latestEntry?.is_shared_with_sponsor || false,
      };
    });
  }, [steps, entries]);

  return {
    steps: stepsWithProgress,
    isLoading: stepsLoading || entriesLoading,
  };
}

