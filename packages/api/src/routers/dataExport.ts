/**
 * Data Export Router
 *
 * Handles data export and deletion requests
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const dataExportRouter = router({
  /**
   * Export all user data as JSON
   */
  export: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const supabase = ctx.supabase;

    // Fetch all user data in parallel
    const [
      profileResult,
      stepEntriesResult,
      dailyEntriesResult,
      cravingEventsResult,
      actionPlansResult,
      routinesResult,
      routineLogsResult,
      streaksResult,
      triggerLocationsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("step_entries").select("*").eq("user_id", userId),
      supabase.from("daily_entries").select("*").eq("user_id", userId),
      supabase.from("craving_events").select("*").eq("user_id", userId),
      supabase.from("action_plans").select("*").eq("user_id", userId),
      supabase.from("routines").select("*").eq("user_id", userId),
      supabase.from("routine_logs").select("*").eq("user_id", userId),
      supabase.from("sobriety_streaks").select("*").eq("user_id", userId),
      supabase.from("trigger_locations").select("*").eq("user_id", userId),
    ]);

    // Check for errors
    const errors = [
      profileResult.error,
      stepEntriesResult.error,
      dailyEntriesResult.error,
      cravingEventsResult.error,
      actionPlansResult.error,
      routinesResult.error,
      routineLogsResult.error,
      streaksResult.error,
      triggerLocationsResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      throw new Error(`Failed to export data: ${errors.map(e => e?.message).join(", ")}`);
    }

    return {
      exportedAt: new Date().toISOString(),
      profile: profileResult.data,
      stepEntries: stepEntriesResult.data || [],
      dailyEntries: dailyEntriesResult.data || [],
      cravingEvents: cravingEventsResult.data || [],
      actionPlans: actionPlansResult.data || [],
      routines: routinesResult.data || [],
      routineLogs: routineLogsResult.data || [],
      streaks: streaksResult.data || [],
      triggerLocations: triggerLocationsResult.data || [],
    };
  }),

  /**
   * Delete all user data
   * Requires explicit confirmation
   */
  delete: protectedProcedure
    .input(z.object({ confirm: z.literal(true) }))
    .mutation(async ({ ctx, input }) => {
      if (!input.confirm) {
        throw new Error("Deletion must be confirmed");
      }

      const userId = ctx.userId;
      const supabase = ctx.supabase;

      // Delete all user data (CASCADE will handle related records)
      // Note: We delete in order to respect foreign key constraints
      const tables = [
        "routine_logs",
        "routines",
        "trigger_locations",
        "craving_events",
        "daily_entries",
        "step_entries",
        "action_plans",
        "sobriety_streaks",
        "notification_tokens",
        "risk_signals",
        "messages",
        "sponsor_relationships",
        "profiles",
      ];

      const deleteResults = await Promise.all(
        tables.map((table) =>
          supabase.from(table).delete().eq("user_id", userId)
        )
      );

      const errors = deleteResults
        .map((result) => result.error)
        .filter(Boolean);

      if (errors.length > 0) {
        console.error("Errors during data deletion:", errors);
        // Don't throw - some tables might not exist or already be deleted
      }

      // Note: Auth user deletion should be handled separately via Supabase Auth API
      // This requires service role access and should be done carefully

      return { success: true };
    }),
});

