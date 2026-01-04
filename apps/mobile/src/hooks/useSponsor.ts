/**
 * Sponsor Hook - tRPC Integration
 */

import { trpc } from "../lib/trpc";

export function useSponsorRelationships() {
  const { data: relationships, isLoading, error } = trpc.sponsor.getRelationships.useQuery();

  return {
    relationships: relationships || [],
    isLoading,
    error,
  };
}

export function useGenerateSponsorCode() {
  const utils = trpc.useUtils();

  const mutation = trpc.sponsor.generateCode.useMutation({
    onSuccess: () => {
      utils.sponsor.getRelationships.invalidate();
    },
  });

  return mutation;
}

export function useConnectSponsor() {
  const utils = trpc.useUtils();

  const mutation = trpc.sponsor.connect.useMutation({
    onSuccess: () => {
      utils.sponsor.getRelationships.invalidate();
    },
  });

  return mutation;
}

export function useAcceptSponsorRelationship() {
  const utils = trpc.useUtils();

  const mutation = trpc.sponsor.accept.useMutation({
    onSuccess: () => {
      utils.sponsor.getRelationships.invalidate();
    },
  });

  return mutation;
}

export function useRevokeSponsorRelationship() {
  const utils = trpc.useUtils();

  const mutation = trpc.sponsor.revoke.useMutation({
    onSuccess: () => {
      utils.sponsor.getRelationships.invalidate();
    },
  });

  return mutation;
}

