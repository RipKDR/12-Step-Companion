import type { DailyChallenge, ChallengeTheme, ChallengeCompletion, AppState } from '@/types';

let cachedChallenges: DailyChallenge[] | undefined;
let cachedThemes: Record<string, ChallengeTheme> | undefined;

/**
 * Load challenges from JSON file
 */
export async function loadChallenges(): Promise<{
  challenges: DailyChallenge[];
  themes: Record<string, ChallengeTheme>;
}> {
  if (!cachedChallenges || !cachedThemes) {
    try {
      const response = await fetch('/content/challenges.json');
      const data = await response.json();
      cachedChallenges = data.challenges || [];
      cachedThemes = data.themes || {};
    } catch (error) {
      console.error('Failed to load challenges:', error);
      cachedChallenges = [];
      cachedThemes = {};
    }
  }

  return {
    challenges: cachedChallenges ?? [],
    themes: cachedThemes ?? {},
  };
}

/**
 * Get day of week theme (monday, tuesday, etc.)
 */
export function getDayOfWeekTheme(date: Date = new Date()): DailyChallenge['theme'] {
  const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const themes: DailyChallenge['theme'][] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return themes[dayIndex];
}

/**
 * Get today's challenge (rotates through 4 challenges per theme)
 */
export async function getTodaysChallenge(date: Date = new Date()): Promise<DailyChallenge | null> {
  const { challenges } = await loadChallenges();
  const theme = getDayOfWeekTheme(date);

  // Get all challenges for this theme
  const themeChallenges = challenges.filter((c) => c.theme === theme);
  if (themeChallenges.length === 0) return null;

  // Rotate based on day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Use modulo to cycle through the 4 challenges for this theme
  const challengeIndex = dayOfYear % themeChallenges.length;
  return themeChallenges[challengeIndex];
}

/**
 * Get theme data by theme key
 */
export async function getThemeData(
  theme: DailyChallenge['theme']
): Promise<ChallengeTheme | null> {
  const { themes } = await loadChallenges();
  return themes[theme] || null;
}

/**
 * Check if today's challenge is completed
 */
export function isTodayChallengeCompleted(
  completedChallenges: Record<string, ChallengeCompletion>,
  date: Date = new Date()
): boolean {
  const today = date.toISOString().split('T')[0]; // YYYY-MM-DD

  // Check if any completed challenge matches today's date
  return Object.values(completedChallenges).some((completion) => {
    const completionDate = new Date(completion.completedAtISO).toISOString().split('T')[0];
    return completionDate === today;
  });
}

/**
 * Calculate weekly completion count (current week, Monday to Sunday)
 */
export function getWeeklyCompletionCount(
  completedChallenges: Record<string, ChallengeCompletion>,
  date: Date = new Date()
): number {
  // Get Monday of current week
  const currentDate = new Date(date);
  const dayOfWeek = currentDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  // Get Sunday of current week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Count completions within this week
  return Object.values(completedChallenges).filter((completion) => {
    const completionDate = new Date(completion.completedAtISO);
    return completionDate >= monday && completionDate <= sunday;
  }).length;
}

/**
 * Get completion streak (consecutive weeks with at least one challenge completed)
 */
export function getChallengeStreak(
  completedChallenges: Record<string, ChallengeCompletion>,
  date: Date = new Date()
): number {
  if (Object.keys(completedChallenges).length === 0) return 0;

  let streak = 0;
  let currentWeekStart = new Date(date);

  // Start from Monday of current week
  const dayOfWeek = currentWeekStart.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  currentWeekStart.setDate(currentWeekStart.getDate() + mondayOffset);
  currentWeekStart.setHours(0, 0, 0, 0);

  // Go backwards week by week
  while (true) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Check if there's at least one completion in this week
    const hasCompletionThisWeek = Object.values(completedChallenges).some((completion) => {
      const completionDate = new Date(completion.completedAtISO);
      return completionDate >= currentWeekStart && completionDate <= weekEnd;
    });

    if (hasCompletionThisWeek) {
      streak++;
      // Move to previous week
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    } else {
      // Streak broken
      break;
    }

    // Safety check: don't go back more than 2 years
    if (streak > 104) break;
  }

  return streak;
}

/**
 * Get theme color class for Tailwind
 */
export function getThemeColor(theme: DailyChallenge['theme']): {
  bg: string;
  text: string;
  border: string;
} {
  const colorMap = {
    monday: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-700',
    },
    tuesday: {
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-700',
    },
    wednesday: {
      bg: 'bg-pink-100 dark:bg-pink-900',
      text: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-300 dark:border-pink-700',
    },
    thursday: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-300 dark:border-green-700',
    },
    friday: {
      bg: 'bg-orange-100 dark:bg-orange-900',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-300 dark:border-orange-700',
    },
    saturday: {
      bg: 'bg-amber-100 dark:bg-amber-900',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-700',
    },
    sunday: {
      bg: 'bg-indigo-100 dark:bg-indigo-900',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-300 dark:border-indigo-700',
    },
  };

  return colorMap[theme] || colorMap.monday;
}
