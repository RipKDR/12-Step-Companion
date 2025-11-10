import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  Profile,
  StepAnswer,
  DailyCard,
  JournalEntry,
  WorksheetResponse,
  EmergencyAction,
  AppSettings,
  FellowshipContact,
  Streaks,
  StreakData,
  CelebratedMilestone,
  UnlockedAchievement,
  ChallengeCompletion,
  AnalyticsEvent,
  AnalyticsEventType,
  RecoveryPointLedger,
  RecoveryPointTransaction,
  RecoveryPointReward,
  RecoveryPointRedemption,
  RecoveryPointAwardPayload,
  RecoveryPointSummary,
  RecoveryPointSource,
  AISponsorMessage,
  AISponsorChatState,
  ChatMode
} from '@/types';
import { storageManager } from '@/lib/storage';
import { migrateState, CURRENT_VERSION } from './migrations';
import { defaultFeatureFlags } from './featureFlags';
import {
  updateStreak,
  checkStreakBroken,
  breakStreak,
  initializeStreak
} from '@/lib/streaks';
import { createInitialRecoveryPoints } from './recoveryPointsDefaults';

const defaultEmergencyActions: EmergencyAction[] = [
  {
    id: 'call-sponsor',
    label: 'Call My Sponsor',
    type: 'call',
    data: 'tel:+61400000000',
    icon: 'phone',
  },
  {
    id: 'breathing',
    label: 'Breathing Exercise',
    type: 'exercise',
    data: 'breathing',
    icon: 'heart',
  },
  {
    id: 'timer',
    label: '5 Minute Timer',
    type: 'timer',
    data: '300',
    icon: 'clock',
  },
  {
    id: 'coping-notes',
    label: 'Coping Notes',
    type: 'notes',
    data: 'Remember: This feeling is temporary. You are strong. Call someone if needed.',
    icon: 'file-text',
  },
];

const initialStreaks: Streaks = {
  journaling: initializeStreak('journaling'),
  dailyCards: initializeStreak('dailyCards'),
  meetings: initializeStreak('meetings'),
  stepWork: initializeStreak('stepWork'),
};

const initialRecoveryPoints: RecoveryPointLedger = createInitialRecoveryPoints();

const initialState: AppState = {
  version: CURRENT_VERSION,
  profile: undefined,
  stepAnswers: {},
  dailyCards: {},
  journalEntries: {},
  worksheetResponses: {},
  meetings: [],
  emergencyActions: defaultEmergencyActions,
  fellowshipContacts: {},
  favoriteQuotes: [],
  settings: {
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
      milestoneAlerts: true,
      streakReminders: true,
      challengeReminders: true,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00'
      }
    },
    enableVoiceRecording: false,
    analytics: {
      enabled: false,
      collectUsageData: true,
      collectPerformanceData: false,
      retentionDays: 90,
    },
  },
  onboardingComplete: false,
  streaks: initialStreaks,
  celebratedMilestones: {},
  unlockedAchievements: {},
  completedChallenges: {},
  analyticsEvents: {},
  recoveryPoints: initialRecoveryPoints,
  aiSponsorChat: {
    messages: {},
    isTyping: false,
    chatMode: 'standard',
    isRecording: false,
  },
};

interface AppStore extends AppState {
  // Profile
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  
  // Onboarding
  completeOnboarding: () => void;
  
  // Step Answers
  saveStepAnswer: (answer: StepAnswer) => void;
  getStepAnswers: (stepNumber: number) => StepAnswer[];
  
  // Daily Cards
  getDailyCard: (date: string) => DailyCard | undefined;
  updateDailyCard: (date: string, updates: Partial<Omit<DailyCard, 'id' | 'date'>>) => void;
  
  // Journal
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'updatedAtISO'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  getJournalEntries: () => JournalEntry[];
  
