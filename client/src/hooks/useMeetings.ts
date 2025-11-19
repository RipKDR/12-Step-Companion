/**
 * Meetings Hook - tRPC Integration
 */

import { trpc } from "@/lib/trpc";

/**
 * Search for meetings using BMLT
 */
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

/**
 * Get meeting by ID
 */
export function useMeeting(meetingId: string | null) {
  const { data: meeting, isLoading, error } = trpc.meetings.getById.useQuery(
    { id: meetingId! },
    { enabled: !!meetingId }
  );

  return {
    meeting,
    isLoading,
    error,
  };
}

