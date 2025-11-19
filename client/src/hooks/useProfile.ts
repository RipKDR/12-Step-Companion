/**
 * Profile Hook - tRPC Integration
 */

import { trpc } from "@/lib/trpc";

/**
 * Get current user's profile
 */
export function useProfile() {
  const { data: profile, isLoading, error } = trpc.profiles.get.useQuery();

  return {
    profile,
    isLoading,
    error,
  };
}

/**
 * Update profile mutation
 */
export function useUpdateProfile() {
  const utils = trpc.useUtils();

  const mutation = trpc.profiles.upsert.useMutation({
    onSuccess: () => {
      utils.profiles.get.invalidate();
    },
  });

  return mutation;
}

/**
 * Get profile by handle (for sponsor lookup)
 */
export function useProfileByHandle(handle: string | null) {
  const { data: profile, isLoading, error } = trpc.profiles.getByHandle.useQuery(
    { handle: handle! },
    { enabled: !!handle }
  );

  return {
    profile,
    isLoading,
    error,
  };
}

