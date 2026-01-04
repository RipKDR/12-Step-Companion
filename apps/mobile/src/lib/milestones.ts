/**
 * Milestones Library
 *
 * Calculates and manages recovery milestones
 */

export type MilestoneType = "clean_time" | "streak";

export interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description: string;
  days: number;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic";
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface CleanTimeMilestone extends Milestone {
  type: "clean_time";
}

export interface StreakMilestone extends Milestone {
  type: "streak";
  streakType: "journaling" | "step_work" | "routines" | "meetings" | "challenges";
}

const CLEAN_TIME_MILESTONES: Omit<CleanTimeMilestone, "unlocked" | "unlockedAt">[] = [
  {
    id: "clean-1",
    type: "clean_time",
    title: "One Day Clean",
    description: "You've completed your first day clean!",
    days: 1,
    icon: "🎉",
    rarity: "common",
  },
  {
    id: "clean-7",
    type: "clean_time",
    title: "One Week Clean",
    description: "A full week of recovery! Keep going!",
    days: 7,
    icon: "🌟",
    rarity: "common",
  },
  {
    id: "clean-30",
    type: "clean_time",
    title: "30 Days Clean",
    description: "One month clean! You're building momentum!",
    days: 30,
    icon: "🏆",
    rarity: "uncommon",
  },
  {
    id: "clean-60",
    type: "clean_time",
    title: "60 Days Clean",
    description: "Two months clean! Your recovery is strong!",
    days: 60,
    icon: "💎",
    rarity: "uncommon",
  },
  {
    id: "clean-90",
    type: "clean_time",
    title: "90 Days Clean",
    description: "Three months clean! A major milestone!",
    days: 90,
    icon: "👑",
    rarity: "rare",
  },
  {
    id: "clean-180",
    type: "clean_time",
    title: "Six Months Clean",
    description: "Half a year clean! Incredible progress!",
    days: 180,
    icon: "⭐",
    rarity: "rare",
  },
  {
    id: "clean-365",
    type: "clean_time",
    title: "One Year Clean",
    description: "A full year clean! This is extraordinary!",
    days: 365,
    icon: "🎊",
    rarity: "epic",
  },
];

const STREAK_MILESTONES: Omit<StreakMilestone, "unlocked" | "unlockedAt" | "streakType">[] = [
  {
    id: "streak-3",
    type: "streak",
    title: "3 Day Streak",
    description: "Three days in a row! Consistency is key!",
    days: 3,
    icon: "🔥",
    rarity: "common",
  },
  {
    id: "streak-7",
    type: "streak",
    title: "7 Day Streak",
    description: "A full week streak! Amazing dedication!",
    days: 7,
    icon: "💪",
    rarity: "common",
  },
  {
    id: "streak-14",
    type: "streak",
    title: "14 Day Streak",
    description: "Two weeks strong! You're building habits!",
    days: 14,
    icon: "⚡",
    rarity: "uncommon",
  },
  {
    id: "streak-30",
    type: "streak",
    title: "30 Day Streak",
    description: "A full month streak! Incredible consistency!",
    days: 30,
    icon: "🌟",
    rarity: "uncommon",
  },
  {
    id: "streak-90",
    type: "streak",
    title: "90 Day Streak",
    description: "Three months straight! Unstoppable!",
    days: 90,
    icon: "🏆",
    rarity: "rare",
  },
];

/**
 * Calculate clean time in days from a clean date
 */
export function calculateCleanDays(cleanDate: Date | string | null): number {
  if (!cleanDate) return 0;
  try {
    const date = typeof cleanDate === "string" ? new Date(cleanDate) : cleanDate;
    if (isNaN(date.getTime())) {
      console.warn("Invalid clean date:", cleanDate);
      return 0;
    }
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, days); // Ensure non-negative
  } catch (error) {
    console.error("Error calculating clean days:", error);
    return 0;
  }
}

/**
 * Get clean time milestones for a given clean days count
 */
export function getCleanTimeMilestones(cleanDays: number): CleanTimeMilestone[] {
  return CLEAN_TIME_MILESTONES.map((milestone) => ({
    ...milestone,
    unlocked: cleanDays >= milestone.days,
    unlockedAt: cleanDays >= milestone.days ? new Date() : undefined,
  })) as CleanTimeMilestone[];
}

/**
 * Get streak milestones for a given streak count
 */
export function getStreakMilestones(
  streakCount: number,
  streakType: StreakMilestone["streakType"]
): StreakMilestone[] {
  return STREAK_MILESTONES.map((milestone) => ({
    ...milestone,
    type: "streak",
    streakType,
    unlocked: streakCount >= milestone.days,
    unlockedAt: streakCount >= milestone.days ? new Date() : undefined,
  })) as StreakMilestone[];
}

/**
 * Get newly unlocked milestones
 */
export function getNewlyUnlockedMilestones(
  previousMilestones: Milestone[],
  currentMilestones: Milestone[]
): Milestone[] {
  const previousIds = new Set(previousMilestones.map((m) => m.id));
  return currentMilestones.filter(
    (m) => m.unlocked && !previousIds.has(m.id)
  );
}

/**
 * Get next milestone to unlock
 */
export function getNextMilestone(milestones: Milestone[]): Milestone | null {
  const unlocked = milestones.filter((m) => m.unlocked);
  const locked = milestones.filter((m) => !m.unlocked);
  if (locked.length === 0) return null;
  return locked.sort((a, b) => a.days - b.days)[0];
}

/**
 * Format milestone share text
 */
export function formatMilestoneShare(milestone: Milestone): string {
  return `${milestone.icon} ${milestone.title}\n\n${milestone.description}\n\n#Recovery #12Steps`;
}

