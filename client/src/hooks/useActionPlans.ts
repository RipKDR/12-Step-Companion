/**
 * Action Plans Hook - tRPC Integration
 */

import { trpc } from "@/lib/trpc";

/**
 * Get all action plans for current user
 */
export function useActionPlans() {
  const { data: plans, isLoading, error } = trpc.actionPlans.getAll.useQuery();

  return {
    plans: plans || [],
    isLoading,
    error,
  };
}

/**
 * Get action plan by ID
 */
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

/**
 * Create action plan mutation
 */
export function useCreateActionPlan() {
  const utils = trpc.useUtils();

  const mutation = trpc.actionPlans.create.useMutation({
    onSuccess: () => {
      utils.actionPlans.getAll.invalidate();
    },
  });

  return mutation;
}

/**
 * Update action plan mutation
 */
export function useUpdateActionPlan() {
  const utils = trpc.useUtils();

  const mutation = trpc.actionPlans.update.useMutation({
    onSuccess: () => {
      utils.actionPlans.getAll.invalidate();
      utils.actionPlans.getById.invalidate();
    },
  });

  return mutation;
}

/**
 * Delete action plan mutation
 */
export function useDeleteActionPlan() {
  const utils = trpc.useUtils();

  const mutation = trpc.actionPlans.delete.useMutation({
    onSuccess: () => {
      utils.actionPlans.getAll.invalidate();
    },
  });

  return mutation;
}

