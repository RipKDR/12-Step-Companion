import type { MilestoneData } from '@/components/MilestoneCelebrationModal';
import type { CelebratedMilestone } from '@/types';

// Sobriety milestones to check (in days)
const SOBRIETY_MILESTONES = [1, 7, 30, 60, 90, 180, 365];

// Streak milestones to check (in days)
const STREAK_MILESTONES = [3, 7, 14, 30, 90];

/**
 * Calculate clean days from a clean date
 */
export function calculateCleanDays(cleanDate: string): number {
  const clean = new Date(cleanDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - clean.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check for sobriety milestones
 */
export function checkSobrietyMilestone(
  cleanDate: string,
  celebratedMilestones: Record<string, CelebratedMilestone>
): MilestoneData | null {
  const cleanDays = calculateCleanDays(cleanDate);

  // Find the highest milestone achieved that hasn't been celebrated
  for (let i = SOBRIETY_MILESTONES.length - 1; i >= 0; i--) {
    const milestone = SOBRIETY_MILESTONES[i];
    const milestoneId = `sobriety-${milestone}d`;

    if (cleanDays >= milestone && !celebratedMilestones[milestoneId]) {
      return {
        id: milestoneId,
        type: 'sobriety',
        milestone: `${milestone}d`,
        title: getSobrietyTitle(milestone),
        message: getSobrietyMessage(milestone),
      };
    }
  }

  return null;
}

/**
 * Check for streak milestones
 */
export function checkStreakMilestone(
  streakDays: number,
  streakType: 'journaling' | 'dailyCards' | 'meetings' | 'stepWork',
  celebratedMilestones: Record<string, CelebratedMilestone>
): MilestoneData | null {
  // Find the highest milestone achieved that hasn't been celebrated
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    const milestone = STREAK_MILESTONES[i];
    const milestoneId = `streak-${streakType}-${milestone}d`;

    if (streakDays >= milestone && !celebratedMilestones[milestoneId]) {
      return {
        id: milestoneId,
        type: 'streak',
        milestone: `${milestone}d`,
        title: getStreakTitle(streakType, milestone),
        message: getStreakMessage(streakType, milestone),
      };
    }
  }

  return null;
}

/**
 * Check for step completion milestone
 */
export function checkStepMilestone(
  stepNumber: number,
  celebratedMilestones: Record<string, CelebratedMilestone>
): MilestoneData | null {
  const milestoneId = `step-${stepNumber}`;

  if (!celebratedMilestones[milestoneId]) {
    return {
      id: milestoneId,
      type: 'step',
      milestone: `step-${stepNumber}`,
      title: `Step ${stepNumber} Complete!`,
      message: getStepMessage(stepNumber),
    };
  }

  return null;
}

/**
 * Get sobriety milestone title
 */
function getSobrietyTitle(days: number): string {
  if (days === 1) return 'One Day Clean!';
  if (days === 7) return 'One Week Clean!';
  if (days === 30) return 'One Month Clean!';
  if (days === 60) return 'Two Months Clean!';
  if (days === 90) return '90 Days Clean!';
  if (days === 180) return 'Six Months Clean!';
  if (days === 365) return 'One Year Clean!';
  return `${days} Days Clean!`;
}

/**
 * Get sobriety milestone message
 */
function getSobrietyMessage(days: number): string {
  if (days === 1) {
    return "You did it! The first 24 hours are the hardest, and you made it through. That takes real courage.";
  }
  if (days === 7) {
    return "A full week of recovery! You're building momentum. Each day gets a little easier.";
  }
  if (days === 30) {
    return "Thirty days is a huge accomplishment! You're proving to yourself that recovery is possible. Keep going!";
  }
  if (days === 60) {
    return "Two months clean! You're developing new habits and patterns. Your future self will thank you.";
  }
  if (days === 90) {
    return "Ninety days is a major milestone! You've built a foundation. Now it's time to keep building on it.";
  }
  if (days === 180) {
    return "Half a year clean! Look how far you've come. You're not just surviving—you're thriving.";
  }
  if (days === 365) {
    return "ONE YEAR CLEAN! 🎉 You've shown incredible strength and perseverance. This is just the beginning of your new life.";
  }
  return `${days} days of choosing recovery, one day at a time. You're doing amazing!`;
}

/**
 * Get streak title
 */
function getStreakTitle(
  type: 'journaling' | 'dailyCards' | 'meetings' | 'stepWork',
  days: number
): string {
  const typeLabel = {
    journaling: 'Journaling',
    dailyCards: 'Daily Practice',
    meetings: 'Meeting Attendance',
    stepWork: 'Step Work',
  }[type];

  if (days === 3) return `${days}-Day ${typeLabel} Streak!`;
  if (days === 7) return `Week-Long ${typeLabel} Streak!`;
  if (days === 14) return `Two-Week ${typeLabel} Streak!`;
  if (days === 30) return `Month-Long ${typeLabel} Streak!`;
  if (days === 90) return `90-Day ${typeLabel} Streak!`;
  return `${days}-Day ${typeLabel} Streak!`;
}

/**
 * Get streak message
 */
function getStreakMessage(
  type: 'journaling' | 'dailyCards' | 'meetings' | 'stepWork',
  days: number
): string {
  const messages = {
    journaling: [
      "You're building a powerful habit of self-reflection. Keep it up!",
      "Consistent journaling helps you understand yourself better. Great work!",
      "Your commitment to writing is paying off. Each entry is progress.",
    ],
    dailyCards: [
      "Your daily practice is building a strong foundation for recovery.",
      "Showing up every day makes all the difference. You're doing it!",
      "Consistency is the key to lasting change. Keep going!",
    ],
    meetings: [
      "Regular meeting attendance keeps you connected and supported.",
      "You're showing up for yourself and the fellowship. That's powerful!",
      "Connection is the opposite of addiction. You're doing the work!",
    ],
    stepWork: [
      "Your dedication to step work is transforming your life.",
      "Working the steps consistently is how real change happens.",
      "You're putting in the work and it shows. Keep going!",
    ],
  };

  const typeMessages = messages[type];
  const index = Math.min(Math.floor(days / 30), typeMessages.length - 1);
  return typeMessages[index];
}

/**
 * Get step completion message
 */
function getStepMessage(stepNumber: number): string {
  const messages: Record<number, string> = {
    1: "You've admitted powerlessness and opened the door to recovery. This is a huge first step!",
    2: "You've come to believe in a power greater than yourself. Hope is growing!",
    3: "You've made a decision to turn your will over. That takes real courage!",
    4: "You've taken a fearless moral inventory. That's brave and honest work!",
    5: "You've admitted your wrongs to yourself, your Higher Power, and another person. What courage!",
    6: "You're entirely ready to have your defects removed. You're ready for change!",
    7: "You've humbly asked for your shortcomings to be removed. Beautiful humility!",
    8: "You've made a list and are willing to make amends. That's powerful growth!",
    9: "You're making direct amends where possible. This is healing work!",
    10: "You're continuing to take personal inventory. This is lifelong growth!",
    11: "You're seeking to improve your conscious contact through prayer and meditation. Spiritual progress!",
    12: "You've had a spiritual awakening and are carrying the message. You're a beacon of hope!",
  };

  return messages[stepNumber] || `Step ${stepNumber} is complete! You're making incredible progress on your journey.`;
}

/**
 * Format days into a human-readable string
 */
export function formatDaysToString(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;

  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;

  if (days < 30) {
    if (remainingDays === 0) {
      return weeks === 1 ? '1 week' : `${weeks} weeks`;
    }
    return `${weeks} week${weeks > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  }

  const months = Math.floor(days / 30);
  const remainingWeeks = Math.floor((days % 30) / 7);

  if (days < 365) {
    if (remainingWeeks === 0 && days % 30 === 0) {
      return months === 1 ? '1 month' : `${months} months`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  }

  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);

  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }

  return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
}
