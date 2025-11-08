import type { StreakData, StreakHistoryEntry } from '@/types';

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format (local timezone)
 */
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Extract date (YYYY-MM-DD) from ISO 8601 timestamp
 */
export function extractDate(isoString: string): string {
  return isoString.split('T')[0];
}

/**
 * Update streak when user performs an activity
 *
 * @param currentStreak - Current streak data
 * @param activityDate - ISO 8601 timestamp of the activity
 * @returns Updated streak data
 */
export function updateStreak(
  currentStreak: StreakData,
  activityDate: string
): StreakData {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const lastActivity = extractDate(currentStreak.lastActivityDate);
  const activityDateOnly = extractDate(activityDate);

  // If activity is today
  if (activityDateOnly === today) {
    // If last activity was yesterday, continue streak
    if (lastActivity === yesterday) {
      const newCurrent = currentStreak.current + 1;
      return {
        ...currentStreak,
        current: newCurrent,
        longest: Math.max(newCurrent, currentStreak.longest),
        lastActivityDate: activityDate,
        history: [...currentStreak.history, { date: today, completed: true }]
      };
    }

    // If last activity was today, no change (already counted)
    if (lastActivity === today) {
      return currentStreak;
    }

    // If last activity was before yesterday, streak broken, start new
    return {
      ...currentStreak,
      current: 1,
      longest: currentStreak.longest,
      lastActivityDate: activityDate,
      startDate: activityDate,
      history: [...currentStreak.history, { date: today, completed: true }]
    };
  }

  // Activity is not today, just return current streak
  return currentStreak;
}

/**
 * Check if streak should be broken (called on app open)
 * Returns true if streak was broken, false otherwise
 *
 * @param streak - Current streak data
 * @returns Whether the streak was broken
 */
export function checkStreakBroken(streak: StreakData): boolean {
  if (streak.current === 0) return false; // Already at 0

  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const lastActivity = extractDate(streak.lastActivityDate);

  // If last activity was not today or yesterday, streak is broken
  return lastActivity !== today && lastActivity !== yesterday;
}

/**
 * Break a streak (reset current to 0)
 *
 * @param streak - Current streak data
 * @returns Updated streak data with current reset to 0
 */
export function breakStreak(streak: StreakData): StreakData {
  return {
    ...streak,
    current: 0,
    startDate: ''
  };
}

/**
 * Get streak fire emoji based on days
 *
 * @param days - Number of consecutive days
 * @returns Fire emoji string
 */
export function getStreakFireEmoji(days: number): string {
  if (days === 0) return '';
  if (days < 3) return '🔥';
  if (days < 7) return '🔥🔥';
  if (days < 30) return '🔥🔥🔥';
  return '🔥🔥🔥🔥';
}

/**
 * Get streak color based on status
 *
 * @param current - Current streak count
 * @param longest - Longest streak count
 * @returns Color name
 */
export function getStreakColor(current: number, longest: number): 'active' | 'inactive' | 'record' {
  if (current === 0) return 'inactive';
  if (current >= longest && longest > 0) return 'record';
  return 'active';
}

/**
 * Initialize a new streak for a given type
 *
 * @param type - Type of streak
 * @returns Initialized streak data
 */
export function initializeStreak(type: StreakData['type']): StreakData {
  return {
    type,
    current: 0,
    longest: 0,
    lastActivityDate: '',
    startDate: '',
    history: []
  };
}
