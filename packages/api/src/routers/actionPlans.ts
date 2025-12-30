/**
 * Action Plans Router
 * 
 * Handles if-then action plans CRUD operations
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const ifThenRuleSchema = z.object({
  if: z.string(),
  then: z.string(),
});

const emergencyContactSchema = z.object({
  name: z.string(),
  phone: z.string(),
});

const actionPlanSchema = z.object({
  title: z.string().max(200),
  situation: z.string().optional().nullable(),
  ifThen: z.array(ifThenRuleSchema).optional(),
  checklist: z.array(z.string()).optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  isSharedWithSponsor: z.boolean().optional(),
});

export const actionPlansRouter = router({
  /**
   * Get all action plans for current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("action_plans")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch action plans: ${error.message}`);
    }

    return data;
  }),

  /**
   * Get shared action plans for a sponsee
   */
  getSharedPlans: protectedProcedure
    .input(z.object({ sponseeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: isSponsor } = await ctx.supabase.rpc("is_sponsor_of", {
        sponsee_user_id: input.sponseeId,
      });
      if (!isSponsor) {
        throw new Error("Unauthorized: Not an active sponsor");
      }

      const { data, error } = await ctx.supabase
        .from("action_plans")
        .select("*")
        .eq("user_id", input.sponseeId)
        .eq("is_shared_with_sponsor", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch shared action plans: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get action plan by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("action_plans")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch action plan: ${error.message}`);
      }

      return data;
    }),

  /**
   * Create action plan
   */
  create: protectedProcedure
    .input(actionPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("action_plans")
        .insert({
          user_id: ctx.userId,
          title: input.title,
          situation: input.situation,
          if_then: input.ifThen ?? [],
          checklist: input.checklist ?? [],
          emergency_contacts: input.emergencyContacts ?? [],
          is_shared_with_sponsor: input.isSharedWithSponsor ?? false,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create action plan: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update action plan
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }).merge(actionPlanSchema.partial())
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const { data, error } = await ctx.supabase
        .from("action_plans")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", ctx.userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update action plan: ${error.message}`);
      }

      return data;
    }),

  /**
   * Delete action plan
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("action_plans")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.userId);

      if (error) {
        throw new Error(`Failed to delete action plan: ${error.message}`);
      }

      return { success: true };
    }),
});
