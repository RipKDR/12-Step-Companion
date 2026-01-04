/**
 * Meetings Router
 *
 * Handles BMLT meeting finder integration
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";

export const meetingsRouter = router({
  /**
   * Search for meetings (BMLT integration)
   */
  search: publicProcedure
    .input(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        radius: z.number().min(1).max(100).optional().default(25), // miles
        program: z.enum(["NA", "AA"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const bmltRoot = process.env.BMLT_ROOT_URL || "https://bmlt.app";
      const url = `${bmltRoot}/client_interface/json/?switcher=GetSearchResults&geo_width=${input.radius}&longitude=${input.lng}&latitude=${input.lat}`;

      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Accept": "application/json",
            "User-Agent": "12-Step-Companion/1.0.0",
          },
        });

        clearTimeout(timeoutId);

        // Check response status
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("BMLT service not found. Please check your BMLT_ROOT_URL configuration.");
          }
          if (response.status >= 500) {
            throw new Error("BMLT service is temporarily unavailable. Please try again later.");
          }
          throw new Error(`BMLT API returned error: ${response.status} ${response.statusText}`);
        }

        // Parse JSON response
        let data: unknown;
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error("Invalid response format from BMLT service. Please try again later.");
        }

        // Define meeting type based on BMLT API structure
        interface BMLTMeeting {
          service_body_bigint?: string;
          id_bigint?: string;
          [key: string]: unknown;
        }

        // Validate and filter meetings
        let meetings: BMLTMeeting[] = [];
        if (Array.isArray(data)) {
          meetings = data;
        } else if (data && typeof data === "object") {
          // Some BMLT endpoints return objects with arrays
          const dataObj = data as Record<string, unknown>;
          const meetingsArray = (dataObj.meetings || dataObj.results) as BMLTMeeting[] | undefined;
          if (Array.isArray(meetingsArray)) {
            meetings = meetingsArray;
          }
        }

        // Filter by program if specified
        if (input.program === "NA") {
          meetings = meetings.filter((m: BMLTMeeting) =>
            m.service_body_bigint === "NA" ||
            String(m.id_bigint || "").startsWith("NA")
          );
        } else if (input.program === "AA") {
          meetings = meetings.filter((m: BMLTMeeting) =>
            m.service_body_bigint === "AA" ||
            String(m.id_bigint || "").startsWith("AA")
          );
        }

        return meetings;
      } catch (error) {
        // Handle specific error types
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new Error("Request to BMLT service timed out. Please try again.");
          }
          if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
            throw new Error("Unable to connect to BMLT service. Please check your internet connection and try again.");
          }
          throw error;
        }
        throw new Error("An unexpected error occurred while fetching meetings. Please try again later.");
      }
    }),

  /**
   * Get meeting details by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const bmltRoot = process.env.BMLT_ROOT_URL || "https://bmlt.app";
      const url = `${bmltRoot}/client_interface/json/?switcher=GetSearchResults&meeting_ids[]=${encodeURIComponent(input.id)}`;

      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Accept": "application/json",
            "User-Agent": "12-Step-Companion/1.0.0",
          },
        });

        clearTimeout(timeoutId);

        // Check response status
        if (!response.ok) {
          if (response.status === 404) {
            return null; // Meeting not found
          }
          if (response.status >= 500) {
            throw new Error("BMLT service is temporarily unavailable. Please try again later.");
          }
          throw new Error(`BMLT API returned error: ${response.status} ${response.statusText}`);
        }

        // Parse JSON response
        let data: unknown;
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error("Invalid response format from BMLT service.");
        }

        // Handle array or object response
        if (Array.isArray(data)) {
          return data[0] || null;
        }
        if (data && typeof data === "object") {
          const dataObj = data as Record<string, unknown>;
          const meetings = (dataObj.meetings || dataObj.results || []) as BMLTMeeting[];
          return Array.isArray(meetings) ? meetings[0] || null : null;
        }

        return null;
      } catch (error) {
        // Handle specific error types
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new Error("Request to BMLT service timed out. Please try again.");
          }
          if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
            throw new Error("Unable to connect to BMLT service. Please check your internet connection.");
          }
          throw error;
        }
        throw new Error("An unexpected error occurred while fetching meeting details.");
      }
    }),
});

