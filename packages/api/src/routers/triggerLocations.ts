/**
 * Trigger Locations Router
 *
 * Handles geofenced trigger locations CRUD operations
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const createTriggerLocationSchema = z.object({
  label: z.string().min(1).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusM: z.number().int().min(50).max(10000).default(50),
  onEnter: z.array(z.string()).default([]),
  onExit: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

const updateTriggerLocationSchema = createTriggerLocationSchema.partial().extend({
  id: z.string().uuid(),
});

export const triggerLocationsRouter = router({
  /**
   * Get all trigger locations for current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("trigger_locations")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch trigger locations: ${error.message}`);
    }

    return data;
  }),

  /**
   * Get trigger location by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("trigger_locations")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch trigger location: ${error.message}`);
      }

      return data;
    }),

  /**
   * Create a new trigger location
   */
  create: protectedProcedure
    .input(createTriggerLocationSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("trigger_locations")
        .insert({
          user_id: ctx.userId,
          label: input.label,
          lat: input.lat,
          lng: input.lng,
          radius_m: input.radiusM,
          on_enter: input.onEnter,
          on_exit: input.onExit,
          active: input.active,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create trigger location: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update an existing trigger location
   */
  update: protectedProcedure
    .input(updateTriggerLocationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const updateData: Record<string, unknown> = {};
      if (updates.label !== undefined) updateData.label = updates.label;
      if (updates.lat !== undefined) updateData.lat = updates.lat;
      if (updates.lng !== undefined) updateData.lng = updates.lng;
      if (updates.radiusM !== undefined) updateData.radius_m = updates.radiusM;
      if (updates.onEnter !== undefined) updateData.on_enter = updates.onEnter;
      if (updates.onExit !== undefined) updateData.on_exit = updates.onExit;
      if (updates.active !== undefined) updateData.active = updates.active;

      const { data, error } = await ctx.supabase
        .from("trigger_locations")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", ctx.userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update trigger location: ${error.message}`);
      }

      return data;
    }),

  /**
   * Delete a trigger location
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("trigger_locations")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.userId);

      if (error) {
        throw new Error(`Failed to delete trigger location: ${error.message}`);
      }

      return { success: true };
    }),
});

