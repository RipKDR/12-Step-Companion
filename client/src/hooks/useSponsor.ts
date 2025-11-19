/**
 * Sponsor Hook - tRPC Integration Example
 * 
 * Example hook showing how to use tRPC for sponsor connections
 */

import { trpc } from "@/lib/trpc";
import { useState } from "react";

/**
 * Get sponsor relationships for current user
 */
export function useSponsorRelationships() {
  const { data: relationships, isLoading, error } = trpc.sponsor.getRelationships.useQuery();

  return {
    relationships: relationships || [],
    isLoading,
    error,
  };
}

/**
 * Generate sponsor code mutation
 */
export function useGenerateSponsorCode() {
  const mutation = trpc.sponsor.generateCode.useMutation();

  return mutation;
}

/**
 * Connect to sponsor using code mutation
 */
export function useConnectToSponsor() {
  const utils = trpc.useUtils();

  const mutation = trpc.sponsor.connect.useMutation({
    onSuccess: () => {
      // Refresh relationships after connecting
      utils.sponsor.getRelationships.invalidate();
    },
  });

  return mutation;
}

/**
 * Accept sponsor relationship mutation
 */
export function useAcceptSponsorRelationship() {
  const utils = trpc.useUtils();

  const mutation = trpc.sponsor.accept.useMutation({
    onSuccess: () => {
      utils.sponsor.getRelationships.invalidate();
    },
  });

  return mutation;
}

/**
 * Revoke sponsor relationship mutation
 */
export function useRevokeSponsorRelationship() {
  const utils = trpc.useUtils();

  const mutation = trpc.sponsor.revoke.useMutation({
    onSuccess: () => {
      utils.sponsor.getRelationships.invalidate();
    },
  });

  return mutation;
}

/**
 * Hook for managing sponsor code generation and connection
 */
export function useSponsorConnection() {
  const [code, setCode] = useState<string | null>(null);
  const generateCode = useGenerateSponsorCode();
  const connect = useConnectToSponsor();

  const handleGenerateCode = async () => {
    try {
      const result = await generateCode.mutateAsync();
      setCode(result.code);
      return result.code;
    } catch (error) {
      console.error("Failed to generate sponsor code:", error);
      throw error;
    }
  };

  const handleConnect = async (sponsorCode: string) => {
    try {
      const result = await connect.mutateAsync({ code: sponsorCode });
      return result;
    } catch (error) {
      console.error("Failed to connect to sponsor:", error);
      throw error;
    }
  };

  return {
    code,
    generateCode: handleGenerateCode,
    connect: handleConnect,
    isGenerating: generateCode.isPending,
    isConnecting: connect.isPending,
  };
}