  // Worksheets
  saveWorksheetResponse: (response: Omit<WorksheetResponse, 'id' | 'createdAtISO' | 'updatedAtISO'>) => void;
  updateWorksheetResponse: (id: string, responses: Record<string, any>) => void;
  getWorksheetResponses: (templateId: string) => WorksheetResponse[];
  
  // Emergency Actions
  updateEmergencyAction: (id: string, updates: Partial<EmergencyAction>) => void;
  
  // Fellowship Contacts
  addContact: (contact: Omit<FellowshipContact, 'id' | 'createdAtISO' | 'updatedAtISO'>) => void;
  updateContact: (id: string, updates: Partial<FellowshipContact>) => void;
  deleteContact: (id: string) => void;
  getContacts: () => FellowshipContact[];
  getEmergencyContacts: () => FellowshipContact[];
  
  // Favorite Quotes
  toggleFavoriteQuote: (quoteId: string) => void;
  isFavoriteQuote: (quoteId: string) => boolean;
  
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Notifications (V2)
  updateNotificationPermission: (permission: NotificationPermission) => void;
  updateNotificationSettings: (updates: Partial<AppSettings['notifications']>) => void;
  enableNotifications: () => void;
  disableNotifications: () => void;

  // Data Management
  exportData: () => AppState;
  importData: (data: Partial<AppState>) => void;
  clearAllData: () => void;

  // Streak Management (V2)
  updateStreakForJournal: () => void;
  updateStreakForDailyCard: () => void;
  updateStreakForMeeting: () => void;
  updateStreakForStepWork: () => void;
  checkAllStreaks: () => void;
  getStreak: (type: StreakData['type']) => StreakData;

  // Milestone Celebrations (V2)
  celebrateMilestone: (milestone: CelebratedMilestone) => void;
  getCelebratedMilestones: () => Record<string, CelebratedMilestone>;

  // Achievement System (V2)
  unlockAchievement: (achievement: UnlockedAchievement) => void;
  getUnlockedAchievements: () => Record<string, UnlockedAchievement>;

  // Daily Challenges (V2)
  completeChallenge: (challengeId: string, notes?: string) => void;
  getCompletedChallenges: () => Record<string, ChallengeCompletion>;

  // Analytics (V3)
  trackAnalyticsEvent: (type: AnalyticsEventType, metadata?: Record<string, any>) => void;
  getAnalyticsEvents: () => Record<string, AnalyticsEvent>;
  clearOldAnalyticsEvents: () => void;
  updateAnalyticsSettings: (updates: Partial<AppSettings['analytics']>) => void;

  // Recovery Points (V3)
  awardPoints: (payload: RecoveryPointAwardPayload) => void;
  redeemReward: (rewardId: string, notes?: string) => void;
  exportRecoveryPointsSummary: () => RecoveryPointSummary;

