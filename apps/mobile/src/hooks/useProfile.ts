/**
 * Profile Hook for Mobile - tRPC Integration
 */

import { trpc } from "../lib/trpc";

export function useProfile() {
  const { data: profile, isLoading, error } = trpc.profiles.get.useQuery();

  return {
    profile,
    isLoading,
    error,
  };
}

export function useUpdateProfile() {
  const utils = trpc.useUtils();

  const mutation = trpc.profiles.upsert.useMutation({
    onSuccess: () => {
      utils.profiles.get.invalidate();
    },
  });

  return mutation;
}

