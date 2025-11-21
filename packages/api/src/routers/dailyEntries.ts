/**
 * Daily Entries Router
 * 
 * Handles daily recovery log entries
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const dailyEntrySchema = z.object({
  entryDate: z.date().optional(),
  cravingsIntensity: z.number().int().min(0).max(10).optional().nullable(),
  feelings: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
  copingActions: z.array(z.string()).optional(),
  gratitude: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  shareWithSponsor: z.boolean().optional(),
});

export const dailyEntriesRouter = router({
  /**
   * Get all daily entries for current user
   */
  getAll: protectedProcedure
    .input(
      z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", ctx.userId)
        .order("entry_date", { ascending: false });

      if (input?.startDate) {
        query = query.gte("entry_date", input.startDate.toISOString());
      }

      if (input?.endDate) {
        query = query.lte("entry_date", input.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch daily entries: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get shared daily entries for a sponsee
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
        .from("daily_entries")
        .select("*")
        .eq("user_id", input.sponseeId)
        .eq("share_with_sponsor", true)
        .order("entry_date", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch shared daily entries: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get daily entry by date
   */
  getByDate: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await ctx.supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", ctx.userId)
        .gte("entry_date", startOfDay.toISOString())
        .lte("entry_date", endOfDay.toISOString())
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw new Error(`Failed to fetch daily entry: ${error.message}`);
      }

      return data;
    }),

  /**
   * Create or update daily entry
   */
  upsert: protectedProcedure
    .input(dailyEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const entryDate = input.entryDate ?? new Date();
      const startOfDay = new Date(entryDate);
      startOfDay.setHours(0, 0, 0, 0);

      const { data, error } = await ctx.supabase
        .from("daily_entries")
        .upsert({
          user_id: ctx.userId,
          entry_date: startOfDay.toISOString(),
          cravings_intensity: input.cravingsIntensity,
          feelings: input.feelings ?? [],
          triggers: input.triggers ?? [],
          coping_actions: input.copingActions ?? [],
          gratitude: input.gratitude,
          notes: input.notes,
          share_with_sponsor: input.shareWithSponsor ?? false,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upsert daily entry: ${error.message}`);
      }

      return data;
    }),

  /**
   * Delete daily entry
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("daily_entries")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.userId);

      if (error) {
        throw new Error(`Failed to delete daily entry: ${error.message}`);
      }

      return { success: true };
    }),
});
