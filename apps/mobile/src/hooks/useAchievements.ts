/**
 * Achievements Hook
 *
 * Manages achievement unlocking and display
 */

import { useMemo } from "react";
import { useStreaks } from "./useStreaks";
import { useProfile } from "./useProfile";
import { useDailyEntries } from "./useDailyEntries";
import { useStepEntries } from "./useSteps";
import { differenceInDays } from "date-fns";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export function useAchievements() {
  const { profile } = useProfile();
  const streaks = useStreaks();
  const { entries: dailyEntries } = useDailyEntries();
  const { entries: stepEntries } = useStepEntries();

  const achievements = useMemo<Achievement[]>(() => {
    const cleanDays = profile?.clean_date
      ? differenceInDays(new Date(), new Date(profile.clean_date))
      : 0;

    const hasFirstEntry = dailyEntries.length > 0;
    const completedSteps = stepEntries.map(e => e.step_id);
    const uniqueCompletedSteps = new Set(completedSteps);
    const stepOneCompleted = stepEntries.some(e => {
      // Check if step 1 is completed (need to check step number, not just step_id)
      // This assumes stepEntries includes step information or we need to check differently
      return e.step_id; // Will refine this when we have step number info
    });
    const allStepsCompleted = uniqueCompletedSteps.size >= 12;

    return [
      {
        id: "first_entry",
        title: "First Step",
        description: "Created your first journal entry",
        unlocked: hasFirstEntry,
        progress: hasFirstEntry ? 1 : 0,
        maxProgress: 1,
      },
      {
        id: "week_streak",
        title: "Week Warrior",
        description: "7-day journaling streak",
        unlocked: streaks.journaling.current >= 7,
        progress: streaks.journaling.current,
        maxProgress: 7,
      },
      {
        id: "month_streak",
        title: "Monthly Master",
        description: "30-day journaling streak",
        unlocked: streaks.journaling.longest >= 30,
        progress: streaks.journaling.longest,
        maxProgress: 30,
      },
      {
        id: "clean_30",
        title: "30 Days Clean",
        description: "30 days of recovery",
        unlocked: cleanDays >= 30,
        progress: cleanDays,
        maxProgress: 30,
      },
      {
        id: "clean_90",
        title: "90 Days Clean",
        description: "90 days of recovery",
        unlocked: cleanDays >= 90,
        progress: cleanDays,
        maxProgress: 90,
      },
      {
        id: "clean_365",
        title: "One Year Clean",
        description: "365 days of recovery",
        unlocked: cleanDays >= 365,
        progress: cleanDays,
        maxProgress: 365,
      },
      {
        id: "step_one",
        title: "Step One Complete",
        description: "Completed Step 1 work",
        unlocked: stepOneCompleted,
        progress: stepOneCompleted ? 1 : 0,
        maxProgress: 1,
      },
      {
        id: "all_steps",
        title: "All Steps Complete",
        description: "Completed all 12 steps",
        unlocked: allStepsCompleted,
        progress: uniqueCompletedSteps.size,
        maxProgress: 12,
      },
    ];
  }, [profile, streaks, dailyEntries, stepEntries]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements,
    unlockedCount,
    totalCount,
    progress: totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0,
  };
}

