/**
 * Milestones Hook
 *
 * React hook for managing milestones
 */

import { useState, useEffect, useMemo } from "react";
import { useProfile } from "./useProfile";
import { useStreaks } from "./useStreaks";
import {
  Milestone,
  CleanTimeMilestone,
  StreakMilestone,
  calculateCleanDays,
  getCleanTimeMilestones,
  getStreakMilestones,
  getNewlyUnlockedMilestones,
  getNextMilestone,
} from "../lib/milestones";

export function useMilestones() {
  const { profile } = useProfile();
  const streaks = useStreaks();
  const [previousMilestones, setPreviousMilestones] = useState<Milestone[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Milestone[]>([]);

  const cleanDays = useMemo(() => {
    if (!profile?.clean_date) return 0;
    return calculateCleanDays(profile.clean_date);
  }, [profile?.clean_date]);

  const cleanTimeMilestones = useMemo(() => {
    return getCleanTimeMilestones(cleanDays);
  }, [cleanDays]);

  const streakMilestones = useMemo(() => {
    const allStreakMilestones: StreakMilestone[] = [];

    // Journaling streaks
    allStreakMilestones.push(
      ...getStreakMilestones(streaks.journaling.current, "journaling")
    );

    // Step work streaks
    allStreakMilestones.push(
      ...getStreakMilestones(streaks.stepWork.current, "step_work")
    );

    // Routine streaks
    allStreakMilestones.push(
      ...getStreakMilestones(streaks.routines.current, "routines")
    );

    // Meeting streaks
    allStreakMilestones.push(
      ...getStreakMilestones(streaks.meetings.current, "meetings")
    );

    return allStreakMilestones;
  }, [streaks]);

  const allMilestones = useMemo(() => {
    return [...cleanTimeMilestones, ...streakMilestones];
  }, [cleanTimeMilestones, streakMilestones]);

  const nextMilestone = useMemo(() => {
    return getNextMilestone(allMilestones);
  }, [allMilestones]);

  const unlockedMilestones = useMemo(() => {
    return allMilestones.filter((m) => m.unlocked);
  }, [allMilestones]);

  // Detect newly unlocked milestones
  useEffect(() => {
    if (previousMilestones.length > 0) {
      const newlyUnlocked = getNewlyUnlockedMilestones(
        previousMilestones,
        allMilestones
      );
      if (newlyUnlocked.length > 0) {
        setNewlyUnlocked((prev) => {
          // Avoid duplicates
          const existingIds = new Set(prev.map((m) => m.id));
          const unique = newlyUnlocked.filter((m) => !existingIds.has(m.id));
          return [...prev, ...unique];
        });
      }
    }
    setPreviousMilestones(allMilestones);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMilestones.length]); // Only depend on length to avoid infinite loops

  return {
    cleanDays,
    cleanTimeMilestones,
    streakMilestones,
    allMilestones,
    unlockedMilestones,
    nextMilestone,
    newlyUnlocked,
    clearNewlyUnlocked: () => setNewlyUnlocked([]),
  };
}

