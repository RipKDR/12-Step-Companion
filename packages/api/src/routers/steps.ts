/**
 * Steps Router
 *
 * Handles step definitions and user step work entries
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";

const stepEntrySchema = z.object({
  stepId: z.string().uuid(),
  version: z.number().int().positive().optional(),
  content: z.record(z.unknown()),
  isSharedWithSponsor: z.boolean().optional(),
});

export const stepsRouter = router({
  /**
   * Get all steps for a program (public - step definitions are not user-specific)
   */
  getAll: publicProcedure
    .input(z.object({ program: z.enum(["NA", "AA"]) }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("steps")
        .select("*")
        .eq("program", input.program)
        .order("step_number", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch steps: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get step entries for current user
   */
  getEntries: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("step_entries")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch step entries: ${error.message}`);
    }

    return data;
  }),

  /**
   * Get shared step entries for a sponsee
   */
  getSharedEntries: protectedProcedure
    .input(z.object({ sponseeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: isSponsor } = await ctx.supabase.rpc("is_sponsor_of", {
        sponsee_user_id: input.sponseeId,
      });
      if (!isSponsor) {
        throw new Error("Unauthorized: Not an active sponsor");
      }

      const { data, error } = await ctx.supabase
        .from("step_entries")
        .select("*, step:steps(title, step_number)")
        .eq("user_id", input.sponseeId)
        .eq("is_shared_with_sponsor", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch shared step entries: ${error.message}`);
      }

      return data;
    }),

  /**
   * Create or update step entry
   */
  upsertEntry: protectedProcedure
    .input(stepEntrySchema)
    .mutation(async ({ ctx, input }) => {
      // Get current version if exists
      const { data: existing } = await ctx.supabase
        .from("step_entries")
        .select("version")
        .eq("user_id", ctx.userId)
        .eq("step_id", input.stepId)
        .order("version", { ascending: false })
        .limit(1)
        .single();

      const version = input.version ?? (existing?.version ? existing.version + 1 : 1);

      const { data, error } = await ctx.supabase
        .from("step_entries")
        .insert({
          user_id: ctx.userId,
          step_id: input.stepId,
          version,
          content: input.content as unknown as Record<string, unknown>, // JSONB type
          is_shared_with_sponsor: input.isSharedWithSponsor ?? false,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create step entry: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get step entry by ID
   */
  getEntry: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("step_entries")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch step entry: ${error.message}`);
      }

      return data;
    }),
});
