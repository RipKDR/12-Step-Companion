/**
 * Meetings Hook for Mobile - tRPC Integration
 */

import { trpc } from "../lib/trpc";

export function useMeetingSearch(options: {
  lat: number;
  lng: number;
  radius?: number;
  program?: "NA" | "AA";
}) {
  const { data: meetings, isLoading, error } = trpc.meetings.search.useQuery({
    lat: options.lat,
    lng: options.lng,
    radius: options.radius || 25,
    program: options.program,
  });

  return {
    meetings: meetings || [],
    isLoading,
    error,
  };
}

