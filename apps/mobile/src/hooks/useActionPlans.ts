/**
 * Action Plans Hook - tRPC Integration
 */

import { trpc } from "../lib/trpc";

export function useActionPlans() {
  const { data: plans, isLoading, error } = trpc.actionPlans.getAll.useQuery();

  return {
    plans: plans || [],
    isLoading,
    error,
  };
}

export function useActionPlan(planId: string | null) {
  const { data: plan, isLoading, error } = trpc.actionPlans.getById.useQuery(
    { id: planId! },
    { enabled: !!planId }
  );

  return {
    plan,
    isLoading,
    error,
  };
}

export function useCreateActionPlan() {
  const utils = trpc.useUtils();

  const mutation = trpc.actionPlans.create.useMutation({
    onSuccess: () => {
      utils.actionPlans.getAll.invalidate();
    },
  });

  return mutation;
}

export function useUpdateActionPlan() {
  const utils = trpc.useUtils();

  const mutation = trpc.actionPlans.update.useMutation({
    onSuccess: () => {
      utils.actionPlans.getAll.invalidate();
    },
  });

  return mutation;
}

export function useDeleteActionPlan() {
  const utils = trpc.useUtils();

  const mutation = trpc.actionPlans.delete.useMutation({
    onSuccess: () => {
      utils.actionPlans.getAll.invalidate();
    },
  });

  return mutation;
}

