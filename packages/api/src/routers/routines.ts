/**
 * Routines Router
 * 
 * Handles daily/weekly routines and routine logs
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const scheduleSchema = z.object({
  type: z.enum(["daily", "weekly"]),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // For weekly: 0=Sunday, 6=Saturday
});

const routineSchema = z.object({
  title: z.string().max(200),
  schedule: scheduleSchema,
  active: z.boolean().optional(),
});

const routineLogSchema = z.object({
  routineId: z.string().uuid(),
  status: z.enum(["completed", "skipped", "failed"]),
  note: z.string().optional().nullable(),
});

export const routinesRouter = router({
  /**
   * Get all routines for current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("routines")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch routines: ${error.message}`);
    }

    return data;
  }),

  /**
   * Get active routines for current user
   */
  getActive: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("routines")
      .select("*")
      .eq("user_id", ctx.userId)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active routines: ${error.message}`);
    }

    return data;
  }),

  /**
   * Get routine by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("routines")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch routine: ${error.message}`);
      }

      return data;
    }),

  /**
   * Create routine
   */
  create: protectedProcedure
    .input(routineSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("routines")
        .insert({
          user_id: ctx.userId,
          title: input.title,
          schedule: input.schedule,
          active: input.active ?? true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create routine: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update routine
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }).merge(routineSchema.partial())
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const { data, error } = await ctx.supabase
        .from("routines")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", ctx.userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update routine: ${error.message}`);
      }

      return data;
    }),

  /**
   * Delete routine
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("routines")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.userId);

      if (error) {
        throw new Error(`Failed to delete routine: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Log routine completion
   */
  log: protectedProcedure
    .input(routineLogSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify routine belongs to user
      const { data: routine, error: routineError } = await ctx.supabase
        .from("routines")
        .select("id")
        .eq("id", input.routineId)
        .eq("user_id", ctx.userId)
        .single();

      if (routineError || !routine) {
        throw new Error("Routine not found or unauthorized");
      }

      const { data, error } = await ctx.supabase
        .from("routine_logs")
        .insert({
          routine_id: input.routineId,
          user_id: ctx.userId,
          status: input.status,
          note: input.note,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to log routine: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get routine logs
   */
  getLogs: protectedProcedure
    .input(
      z.object({
        routineId: z.string().uuid().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("routine_logs")
        .select("*")
        .eq("user_id", ctx.userId)
        .order("run_at", { ascending: false });

      if (input.routineId) {
        query = query.eq("routine_id", input.routineId);
      }

      if (input.startDate) {
        query = query.gte("run_at", input.startDate.toISOString());
      }

      if (input.endDate) {
        query = query.lte("run_at", input.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch routine logs: ${error.message}`);
      }

      return data;
    }),
});

