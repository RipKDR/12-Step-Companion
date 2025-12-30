/**
 * Notifications Router
 *
 * Handles notification preferences and scheduling (server-side support)
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const notificationSettingsSchema = z.object({
  enabled: z.boolean(),
  categories: z.object({
    crisis: z.boolean(),
    routine: z.boolean(),
    milestone: z.boolean(),
    reminder: z.boolean(),
    challenge: z.boolean(),
    checkIn: z.boolean(),
    riskAlert: z.boolean(),
  }),
  morningCheckIn: z.object({
    enabled: z.boolean(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  eveningReflection: z.object({
    enabled: z.boolean(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  dailyChallenge: z.object({
    enabled: z.boolean(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  streakReminders: z.boolean(),
  milestoneAlerts: z.boolean(),
  riskAlerts: z.boolean(),
});

export const notificationsRouter = router({
  /**
   * Get notification settings for current user
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    // Try to fetch from database (for cross-device sync)
    const { data, error } = await ctx.supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", ctx.userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error("Error fetching notification settings:", error);
    }

    // Return database settings if available, otherwise indicate local-only
    if (data) {
      return {
        ...data,
        source: "database",
      };
    }

    return {
      message: "Notification settings are stored locally for privacy",
      source: "local",
    };
  }),

  /**
   * Update notification settings
   */
  updateSettings: protectedProcedure
    .input(notificationSettingsSchema.partial())
    .mutation(async ({ ctx, input }) => {
      // Upsert settings to database for cross-device sync
      const { data, error } = await ctx.supabase
        .from("notification_settings")
        .upsert(
          {
            user_id: ctx.userId,
            ...input,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        )
        .select()
        .single();

      if (error) {
        console.error("Error saving notification settings:", error);
        throw new Error(`Failed to save settings: ${error.message}`);
      }

      return {
        success: true,
        data,
        message: "Settings saved",
      };
    }),

  /**
   * Register push token for device
   */
  registerToken: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        platform: z.enum(["ios", "android", "web"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Store push token for future server-side notifications
      const { error } = await ctx.supabase
        .from("notification_tokens")
        .upsert(
          {
            user_id: ctx.userId,
            token: input.token,
            platform: input.platform,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,platform",
          }
        );

      if (error) {
        throw new Error(`Failed to register token: ${error.message}`);
      }

      return { success: true };
    }),
});

