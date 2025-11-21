/**
 * Sponsor Router
 *
 * Handles sponsor relationships and sharing
 */

import { z } from "zod";
import { randomBytes } from "crypto";
import { router, protectedProcedure } from "../trpc";

export const sponsorRouter = router({
  /**
   * Generate sponsor code for current user
   */
  generateCode: protectedProcedure.mutation(async ({ ctx }) => {
    // Generate a cryptographically secure random code (8 characters, alphanumeric)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const bytes = randomBytes(8);
    const code = Array.from(bytes, (byte) => chars[byte % chars.length]).join("");

    // TODO: Store code in a dedicated sponsor_codes table with expiration
    // For now, we'll return it - this is a placeholder implementation
    return { code };
  }),

  /**
   * Connect to sponsor using code
   */
  connect: protectedProcedure
    .input(z.object({ code: z.string().length(8) }))
    .mutation(async ({ ctx, input }) => {
      // Look up sponsor by code
      // This is a simplified version - in production, use a codes table
      const { data: sponsorProfile, error: profileError } = await ctx.supabase
        .from("profiles")
        .select("user_id")
        .eq("handle", input.code) // Simplified: using handle as code
        .single();

      if (profileError || !sponsorProfile) {
        throw new Error("Invalid sponsor code");
      }

      // Create sponsor relationship
      const { data, error } = await ctx.supabase
        .from("sponsor_relationships")
        .insert({
          sponsor_id: sponsorProfile.user_id,
          sponsee_id: ctx.userId,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create sponsor relationship: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get sponsor relationships for current user
   */
  getRelationships: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("sponsor_relationships")
      .select("*")
      .or(`sponsor_id.eq.${ctx.userId},sponsee_id.eq.${ctx.userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch relationships: ${error.message}`);
    }

    return data;
  }),

  /**
   * Accept sponsor relationship (sponsor accepts sponsee)
   */
  accept: protectedProcedure
    .input(z.object({ relationshipId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is the sponsor
      const { data: relationship, error: fetchError } = await ctx.supabase
        .from("sponsor_relationships")
        .select("*")
        .eq("id", input.relationshipId)
        .eq("sponsor_id", ctx.userId)
        .single();

      if (fetchError || !relationship) {
        throw new Error("Relationship not found or unauthorized");
      }

      const { data, error } = await ctx.supabase
        .from("sponsor_relationships")
        .update({ status: "active" })
        .eq("id", input.relationshipId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to accept relationship: ${error.message}`);
      }

      return data;
    }),

  /**
   * Revoke sponsor relationship
   */
  revoke: protectedProcedure
    .input(z.object({ relationshipId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is either sponsor or sponsee
      const { data: relationship, error: fetchError } = await ctx.supabase
        .from("sponsor_relationships")
        .select("*")
        .eq("id", input.relationshipId)
        .or(`sponsor_id.eq.${ctx.userId},sponsee_id.eq.${ctx.userId}`)
        .single();

      if (fetchError || !relationship) {
        throw new Error("Relationship not found or unauthorized");
      }

      const { data, error } = await ctx.supabase
        .from("sponsor_relationships")
        .update({ status: "revoked" })
        .eq("id", input.relationshipId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to revoke relationship: ${error.message}`);
      }

      return data;
    }),
});

