import type { Achievement, UnlockedAchievement, AppState } from '@/types';
import { calculateCleanDays } from './milestones';

let cachedAchievements: Achievement[] | undefined;

/**
 * Load achievements from JSON file
 */
export async function loadAchievements(): Promise<Achievement[]> {
  if (!cachedAchievements) {
    try {
      const response = await fetch('/content/achievements.json');
      const data = await response.json();
      cachedAchievements = data.achievements || [];
    } catch (error) {
      console.error('Failed to load achievements:', error);
      cachedAchievements = [];
    }
  }

  return cachedAchievements ?? [];
}

/**
 * Calculate current progress for an achievement
 */
export function calculateAchievementProgress(
  achievement: Achievement,
  state: AppState
): number {
  const { criteria } = achievement;

  switch (criteria.type) {
    case 'sobriety_days': {
      if (!state.profile?.cleanDate) return 0;
      return calculateCleanDays(state.profile.cleanDate);
    }

    case 'step_completed': {
      // Check if all questions for the step are answered
      const stepNum = criteria.target;
      // This is a simplified check - in production, you'd load step content and verify
      const stepAnswers = Object.values(state.stepAnswers).filter(
        (answer) => answer.stepNumber === stepNum && answer.answer.trim()
      );
      // Assuming each step has at least 1 question
      return stepAnswers.length > 0 ? stepNum : stepNum - 1;
    }

    case 'journal_count': {
      return Object.keys(state.journalEntries).length;
    }

    case 'journal_streak': {
      return state.streaks.journaling.current;
    }

    case 'daily_card_count': {
      return Object.keys(state.dailyCards).length;
    }

    case 'daily_card_streak': {
      return state.streaks.dailyCards.current;
    }

    case 'gratitude_count': {
      let total = 0;
      Object.values(state.dailyCards).forEach((card) => {
        if (card.gratitudeItems) {
          total += card.gratitudeItems.length;
        }
      });
      return total;
    }

    case 'meeting_count': {
      return state.meetings?.length || 0;
    }

    case 'has_sponsor': {
      const hasSponsor = Object.values(state.fellowshipContacts).some(
        (contact) => contact.relationshipType === 'sponsor'
      );
      return hasSponsor ? 1 : 0;
    }

    case 'contact_count': {
      return Object.keys(state.fellowshipContacts).length;
    }

    case 'crisis_mode_used': {
      // This would require tracking crisis mode usage
      // For now, return 0 (implement when crisis tracking is added)
      return 0;
    }

    case 'emergency_contact_used': {
      // This would require tracking emergency contact usage
      // For now, return 0 (implement when tracking is added)
      return 0;
    }

    case 'morning_card_count': {
      let count = 0;
      Object.values(state.dailyCards).forEach((card) => {
        if (card.morningCompleted) count++;
      });
      return count;
    }

    case 'evening_card_count': {
      let count = 0;
      Object.values(state.dailyCards).forEach((card) => {
        if (card.eveningCompleted) count++;
      });
      return count;
    }

    case 'meditation_count': {
      // This would require tracking meditation sessions
      // For now, return 0 (implement when meditation tracking is added)
      return 0;
    }

    case 'any_streak': {
      const maxStreak = Math.max(
        state.streaks.journaling.longest,
        state.streaks.dailyCards.longest,
        state.streaks.meetings.longest,
        state.streaks.stepWork.longest
      );
      return maxStreak;
    }

    default:
      return 0;
  }
}

/**
 * Check if achievement criteria is met
 */
export function isAchievementUnlocked(
  achievement: Achievement,
  state: AppState
): boolean {
  const progress = calculateAchievementProgress(achievement, state);
  return progress >= achievement.criteria.target;
}

/**
 * Check all achievements and return newly unlocked ones
 */
export async function checkAchievements(
  state: AppState
): Promise<Achievement[]> {
  const achievements = await loadAchievements();
  const unlockedAchievements = state.unlockedAchievements || {};
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of achievements) {
    // Skip if already unlocked
    if (unlockedAchievements[achievement.id]) continue;

    // Check if should be unlocked
    if (isAchievementUnlocked(achievement, state)) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

/**
 * Get achievement by ID
 */
export async function getAchievementById(id: string): Promise<Achievement | null> {
  const achievements = await loadAchievements();
  return achievements.find((a) => a.id === id) || null;
}

/**
 * Get achievements by category
 */
export async function getAchievementsByCategory(
  category: Achievement['category']
): Promise<Achievement[]> {
  const achievements = await loadAchievements();
  return achievements.filter((a) => a.category === category);
}

/**
 * Get achievements by rarity
 */
export async function getAchievementsByRarity(
  rarity: Achievement['rarity']
): Promise<Achievement[]> {
  const achievements = await loadAchievements();
  return achievements.filter((a) => a.rarity === rarity);
}

/**
 * Get unlocked achievement stats
 */
export function getAchievementStats(state: AppState): {
  total: number;
  unlocked: number;
  byCategory: Record<Achievement['category'], { total: number; unlocked: number }>;
  byRarity: Record<Achievement['rarity'], { total: number; unlocked: number }>;
} {
  const unlocked = state.unlockedAchievements || {};

  // This is simplified - in practice, you'd load all achievements to count totals
  return {
    total: 32, // Total achievements in the system
    unlocked: Object.keys(unlocked).length,
    byCategory: {
      'sobriety': { total: 6, unlocked: 0 },
      'step-work': { total: 5, unlocked: 0 },
      'community': { total: 6, unlocked: 0 },
      'self-care': { total: 11, unlocked: 0 },
      'crisis': { total: 4, unlocked: 0 },
    },
    byRarity: {
      'common': { total: 6, unlocked: 0 },
      'uncommon': { total: 10, unlocked: 0 },
      'rare': { total: 9, unlocked: 0 },
      'epic': { total: 7, unlocked: 0 },
    },
  };
}

/**
 * Format achievement rarity for display
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-600 dark:text-gray-400';
    case 'uncommon':
      return 'text-green-600 dark:text-green-400';
    case 'rare':
      return 'text-blue-600 dark:text-blue-400';
    case 'epic':
      return 'text-purple-600 dark:text-purple-400';
    default:
      return 'text-gray-600';
  }
}

/**
 * Format achievement rarity background
 */
export function getRarityBg(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 dark:bg-gray-800';
    case 'uncommon':
      return 'bg-green-100 dark:bg-green-900';
    case 'rare':
      return 'bg-blue-100 dark:bg-blue-900';
    case 'epic':
      return 'bg-purple-100 dark:bg-purple-900';
    default:
      return 'bg-gray-100';
  }
}

/**
 * Format achievement category icon
 */
export function getCategoryIcon(category: Achievement['category']): string {
  switch (category) {
    case 'sobriety':
      return '🌟';
    case 'step-work':
      return '📖';
    case 'community':
      return '👥';
    case 'self-care':
      return '💝';
    case 'crisis':
      return '💪';
    default:
      return '✨';
  }
}
