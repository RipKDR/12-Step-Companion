/**
 * Routines Hook - tRPC Integration
 */

import { trpc } from "@/lib/trpc";

/**
 * Get all routines for current user
 */
export function useRoutines() {
  const { data: routines, isLoading, error } = trpc.routines.getAll.useQuery();

  return {
    routines: routines || [],
    isLoading,
    error,
  };
}

/**
 * Get active routines only
 */
export function useActiveRoutines() {
  const { data: routines, isLoading, error } = trpc.routines.getActive.useQuery();

  return {
    routines: routines || [],
    isLoading,
    error,
  };
}

/**
 * Get routine by ID
 */
export function useRoutine(routineId: string | null) {
  const { data: routine, isLoading, error } = trpc.routines.getById.useQuery(
    { id: routineId! },
    { enabled: !!routineId }
  );

  return {
    routine,
    isLoading,
    error,
  };
}

/**
 * Create routine mutation
 */
export function useCreateRoutine() {
  const utils = trpc.useUtils();

  const mutation = trpc.routines.create.useMutation({
    onSuccess: () => {
      utils.routines.getAll.invalidate();
      utils.routines.getActive.invalidate();
    },
  });

  return mutation;
}

/**
 * Update routine mutation
 */
export function useUpdateRoutine() {
  const utils = trpc.useUtils();

  const mutation = trpc.routines.update.useMutation({
    onSuccess: () => {
      utils.routines.getAll.invalidate();
      utils.routines.getActive.invalidate();
      utils.routines.getById.invalidate();
    },
  });

  return mutation;
}

/**
 * Delete routine mutation
 */
export function useDeleteRoutine() {
  const utils = trpc.useUtils();

  const mutation = trpc.routines.delete.useMutation({
    onSuccess: () => {
      utils.routines.getAll.invalidate();
      utils.routines.getActive.invalidate();
    },
  });

  return mutation;
}

/**
 * Log routine completion mutation
 */
export function useLogRoutine() {
  const utils = trpc.useUtils();

  const mutation = trpc.routines.log.useMutation({
    onSuccess: () => {
      utils.routines.getLogs.invalidate();
    },
  });

  return mutation;
}

/**
 * Get routine logs
 */
export function useRoutineLogs(options?: {
  routineId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const { data: logs, isLoading, error } = trpc.routines.getLogs.useQuery({
    routineId: options?.routineId,
    startDate: options?.startDate,
    endDate: options?.endDate,
  });

  return {
    logs: logs || [],
    isLoading,
    error,
  };
}

