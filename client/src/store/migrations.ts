import type { AppState } from '@/types';
import { initializeStreak } from '@/lib/streaks';
import { createInitialRecoveryPoints } from './recoveryPointsDefaults';

export const CURRENT_VERSION = 10;

type Migration = (state: Partial<AppState>) => Partial<AppState>;

const migrations: Record<number, Migration> = {
  1: (state: Partial<AppState>) => {
    // Initial version - no migration needed
    return state;
  },
  2: (state: Partial<AppState>) => {
    // V2: Add streaks tracking
    if (!state.streaks) {
      state.streaks = {
        journaling: initializeStreak('journaling'),
        dailyCards: initializeStreak('dailyCards'),
        meetings: initializeStreak('meetings'),
        stepWork: initializeStreak('stepWork'),
        recoveryRhythm: initializeStreak('recoveryRhythm'),
      };
    } else if (!state.streaks.recoveryRhythm) {
      state.streaks.recoveryRhythm = initializeStreak('recoveryRhythm');
    }
    return state;
  },
  3: (state: Partial<AppState>) => {
    // V3: Add notification settings
    if (!state.settings) {
      state.settings = {
        theme: 'system',
        highContrast: false,
        reducedMotion: false,
        cloudSync: false,
        notifications: {
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
          middayPulseCheck: {
            enabled: false,
            time: '14:00'
          },
          milestoneAlerts: true,
          streakReminders: true,
          challengeReminders: true,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '07:00'
          },
          jitaiNotifications: {
            enabled: true,
            respectQuietHours: true,
            maxPerDay: 3
          },
          meetingReminders: {
            enabled: false,
            minutesBefore: [15, 30, 60],
            respectQuietHours: true
          }
        },
        enableVoiceRecording: false,
        analytics: {
          enabled: false,
          collectUsageData: true,
          collectPerformanceData: false,
          retentionDays: 90,
        },
      };
    } else if (!state.settings.notifications) {
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
        middayPulseCheck: {
          enabled: false,
          time: '14:00'
        },
        milestoneAlerts: true,
        streakReminders: true,
        challengeReminders: true,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00'
        },
        jitaiNotifications: {
          enabled: true,
          respectQuietHours: true,
          maxPerDay: 3
        },
        meetingReminders: {
          enabled: false,
          minutesBefore: [15, 30, 60],
          respectQuietHours: true
        }
      };
    } else {
      // Ensure new fields exist
      if (!state.settings.notifications.middayPulseCheck) {
        state.settings.notifications.middayPulseCheck = {
          enabled: false,
          time: '14:00'
        };
      }
      if (!state.settings.notifications.jitaiNotifications) {
        state.settings.notifications.jitaiNotifications = {
          enabled: true,
          respectQuietHours: true,
          maxPerDay: 3
        };
      }
      if (!state.settings.notifications.meetingReminders) {
        state.settings.notifications.meetingReminders = {
          enabled: false,
          minutesBefore: [15, 30, 60],
          respectQuietHours: true
        };
      }
    }
    return state;
  },
  4: (state: Partial<AppState>) => {
    // V4: Add milestone celebrations
    if (!state.celebratedMilestones) {
      state.celebratedMilestones = {};
    }
    return state;
  },
  5: (state: Partial<AppState>) => {
    // V5: Add achievement system
    if (!state.unlockedAchievements) {
      state.unlockedAchievements = {};
    }
    return state;
  },
  6: (state: Partial<AppState>) => {
    // V6: Add daily challenges
    if (!state.completedChallenges) {
      state.completedChallenges = {};
    }
    return state;
  },
  7: (state: Partial<AppState>) => {
    // V7: Add voice recording settings
    if (state.settings && state.settings.enableVoiceRecording === undefined) {
      state.settings.enableVoiceRecording = false;
    }
    return state;
  },
  8: (state: Partial<AppState>) => {
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
  9: (state: Partial<AppState>) => {
    // V9: Introduce recovery points ledger
    if (!state.recoveryPoints) {
      state.recoveryPoints = createInitialRecoveryPoints();
      return state;
    }

    const defaults = createInitialRecoveryPoints();
    state.recoveryPoints.balance = {
      current: state.recoveryPoints.balance?.current ?? defaults.balance.current,
      lifetimeEarned: state.recoveryPoints.balance?.lifetimeEarned ?? defaults.balance.lifetimeEarned,
      lifetimeRedeemed: state.recoveryPoints.balance?.lifetimeRedeemed ?? defaults.balance.lifetimeRedeemed,
    };
    state.recoveryPoints.transactions = state.recoveryPoints.transactions || {};
    state.recoveryPoints.redemptions = state.recoveryPoints.redemptions || {};
    state.recoveryPoints.rewards = {
      ...defaults.rewards,
      ...(state.recoveryPoints.rewards || {}),
    };

    return state;
  },
  10: (state: Partial<AppState>) => {
    // V10: Add Recovery Rhythm fields to DailyCard and recoveryRhythm streak
    if (!state.streaks) {
      state.streaks = {
        journaling: initializeStreak('journaling'),
        dailyCards: initializeStreak('dailyCards'),
        meetings: initializeStreak('meetings'),
        stepWork: initializeStreak('stepWork'),
        recoveryRhythm: initializeStreak('recoveryRhythm'),
      };
    } else if (!state.streaks.recoveryRhythm) {
      state.streaks.recoveryRhythm = initializeStreak('recoveryRhythm');
    }

    // Migrate existing dailyCards to include new fields with defaults
    if (state.dailyCards) {
      const migratedCards: Record<string, any> = {};
      Object.entries(state.dailyCards).forEach(([date, card]) => {
        migratedCards[date] = {
          ...card,
          middayCompleted: card.middayCompleted ?? false,
          // New fields are optional, so no migration needed - they'll be undefined by default
        };
      });
      state.dailyCards = migratedCards;
    }

    // Add middayPulseCheck notification setting if missing
    if (state.settings?.notifications && !state.settings.notifications.middayPulseCheck) {
      state.settings.notifications.middayPulseCheck = {
        enabled: false,
        time: '14:00',
      };
    }

    return state;
  },
};

export function migrateState(state: Partial<AppState> & { version?: number }): AppState {
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