  // AI Sponsor Chat (V4)
  addAISponsorMessage: (message: Omit<AISponsorMessage, 'id' | 'timestamp'>) => void;
  getAISponsorMessages: () => AISponsorMessage[];
  setAISponsorTyping: (isTyping: boolean) => void;
  clearAISponsorChat: () => void;
  setAISponsorChatMode: (mode: ChatMode) => void;
  setAISponsorRecording: (isRecording: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Profile
      setProfile: (profile) => set({ profile }),
      
      updateProfile: (updates) => set((state) => {
        if (!state.profile) {
          const newProfile = {
            id: `user_${Date.now()}`,
            name: 'User',
            cleanDate: new Date().toISOString(),
            timezone: 'Australia/Melbourne',
            hasPasscode: false,
            ...updates,
          };
          return { profile: newProfile };
        }
        return { profile: { ...state.profile, ...updates } };
      }),
      
      // Onboarding
      completeOnboarding: () => set({ onboardingComplete: true }),
      
      // Step Answers
      saveStepAnswer: (answer) => {
        const now = new Date().toISOString();
        set((state) => ({
          stepAnswers: {
            ...state.stepAnswers,
            [answer.questionId]: answer,
          },
          streaks: {
            ...state.streaks,
            stepWork: updateStreak(state.streaks.stepWork, now)
          }
        }));
      },
      
      getStepAnswers: (stepNumber) => {
        const state = get();
        return Object.values(state.stepAnswers).filter(
          (answer) => answer.stepNumber === stepNumber
        );
      },
      
      // Daily Cards
      getDailyCard: (date) => get().dailyCards[date],
      
      updateDailyCard: (date, updates) => {
        const now = new Date().toISOString();
        set((state) => {
          const existing = state.dailyCards[date];
          const card: DailyCard = existing
            ? { ...existing, ...updates, updatedAtISO: now }
            : {
                id: date,
                date,
                morningCompleted: false,
                eveningCompleted: false,
                ...updates,
                updatedAtISO: now,
              };

          // Update streak if morning or evening is being completed
          const shouldUpdateStreak =
            (updates.morningCompleted && !existing?.morningCompleted) ||
            (updates.eveningCompleted && !existing?.eveningCompleted);

          return {
            dailyCards: {
              ...state.dailyCards,
              [date]: card,
            },
            streaks: shouldUpdateStreak ? {
              ...state.streaks,
              dailyCards: updateStreak(state.streaks.dailyCards, now)
            } : state.streaks
          };
        });
      },
      
      // Journal
      addJournalEntry: (entry) => {
        const id = `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const newEntry: JournalEntry = {
          ...entry,
          id,
          updatedAtISO: now,
        };

        set((state) => ({
          journalEntries: {
            ...state.journalEntries,
            [id]: newEntry,
          },
          streaks: {
            ...state.streaks,
            journaling: updateStreak(state.streaks.journaling, now)
          }
        }));
      },
      
      updateJournalEntry: (id, updates) => set((state) => {
        const existing = state.journalEntries[id];
        if (!existing) return state;
        
        return {
          journalEntries: {
            ...state.journalEntries,
            [id]: {
              ...existing,
              ...updates,
              updatedAtISO: new Date().toISOString(),
            },
          },
        };
      }),
      
      deleteJournalEntry: (id) => set((state) => {
        const { [id]: _, ...rest } = state.journalEntries;
        return { journalEntries: rest };
      }),
      
      getJournalEntries: () => {
        const state = get();
        return Object.values(state.journalEntries).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },
      
      // Worksheets
      saveWorksheetResponse: (response) => set((state) => {
        const id = `worksheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const newResponse: WorksheetResponse = {
          ...response,
          id,
          createdAtISO: now,
          updatedAtISO: now,
        };
        
        return {
          worksheetResponses: {
            ...state.worksheetResponses,
            [id]: newResponse,
          },
        };
      }),
      
      updateWorksheetResponse: (id, responses) => set((state) => {
        const existing = state.worksheetResponses[id];
        if (!existing) return state;
        
        return {
          worksheetResponses: {
            ...state.worksheetResponses,
            [id]: {
              ...existing,
              responses,
              updatedAtISO: new Date().toISOString(),
            },
          },
        };
      }),
      
