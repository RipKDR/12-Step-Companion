/**
 * Sponsor Router
 *
 * Handles sponsor relationships and sharing
 */

import { z } from "zod";
import { randomBytes } from "crypto";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const sponsorRouter = router({
  /**
   * Generate sponsor code for current user
   * Code expires in 24 hours
   */
  generateCode: protectedProcedure.mutation(async ({ ctx }) => {
    // Invalidate any existing active codes for this user
    // Note: sponsor_codes table is not yet in TypeScript types, using type assertion
    await (ctx.supabase as any)
      .from("sponsor_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("user_id", ctx.userId)
      .is("used_at", null);

    // Generate a cryptographically secure random code (8 characters, alphanumeric)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    do {
      const bytes = randomBytes(8);
      code = Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
      attempts++;

      if (attempts >= maxAttempts) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate unique sponsor code. Please try again.",
        });
      }

      // Check if code already exists
      const { data: existing } = await (ctx.supabase as any)
        .from("sponsor_codes")
        .select("id")
        .eq("code", code)
        .is("used_at", null)
        .single();

      if (!existing) {
        break; // Code is unique
      }
    } while (attempts < maxAttempts);

    // Create code with 24-hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data, error } = await (ctx.supabase as any)
      .from("sponsor_codes")
      .insert({
        user_id: ctx.userId,
        code,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to create sponsor code: ${error.message}`,
      });
    }

    return {
      code: data.code,
      expiresAt: data.expires_at,
    };
  }),

  /**
   * Connect to sponsor using code
   */
  connect: protectedProcedure
    .input(z.object({ code: z.string().length(8).regex(/^[A-Z0-9]{8}$/) }))
    .mutation(async ({ ctx, input }) => {
      // Look up sponsor code
      const { data: sponsorCode, error: codeError } = await (ctx.supabase as any)
        .from("sponsor_codes")
        .select("user_id, expires_at, used_at")
        .eq("code", input.code.toUpperCase())
        .single();

      if (codeError || !sponsorCode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid sponsor code",
        });
      }

      // Check if code is expired
      if (new Date(sponsorCode.expires_at) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sponsor code has expired. Please ask your sponsor for a new code.",
        });
      }

      // Check if code has already been used
      if (sponsorCode.used_at) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sponsor code has already been used. Please ask your sponsor for a new code.",
        });
      }

      // Prevent self-sponsorship
      if (sponsorCode.user_id === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot sponsor yourself",
        });
      }

      // Check if relationship already exists
      const { data: existingRelationship } = await ctx.supabase
        .from("sponsor_relationships")
        .select("id, status")
        .eq("sponsor_id", sponsorCode.user_id)
        .eq("sponsee_id", ctx.userId)
        .single();

      if (existingRelationship) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sponsor relationship already exists",
        });
      }

      // Create sponsor relationship
      const { data: relationship, error: relationshipError } = await ctx.supabase
        .from("sponsor_relationships")
        .insert({
          sponsor_id: sponsorCode.user_id,
          sponsee_id: ctx.userId,
          status: "pending",
        })
        .select()
        .single();

      if (relationshipError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create sponsor relationship: ${relationshipError.message}`,
        });
      }

      // Mark code as used
      await (ctx.supabase as any)
        .from("sponsor_codes")
        .update({ used_at: new Date().toISOString() })
        .eq("code", input.code.toUpperCase());

      return relationship;
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

