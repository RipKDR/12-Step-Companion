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
        lat: z.number(),
        lng: z.number(),
        radius: z.number().optional().default(25), // miles
        program: z.enum(["NA", "AA"]).optional(),
      })
    )
    .query(async ({ input }) => {
      // BMLT Semantic API integration
      // This is a placeholder - implement actual BMLT API call
      const bmltRoot = process.env.BMLT_ROOT_URL || "https://bmlt.app";
      const url = `${bmltRoot}/client_interface/json/?switcher=GetSearchResults&geo_width=${input.radius}&longitude=${input.lng}&latitude=${input.lat}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        // Filter by program if specified
        let meetings = data;
        if (input.program === "NA") {
          meetings = data.filter((m: any) => m.service_body_bigint === "NA");
        } else if (input.program === "AA") {
          meetings = data.filter((m: any) => m.service_body_bigint === "AA");
        }

        return meetings;
      } catch (error) {
        throw new Error(`Failed to fetch meetings: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  /**
   * Get meeting details by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const bmltRoot = process.env.BMLT_ROOT_URL || "https://bmlt.app";
      const url = `${bmltRoot}/client_interface/json/?switcher=GetSearchResults&meeting_ids[]=${input.id}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        return data[0] || null;
      } catch (error) {
        throw new Error(`Failed to fetch meeting: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),
});