      getWorksheetResponses: (templateId) => {
        const state = get();
        return Object.values(state.worksheetResponses)
          .filter((r) => r.templateId === templateId)
          .sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());
      },
      
      // Emergency Actions
      updateEmergencyAction: (id, updates) => set((state) => ({
        emergencyActions: state.emergencyActions.map((action) =>
          action.id === id ? { ...action, ...updates } : action
        ),
      })),
      
      // Fellowship Contacts
      addContact: (contact) => set((state) => {
        const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const newContact: FellowshipContact = {
          ...contact,
          id,
          createdAtISO: now,
          updatedAtISO: now,
        };
        
        return {
          fellowshipContacts: {
            ...state.fellowshipContacts,
            [id]: newContact,
          },
        };
      }),
      
      updateContact: (id, updates) => set((state) => {
        const existing = state.fellowshipContacts[id];
        if (!existing) return state;
        
        return {
          fellowshipContacts: {
            ...state.fellowshipContacts,
            [id]: {
              ...existing,
              ...updates,
              updatedAtISO: new Date().toISOString(),
            },
          },
        };
      }),
      
      deleteContact: (id) => set((state) => {
        const { [id]: _, ...rest } = state.fellowshipContacts;
        return { fellowshipContacts: rest };
      }),
      
      getContacts: () => {
        const state = get();
        return Object.values(state.fellowshipContacts).sort(
          (a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime()
        );
      },
      
      getEmergencyContacts: () => {
        const state = get();
        return Object.values(state.fellowshipContacts)
          .filter((contact) => contact.isEmergencyContact)
          .sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());
      },
      
      // Favorite Quotes
      toggleFavoriteQuote: (quoteId) => set((state) => {
        const isFavorite = state.favoriteQuotes.includes(quoteId);
        return {
          favoriteQuotes: isFavorite
            ? state.favoriteQuotes.filter((id) => id !== quoteId)
            : [...state.favoriteQuotes, quoteId],
        };
      }),
      
      isFavoriteQuote: (quoteId) => {
        return get().favoriteQuotes.includes(quoteId);
      },
      
      // Settings
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates },
      })),

      // Notifications (V2)
      updateNotificationPermission: (permission) => set((state) => ({
        settings: {
          ...state.settings,
          notifications: {
            ...state.settings.notifications,
            permission
          }
        }
      })),

      updateNotificationSettings: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          notifications: {
            ...state.settings.notifications,
            ...updates
          }
        }
      })),

      enableNotifications: () => set((state) => ({
        settings: {
          ...state.settings,
          notifications: {
            ...state.settings.notifications,
            enabled: true
          }
        }
      })),

      disableNotifications: () => set((state) => ({
        settings: {
          ...state.settings,
          notifications: {
            ...state.settings.notifications,
            enabled: false
          }
        }
      })),

      // Data Management
      exportData: () => get(),
      
      importData: (data) => set((state) => {
        // Merge imported data with existing, preferring newest based on updatedAtISO
        const mergeByTimestamp = <T extends { updatedAtISO?: string }>(
          existing: Record<string, T>,
          imported: Record<string, T>
        ): Record<string, T> => {
          const merged = { ...existing };

          Object.entries(imported).forEach(([key, value]) => {
            const existingItem = merged[key];
            if (!existingItem ||
                (value.updatedAtISO && existingItem.updatedAtISO &&
                 new Date(value.updatedAtISO) > new Date(existingItem.updatedAtISO))) {
              merged[key] = value;
            }
          });

          return merged;
        };

        const mergeRecoveryLedger = (
          existing: RecoveryPointLedger,
          incoming?: RecoveryPointLedger | null
        ): RecoveryPointLedger => {
          if (!incoming) return existing;

          const mergedTransactions: Record<string, RecoveryPointTransaction> = {
            ...existing.transactions,
            ...incoming.transactions,
          };

          const mergedRewards: Record<string, RecoveryPointReward> = {
            ...existing.rewards,
            ...incoming.rewards,
          };

          const mergedRedemptions: Record<string, RecoveryPointRedemption> = {
            ...existing.redemptions,
            ...incoming.redemptions,
          };

          const balance: RecoveryPointLedger['balance'] = {
            current:
              typeof incoming.balance?.current === 'number'
                ? incoming.balance.current
                : existing.balance.current,
            lifetimeEarned: Math.max(
              existing.balance.lifetimeEarned,
              incoming.balance?.lifetimeEarned ?? 0
            ),
            lifetimeRedeemed: Math.max(
              existing.balance.lifetimeRedeemed,
              incoming.balance?.lifetimeRedeemed ?? 0
            ),
          };

          return {
            balance,
            transactions: mergedTransactions,
            rewards: mergedRewards,
            redemptions: mergedRedemptions,
          };
        };

        return {
          ...state,
          profile: data.profile || state.profile,
          stepAnswers: data.stepAnswers ? mergeByTimestamp(state.stepAnswers, data.stepAnswers) : state.stepAnswers,
          dailyCards: data.dailyCards ? mergeByTimestamp(state.dailyCards, data.dailyCards) : state.dailyCards,
          journalEntries: data.journalEntries ? mergeByTimestamp(state.journalEntries, data.journalEntries) : state.journalEntries,
          worksheetResponses: data.worksheetResponses ? mergeByTimestamp(state.worksheetResponses, data.worksheetResponses) : state.worksheetResponses,
          fellowshipContacts: data.fellowshipContacts ? mergeByTimestamp(state.fellowshipContacts, data.fellowshipContacts) : state.fellowshipContacts,
          favoriteQuotes: data.favoriteQuotes || state.favoriteQuotes,
          settings: data.settings || state.settings,
          recoveryPoints: data.recoveryPoints
            ? mergeRecoveryLedger(state.recoveryPoints, data.recoveryPoints)
            : state.recoveryPoints,
        };
      }),

      clearAllData: () => set(initialState),

      // Streak Management (V2)
      updateStreakForJournal: () => set((state) => {
        const now = new Date().toISOString();
        return {
          streaks: {
            ...state.streaks,
            journaling: updateStreak(state.streaks.journaling, now)
          }
        };
      }),

      updateStreakForDailyCard: () => set((state) => {
        const now = new Date().toISOString();
        return {
          streaks: {
            ...state.streaks,
            dailyCards: updateStreak(state.streaks.dailyCards, now)
          }
        };
      }),

      updateStreakForMeeting: () => set((state) => {
        const now = new Date().toISOString();
        return {
          streaks: {
            ...state.streaks,
            meetings: updateStreak(state.streaks.meetings, now)
          }
        };
      }),

      updateStreakForStepWork: () => set((state) => {
        const now = new Date().toISOString();
        return {
          streaks: {
            ...state.streaks,
            stepWork: updateStreak(state.streaks.stepWork, now)
          }
        };
      }),

      checkAllStreaks: () => set((state) => {
        const newStreaks = { ...state.streaks };
        let hasChanges = false;

        (Object.keys(newStreaks) as Array<keyof Streaks>).forEach((key) => {
          if (checkStreakBroken(newStreaks[key])) {
            newStreaks[key] = breakStreak(newStreaks[key]);
            hasChanges = true;
          }
        });

        return hasChanges ? { streaks: newStreaks } : state;
      }),

      getStreak: (type) => {
        return get().streaks[type];
      },

      // Milestone Celebrations (V2)
      celebrateMilestone: (milestone) => set((state) => ({
        celebratedMilestones: {
          ...state.celebratedMilestones,
          [milestone.id]: milestone
        }
      })),

      getCelebratedMilestones: () => {
        return get().celebratedMilestones || {};
      },

      // Achievement System (V2)
      unlockAchievement: (achievement) => set((state) => ({
        unlockedAchievements: {
          ...state.unlockedAchievements,
          [achievement.achievementId]: achievement
        }
      })),

      getUnlockedAchievements: () => {
        return get().unlockedAchievements || {};
      },

      // Daily Challenges (V2)
      completeChallenge: (challengeId, notes) => set((state) => {
        const id = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const completion: ChallengeCompletion = {
          id,
          challengeId,
          completedAtISO: new Date().toISOString(),
          notes,
        };

        return {
          completedChallenges: {
            ...state.completedChallenges,
            [id]: completion,
          },
        };
      }),

      getCompletedChallenges: () => {
        return get().completedChallenges || {};
      },

      // Recovery Points (V3)
      awardPoints: (payload) => {
        if (!payload || payload.amount <= 0) {
          return;
        }

        const transactionId = `points_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();

        const transaction: RecoveryPointTransaction = {
          id: transactionId,
          type: 'award',
          amount: payload.amount,
          reason: payload.reason,
          source: payload.source,
          relatedId: payload.relatedId,
          timestamp,
          metadata: payload.metadata,
        };

        set((state) => ({
          recoveryPoints: {
            ...state.recoveryPoints,
            balance: {
              current: state.recoveryPoints.balance.current + payload.amount,
              lifetimeEarned: state.recoveryPoints.balance.lifetimeEarned + payload.amount,
              lifetimeRedeemed: state.recoveryPoints.balance.lifetimeRedeemed,
            },
            transactions: {
              ...state.recoveryPoints.transactions,
              [transactionId]: transaction,
            },
          },
        }));

        get().trackAnalyticsEvent('recovery_points_awarded', {
          amount: payload.amount,
          source: payload.source,
          reason: payload.reason,
          relatedId: payload.relatedId,
          ...payload.metadata,
        });
      },

      redeemReward: (rewardId, notes) => {
        const state = get();
        const reward = state.recoveryPoints.rewards[rewardId];
        if (!reward || !reward.available) {
          return;
        }

        if (state.recoveryPoints.balance.current < reward.cost) {
          return;
        }

        const timestamp = new Date().toISOString();
        const transactionId = `points_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const redemptionId = `redemption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const transaction: RecoveryPointTransaction = {
          id: transactionId,
          type: 'redeem',
          amount: reward.cost,
          reason: `Redeemed ${reward.name}`,
          source: 'redemption',
          relatedId: rewardId,
          timestamp,
          metadata: notes ? { notes } : undefined,
        };

        const redemption: RecoveryPointRedemption = {
          id: redemptionId,
          rewardId,
          redeemedAtISO: timestamp,
          notes,
          transactionId,
        };

        set((state) => ({
          recoveryPoints: {
            ...state.recoveryPoints,
            balance: {
              current: state.recoveryPoints.balance.current - reward.cost,
              lifetimeEarned: state.recoveryPoints.balance.lifetimeEarned,
              lifetimeRedeemed: state.recoveryPoints.balance.lifetimeRedeemed + reward.cost,
            },
            transactions: {
              ...state.recoveryPoints.transactions,
              [transactionId]: transaction,
            },
            redemptions: {
              ...state.recoveryPoints.redemptions,
              [redemptionId]: redemption,
            },
          },
        }));

        get().trackAnalyticsEvent('recovery_reward_redeemed', {
          rewardId,
          cost: reward.cost,
          notes,
        });
      },

      exportRecoveryPointsSummary: () => {
        const state = get();
        const transactions = Object.values(state.recoveryPoints.transactions || {});

        const awardsBySource: Partial<Record<RecoveryPointSource, number>> = {};
        let lastAwardedAt: string | undefined;
        let lastRedeemedAt: string | undefined;

        transactions.forEach((transaction) => {
          if (transaction.type === 'award') {
            awardsBySource[transaction.source] =
              (awardsBySource[transaction.source] || 0) + transaction.amount;
            if (!lastAwardedAt || transaction.timestamp > lastAwardedAt) {
              lastAwardedAt = transaction.timestamp;
            }
          } else if (transaction.type === 'redeem') {
            if (!lastRedeemedAt || transaction.timestamp > lastRedeemedAt) {
              lastRedeemedAt = transaction.timestamp;
            }
          }
        });

        const summary: RecoveryPointSummary = {
          currentBalance: state.recoveryPoints.balance.current,
          lifetimeEarned: state.recoveryPoints.balance.lifetimeEarned,
          lifetimeRedeemed: state.recoveryPoints.balance.lifetimeRedeemed,
          transactionCount: transactions.length,
          awardsBySource: awardsBySource as RecoveryPointSummary['awardsBySource'],
          lastAwardedAt,
          lastRedeemedAt,
        };

        get().trackAnalyticsEvent('recovery_points_summary_exported', {
          transactionCount: summary.transactionCount,
          currentBalance: summary.currentBalance,
          lifetimeEarned: summary.lifetimeEarned,
          lifetimeRedeemed: summary.lifetimeRedeemed,
        });

        return summary;
      },

      // Analytics (V3)
      trackAnalyticsEvent: (type, metadata) => {
        const state = get();
        if (!state.settings.analytics.enabled) {
          return;
        }

        const id = `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const event: AnalyticsEvent = {
          id,
          type,
          timestamp: new Date().toISOString(),
          metadata,
        };

        set((state) => ({
          analyticsEvents: {
            ...state.analyticsEvents,
            [id]: event,
          },
        }));
      },

      getAnalyticsEvents: () => {
        return get().analyticsEvents || {};
      },

      clearOldAnalyticsEvents: () => set((state) => {
        const retentionDays = state.settings.analytics.retentionDays;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const cutoffTimestamp = cutoffDate.toISOString();

        const cleaned: Record<string, AnalyticsEvent> = {};
        for (const [id, event] of Object.entries(state.analyticsEvents || {})) {
          if (event.timestamp >= cutoffTimestamp) {
            cleaned[id] = event;
          }
        }

        return { analyticsEvents: cleaned };
      }),

      updateAnalyticsSettings: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          analytics: {
            ...state.settings.analytics,
            ...updates,
          },
        },
      })),

      // AI Sponsor Chat (V4)
      addAISponsorMessage: (message) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const timestamp = new Date().toISOString();

        set((state) => ({
          aiSponsorChat: {
            messages: {
              ...state.aiSponsorChat?.messages,
              [id]: {
                id,
                timestamp,
                ...message,
              },
            },
            isTyping: state.aiSponsorChat?.isTyping || false,
            chatMode: state.aiSponsorChat?.chatMode || 'standard',
            isRecording: state.aiSponsorChat?.isRecording || false,
            lastMessageTimestamp: timestamp,
          },
        }));

        // Track analytics if enabled
        if (get().settings.analytics.enabled) {
          const eventType: AnalyticsEventType =
            message.role === 'user'
              ? 'ai_sponsor_message_sent'
              : 'ai_sponsor_message_received';
          get().trackAnalyticsEvent(eventType, { messageLength: message.content.length });
        }
      },

      getAISponsorMessages: () => {
        const messages = get().aiSponsorChat?.messages || {};
        return Object.values(messages).sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      },

      setAISponsorTyping: (isTyping) => set((state) => ({
        aiSponsorChat: {
          ...state.aiSponsorChat,
          messages: state.aiSponsorChat?.messages || {},
          chatMode: state.aiSponsorChat?.chatMode || 'standard',
          isRecording: state.aiSponsorChat?.isRecording || false,
          isTyping,
        },
      })),

      clearAISponsorChat: () => set({
        aiSponsorChat: {
          messages: {},
          isTyping: false,
          chatMode: 'standard',
          isRecording: false,
        },
      }),

      setAISponsorChatMode: (mode) => set((state) => ({
        aiSponsorChat: {
          ...state.aiSponsorChat,
          messages: state.aiSponsorChat?.messages || {},
          isTyping: state.aiSponsorChat?.isTyping || false,
          isRecording: state.aiSponsorChat?.isRecording || false,
          chatMode: mode,
        },
      })),

      setAISponsorRecording: (isRecording) => set((state) => ({
        aiSponsorChat: {
          ...state.aiSponsorChat,
          messages: state.aiSponsorChat?.messages || {},
          isTyping: state.aiSponsorChat?.isTyping || false,
          chatMode: state.aiSponsorChat?.chatMode || 'standard',
          isRecording,
        },
      })),
    }),
    {
      name: 'recovery-companion-storage',
      version: CURRENT_VERSION,
      migrate: (persistedState: any, version: number) => {
        return migrateState(persistedState);
      },
      storage: {
        getItem: async (name) => {
          const str = await storageManager.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: async (name, value) => {
          await storageManager.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await storageManager.removeItem(name);
        },
      },
    }
  )
);
