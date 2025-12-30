/**
 * Routines Hook - tRPC Integration
 */

import { trpc } from "../lib/trpc";

export function useRoutines() {
  const { data: routines, isLoading, error } = trpc.routines.getAll.useQuery();

  return {
    routines: routines || [],
    isLoading,
    error,
  };
}

export function useActiveRoutines() {
  const { data: routines, isLoading, error } = trpc.routines.getActive.useQuery();

  return {
    routines: routines || [],
    isLoading,
    error,
  };
}

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

export function useUpdateRoutine() {
  const utils = trpc.useUtils();

  const mutation = trpc.routines.update.useMutation({
    onSuccess: () => {
      utils.routines.getAll.invalidate();
      utils.routines.getActive.invalidate();
    },
  });

  return mutation;
}

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

export function useLogRoutine() {
  const utils = trpc.useUtils();

  const mutation = trpc.routines.log.useMutation({
    onSuccess: () => {
      utils.routines.getAll.invalidate();
      utils.routines.getActive.invalidate();
    },
  });

  return mutation;
}

