/**
 * Challenges Hook
 *
 * React hook for managing daily recovery challenges
 */

import { trpc } from "../lib/trpc";

export function useTodaysChallenge() {
  return trpc.challenges.getTodaysChallenge.useQuery();
}

export function useWeeklyChallenges() {
  return trpc.challenges.getWeeklyChallenges.useQuery();
}

export function useChallengeStreaks() {
  return trpc.challenges.getStreaks.useQuery();
}

export function useChallengeHistory(limit = 30, offset = 0) {
  return trpc.challenges.getHistory.useQuery({ limit, offset });
}

export function useCompleteChallenge() {
  const utils = trpc.useUtils();

  return trpc.challenges.completeChallenge.useMutation({
    onSuccess: () => {
      // Invalidate relevant queries
      utils.challenges.getTodaysChallenge.invalidate();
      utils.challenges.getWeeklyChallenges.invalidate();
      utils.challenges.getStreaks.invalidate();
      utils.challenges.getHistory.invalidate();
    },
  });
}

