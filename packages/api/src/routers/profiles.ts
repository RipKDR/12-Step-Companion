/**
 * Profiles Router
 * 
 * Handles user profile CRUD operations
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const profileSchema = z.object({
  handle: z.string().max(50).optional(),
  timezone: z.string().max(50).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  cleanDate: z.date().optional().nullable(),
  program: z.enum(["NA", "AA"]).optional().nullable(),
});

export const profilesRouter = router({
  /**
   * Get current user's profile
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", ctx.userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }),

  /**
   * Create or update profile
   */
  upsert: protectedProcedure
    .input(profileSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("profiles")
        .upsert({
          user_id: ctx.userId,
          ...input,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upsert profile: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get profile by handle (for sponsor lookup)
   */
  getByHandle: protectedProcedure
    .input(z.object({ handle: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("profiles")
        .select("id, handle, avatar_url")
        .eq("handle", input.handle)
        .single();

      if (error) {
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }

      return data;
    }),
});

