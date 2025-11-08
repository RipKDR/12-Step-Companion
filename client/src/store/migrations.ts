import type { AppState } from '@/types';
import { initializeStreak } from '@/lib/streaks';

export const CURRENT_VERSION = 5;

type Migration = (state: any) => any;

const migrations: Record<number, Migration> = {
  1: (state: any) => {
    // Initial version - no migration needed
    return state;
  },
  2: (state: any) => {
    // V2: Add streaks tracking
    if (!state.streaks) {
      state.streaks = {
        journaling: initializeStreak('journaling'),
        dailyCards: initializeStreak('dailyCards'),
        meetings: initializeStreak('meetings'),
        stepWork: initializeStreak('stepWork'),
      };
    }
    return state;
  },
  3: (state: any) => {
    // V3: Add notification settings
    if (!state.settings.notifications) {
      state.settings.notifications = {
        enabled: false,
        permission: 'default',
        morningCheckIn: {
          enabled: true,
          time: '08:00'
        },
        eveningReflection: {
          enabled: true,
          time: '20:00'
        },
        milestoneAlerts: true,
        streakReminders: true,
        challengeReminders: true,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00'
        }
      };
    }
    return state;
  },
  4: (state: any) => {
    // V4: Add milestone celebrations
    if (!state.celebratedMilestones) {
      state.celebratedMilestones = {};
    }
    return state;
  },
  5: (state: any) => {
    // V5: Add achievement system
    if (!state.unlockedAchievements) {
      state.unlockedAchievements = {};
    }
    return state;
  },
};

export function migrateState(state: any): AppState {
  const version = state.version || 0;

  if (version === CURRENT_VERSION) {
    return state as AppState;
  }

  let migratedState = { ...state };

  // Apply migrations sequentially
  for (let v = version + 1; v <= CURRENT_VERSION; v++) {
    const migration = migrations[v];
    if (migration) {
      console.log(`Migrating state from version ${v - 1} to ${v}`);
      migratedState = migration(migratedState);
      migratedState.version = v;
    }
  }

  return migratedState as AppState;
}
