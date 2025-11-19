/**
 * Test utilities for React component testing
 * Provides helpers for rendering components with providers and mocking store
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import type { AppState } from '@/types';

// Mock the store - this will be overridden in individual tests
vi.mock('@/store/useAppStore', () => ({
  useAppStore: vi.fn(),
}));

/**
 * Create a test query client with default options
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Default mock store state for testing
 */
export const createMockStoreState = (overrides?: Partial<AppState>): AppState => {
  const defaultState: AppState = {
    // Profile
    profile: {
      id: 'test-user-1',
      name: 'Test User',
      handle: 'testuser',
      timezone: 'America/New_York',
      cleanDateISO: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      program: 'NA',
      avatarUrl: null,
    },
    onboardingComplete: true,

    // Settings
    settings: {
      theme: 'system',
      highContrast: false,
      reducedMotion: false,
      notificationsEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:00',
    },

    // Empty collections
    stepAnswers: {},
    dailyCards: {},
    journalEntries: [],
    worksheetResponses: [],
    emergencyActions: [],
    contacts: [],
    streaks: {},
    celebratedMilestones: {},
    unlockedAchievements: {},
    completedChallenges: {},
    analyticsEvents: [],
    recoveryPointsLedger: [],
    aiSponsorChat: {
      messages: [],
      lastClearedAtISO: null,
    },
    copilotSettings: {
      enabled: false,
      frequency: 'daily',
    },
    recoveryScenes: [],
    sponsorRelationships: [],
    sharedItems: {},
    riskSignals: {},
    jitaiRules: [],
    interventionFeedback: [],
    copingToolUsage: [],
    copingToolEffectiveness: [],
    copingToolRecommendations: [],
    safetyPlans: {},
    safetyPlanUsage: [],
    meetingCache: null,
    meetingSearchFilters: {
      dayOfWeek: null,
      timeRange: null,
      distance: null,
      format: null,
    },
    favoriteMeetings: [],

    // Store methods (mocked)
    updateProfile: vi.fn(),
    updateSettings: vi.fn(),
    updateNotificationSettings: vi.fn(),
    enableNotifications: vi.fn(),
    disableNotifications: vi.fn(),
    updateNotificationPermission: vi.fn(),
    setStepAnswer: vi.fn(),
    getStepAnswers: vi.fn(() => []),
    getDailyCard: vi.fn(() => null),
    updateDailyCard: vi.fn(),
    addJournalEntry: vi.fn(),
    updateJournalEntry: vi.fn(),
    deleteJournalEntry: vi.fn(),
    addWorksheetResponse: vi.fn(),
    updateWorksheetResponse: vi.fn(),
    deleteWorksheetResponse: vi.fn(),
    updateEmergencyActions: vi.fn(),
    addContact: vi.fn(),
    updateContact: vi.fn(),
    deleteContact: vi.fn(),
    getContacts: vi.fn(() => []),
    checkAllStreaks: vi.fn(),
    celebrateMilestone: vi.fn(),
    unlockAchievement: vi.fn(),
    completeChallenge: vi.fn(),
    trackAnalyticsEvent: vi.fn(),
    awardPoints: vi.fn(),
    addAISponsorMessage: vi.fn(),
    clearAISponsorChat: vi.fn(),
    updateCopilotSettings: vi.fn(),
    addRecoveryScene: vi.fn(),
    updateRecoveryScene: vi.fn(),
    deleteRecoveryScene: vi.fn(),
    generateSponsorCode: vi.fn(() => '123456'),
    connectToSponsor: vi.fn(),
    getActiveRelationships: vi.fn(() => []),
    acceptConnection: vi.fn(),
    revokeConnection: vi.fn(),
    shareItem: vi.fn(),
    revokeSharing: vi.fn(),
    detectRiskSignals: vi.fn(),
    dismissRiskSignal: vi.fn(),
    recordToolUsage: vi.fn(),
    recordToolEffectiveness: vi.fn(),
    createSafetyPlan: vi.fn(),
    updateSafetyPlan: vi.fn(),
    deleteSafetyPlan: vi.fn(),
    getSafetyPlan: vi.fn(() => null),
    recordSafetyPlanUsage: vi.fn(),
    setBMLTConfig: vi.fn(),
    addFavoriteMeeting: vi.fn(),
    removeFavoriteMeeting: vi.fn(),
    setMeetingCache: vi.fn(),
    updateMeetingSearchFilters: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    setMorningIntention: vi.fn(),
    setMiddayPulseCheck: vi.fn(),
    setEveningInventory: vi.fn(),
    bmltApiRoot: null,
    bmltApiKey: null,
  };

  return { ...defaultState, ...overrides } as AppState;
};

/**
 * Custom render function that includes all necessary providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient = createTestQueryClient(),
    storeOverrides,
    ...renderOptions
  }: RenderOptions & {
    queryClient?: QueryClient;
    storeOverrides?: Partial<AppState>;
  } = {}
) {
  // Mock the store
  const mockState = createMockStoreState(storeOverrides);
  const { useAppStore } = require('@/store/useAppStore');
  vi.mocked(useAppStore).mockImplementation((selector: any) => {
    return selector(mockState);
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
    mockState,
  };
}

/**
 * Mock wouter router for testing
 */
export function mockRouter(path = '/') {
  const mockSetLocation = vi.fn();
  const mockLocation = vi.fn(() => path);

  vi.mock('wouter', async () => {
    const actual = await vi.importActual('wouter');
    return {
      ...actual,
      useLocation: () => [path, mockSetLocation],
      useRoute: () => [true, {}],
      Link: ({ children, href, ...props }: any) => (
        <a href={href} {...props} onClick={(e) => {
          e.preventDefault();
          mockSetLocation(href);
        }}>
          {children}
        </a>
      ),
    };
  });

  return { mockSetLocation, mockLocation };
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create a mock date for testing
 */
export function createMockDate(year: number, month: number, day: number, hours = 0, minutes = 0) {
  const date = new Date(year, month - 1, day, hours, minutes);
  vi.useFakeTimers();
  vi.setSystemTime(date);
  return date;
}

/**
 * Restore real timers
 */
export function restoreTimers() {
  vi.useRealTimers();
}

