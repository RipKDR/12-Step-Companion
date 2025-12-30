/**
 * Challenges Router
 *
 * Handles daily recovery challenges
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const challengesRouter = router({
  /**
   * Get today's challenge for the user
   */
  getTodaysChallenge: protectedProcedure.query(async ({ ctx }) => {
    // Get user's program
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("program, clean_date")
      .eq("user_id", ctx.userId)
      .single();

    if (!profile || !profile.program) {
      throw new Error("User profile not found or program not set");
    }

    const program = profile.program as "NA" | "AA";
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday

    // Calculate clean days
    const cleanDays = profile.clean_date
      ? Math.floor(
          (new Date().getTime() - new Date(profile.clean_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    // Get today's challenge
    const { data: challenge, error } = await ctx.supabase
      .from("daily_challenges")
      .select("*")
      .eq("program", program)
      .eq("day_of_week", dayOfWeek)
      .gte("min_clean_days", cleanDays)
      .or(`max_clean_days.is.null,max_clean_days.gte.${cleanDays}`)
      .single();

    if (error || !challenge) {
      throw new Error(
        `Failed to fetch today's challenge: ${error?.message || "Not found"}`
      );
    }

    // Check if user already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: completion } = await ctx.supabase
      .from("challenge_completions")
      .select("*")
      .eq("user_id", ctx.userId)
      .eq("challenge_id", challenge.id)
      .gte("completed_at", today.toISOString())
      .lt("completed_at", tomorrow.toISOString())
      .single();

    return {
      challenge,
      completed: !!completion,
      completion,
      cleanDays,
    };
  }),

  /**
   * Get all challenges for the week
   */
  getWeeklyChallenges: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("program, clean_date")
      .eq("user_id", ctx.userId)
      .single();

    if (!profile || !profile.program) {
      throw new Error("User profile not found or program not set");
    }

    const program = profile.program as "NA" | "AA";
    const cleanDays = profile.clean_date
      ? Math.floor(
          (new Date().getTime() - new Date(profile.clean_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const { data: challenges, error } = await ctx.supabase
      .from("daily_challenges")
      .select("*")
      .eq("program", program)
      .gte("min_clean_days", cleanDays)
      .or(`max_clean_days.is.null,max_clean_days.gte.${cleanDays}`)
      .order("day_of_week");

    if (error) {
      throw new Error(`Failed to fetch challenges: ${error.message}`);
    }

    // Get completions for this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { data: completions } = await ctx.supabase
      .from("challenge_completions")
      .select("*")
      .eq("user_id", ctx.userId)
      .gte("completed_at", weekStart.toISOString());

    const completionMap = new Map(
      completions?.map((c) => [c.challenge_id, c]) || []
    );

    return challenges.map((challenge) => ({
      challenge,
      completed: completionMap.has(challenge.id),
      completion: completionMap.get(challenge.id),
    }));
  }),

  /**
   * Complete a challenge
   */
  completeChallenge: protectedProcedure
    .input(
      z.object({
        challengeId: z.string().uuid(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if already completed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: existing } = await ctx.supabase
        .from("challenge_completions")
        .select("*")
        .eq("user_id", ctx.userId)
        .eq("challenge_id", input.challengeId)
        .gte("completed_at", today.toISOString())
        .lt("completed_at", tomorrow.toISOString())
        .single();

      if (existing) {
        // Update existing completion
        const { data, error } = await ctx.supabase
          .from("challenge_completions")
          .update({
            notes: input.notes || null,
            completed_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update completion: ${error.message}`);
        }

        return data;
      }

      // Get challenge details for points
      const { data: challenge, error: challengeError } = await ctx.supabase
        .from("daily_challenges")
        .select("category, points")
        .eq("id", input.challengeId)
        .single();

      if (challengeError || !challenge) {
        throw new Error(`Challenge not found: ${challengeError?.message || "Unknown error"}`);
      }

      // Insert new completion
      const { data: completion, error } = await ctx.supabase
        .from("challenge_completions")
        .insert({
          user_id: ctx.userId,
          challenge_id: input.challengeId,
          notes: input.notes || null,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to complete challenge: ${error.message}`);
      }

      // Update streak
      if (challenge) {
        try {
          const { data: streak, error: streakError } = await ctx.supabase
            .from("challenge_streaks")
            .select("*")
            .eq("user_id", ctx.userId)
            .eq("category", challenge.category)
            .single();

          const lastCompleted = new Date(completion.completed_at);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(23, 59, 59, 999);

          if (!streak || streakError) {
            // Create new streak
            const { error: insertError } = await ctx.supabase
              .from("challenge_streaks")
              .insert({
                user_id: ctx.userId,
                category: challenge.category,
                current_streak: 1,
                longest_streak: 1,
                last_completed_at: completion.completed_at,
              });

            if (insertError) {
              console.error("Failed to create streak:", insertError);
            }
          } else {
            const streakDate = streak.last_completed_at
              ? new Date(streak.last_completed_at)
              : null;
            const isConsecutive =
              streakDate &&
              streakDate.toDateString() === yesterday.toDateString();

            const newStreak = isConsecutive
              ? streak.current_streak + 1
              : 1;

            const { error: updateError } = await ctx.supabase
              .from("challenge_streaks")
              .update({
                current_streak: newStreak,
                longest_streak: Math.max(streak.longest_streak, newStreak),
                last_completed_at: completion.completed_at,
              })
              .eq("id", streak.id);

            if (updateError) {
              console.error("Failed to update streak:", updateError);
            }
          }
        } catch (error) {
          console.error("Error updating challenge streak:", error);
          // Don't fail the completion if streak update fails
        }
      }

      return completion;
    }),

  /**
   * Get challenge streaks
   */
  getStreaks: protectedProcedure.query(async ({ ctx }) => {
    const { data: streaks, error } = await ctx.supabase
      .from("challenge_streaks")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("category");

    if (error) {
      throw new Error(`Failed to fetch streaks: ${error.message}`);
    }

    return streaks || [];
  }),

  /**
   * Get challenge completion history
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(30),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: completions, error } = await ctx.supabase
        .from("challenge_completions")
        .select("*, challenge:daily_challenges(*)")
        .eq("user_id", ctx.userId)
        .order("completed_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new Error(`Failed to fetch history: ${error.message}`);
      }

      return completions || [];
    }),
});

