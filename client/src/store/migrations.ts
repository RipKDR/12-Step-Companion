import type { AppState } from '@/types';
import { initializeStreak } from '@/lib/streaks';

export const CURRENT_VERSION = 9;

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
  6: (state: any) => {
    // V6: Add daily challenges
    if (!state.completedChallenges) {
      state.completedChallenges = {};
    }
    return state;
  },
  7: (state: any) => {
    // V7: Add voice recording settings
    if (state.settings && state.settings.enableVoiceRecording === undefined) {
      state.settings.enableVoiceRecording = false;
    }
    return state;
  },
  8: (state: any) => {
    // V8: Add analytics system
    if (!state.analyticsEvents) {
      state.analyticsEvents = {};
    }
    if (state.settings && !state.settings.analytics) {
      state.settings.analytics = {
        enabled: false,
        collectUsageData: true,
        collectPerformanceData: false,
        retentionDays: 90,
      };
    }
    return state;
  },
  9: (state: any) => {
    // V9: Add harm reduction status and reminders
    if (!state.harmReductionStatus) {
      state.harmReductionStatus = {
        naloxoneAvailable: false,
        fentanylTestStripsAvailable: false,
        sharpsContainerAvailable: false,
        updatedAtISO: new Date().toISOString(),
      };
    }

    if (state.settings && state.settings.notifications && !state.settings.notifications.harmReduction) {
      state.settings.notifications.harmReduction = {
        enabled: false,
        time: '10:00',
        message: 'Check your naloxone kit and safer-use supplies.',
      };
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
