/**
 * Trigger Locations Hook - tRPC Integration
 */

import { trpc } from "../lib/trpc";

export function useTriggerLocations() {
  const { data: locations, isLoading, error } = trpc.triggerLocations.getAll.useQuery();

  return {
    locations: locations || [],
    isLoading,
    error,
  };
}

export function useTriggerLocation(locationId: string | null) {
  const { data: location, isLoading, error } = trpc.triggerLocations.getById.useQuery(
    { id: locationId! },
    { enabled: !!locationId }
  );

  return {
    location,
    isLoading,
    error,
  };
}

export function useCreateTriggerLocation() {
  const utils = trpc.useUtils();

  const mutation = trpc.triggerLocations.create.useMutation({
    onSuccess: () => {
      utils.triggerLocations.getAll.invalidate();
    },
  });

  return mutation;
}

export function useUpdateTriggerLocation() {
  const utils = trpc.useUtils();

  const mutation = trpc.triggerLocations.update.useMutation({
    onSuccess: () => {
      utils.triggerLocations.getAll.invalidate();
    },
  });

  return mutation;
}

export function useDeleteTriggerLocation() {
  const utils = trpc.useUtils();

  const mutation = trpc.triggerLocations.delete.useMutation({
    onSuccess: () => {
      utils.triggerLocations.getAll.invalidate();
    },
  });

  return mutation;
}
