# Recovery Companion 2.0 - Technical Architecture

## Overview

This document defines the technical implementation for all V2 features, maintaining our local-first, privacy-focused architecture while adding engagement features.

---

## 🗄️ Database Schema Updates

### 1. Streaks Schema

```typescript
// Add to client/src/types.ts

export interface StreakData {
  type: 'journaling' | 'dailyCards' | 'meetings' | 'stepWork';
  current: number;
  longest: number;
  lastActivityDate: string; // ISO 8601
  startDate: string; // ISO 8601 - when current streak started
  history: StreakHistoryEntry[];
}

export interface StreakHistoryEntry {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Streaks {
  journaling: StreakData;
  dailyCards: StreakData;
  meetings: StreakData;
  stepWork: StreakData;
}

// Add to AppState
export interface AppState {
  // ... existing fields
  streaks: Streaks;
}
```

**Default State**:
```typescript
const initialStreaks: Streaks = {
  journaling: {
    type: 'journaling',
    current: 0,
    longest: 0,
    lastActivityDate: '',
    startDate: '',
    history: []
  },
  dailyCards: {
    type: 'dailyCards',
    current: 0,
    longest: 0,
    lastActivityDate: '',
    startDate: '',
    history: []
  },
  meetings: {
    type: 'meetings',
    current: 0,
    longest: 0,
    lastActivityDate: '',
    startDate: '',
    history: []
  },
  stepWork: {
    type: 'stepWork',
    current: 0,
    longest: 0,
    lastActivityDate: '',
    startDate: '',
    history: []
  }
};
```

---

### 2. Achievements Schema

```typescript
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'sobriety' | 'step-work' | 'community' | 'self-care' | 'crisis';
  icon: string; // Emoji or Lucide icon name
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  requirement: AchievementRequirement;
  hidden: boolean; // For surprise achievements
}

export interface AchievementRequirement {
  type: 'cleanDays' | 'stepCompletion' | 'journalEntries' | 'meetingsLogged' | 'streakDays';
  count: number;
  metadata?: Record<string, any>; // For complex requirements
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string; // ISO 8601
  viewed: boolean; // Has user seen the unlock notification?
}

// Add to AppState
export interface AppState {
  // ... existing fields
  unlockedAchievements: Record<string, UnlockedAchievement>; // achievementId -> unlock data
}
```

**Achievement Definitions** (Static Data):
```typescript
// client/src/data/achievements.ts

export const ACHIEVEMENTS: Achievement[] = [
  // Sobriety Milestones (Epic/Rare)
  {
    id: 'first-light',
    title: 'First Light',
    description: '24 hours clean',
    category: 'sobriety',
    icon: '🌅',
    rarity: 'epic',
    requirement: { type: 'cleanDays', count: 1 },
    hidden: false
  },
  {
    id: 'new-beginnings',
    title: 'New Beginnings',
    description: '7 days clean',
    category: 'sobriety',
    icon: '🌱',
    rarity: 'rare',
    requirement: { type: 'cleanDays', count: 7 },
    hidden: false
  },
  {
    id: 'growing-strong',
    title: 'Growing Strong',
    description: '30 days clean',
    category: 'sobriety',
    icon: '🌿',
    rarity: 'rare',
    requirement: { type: 'cleanDays', count: 30 },
    hidden: false
  },
  {
    id: 'deep-roots',
    title: 'Deep Roots',
    description: '90 days clean',
    category: 'sobriety',
    icon: '🌳',
    rarity: 'epic',
    requirement: { type: 'cleanDays', count: 90 },
    hidden: false
  },

  // Step Work (Uncommon/Rare)
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Completed all Step 1 questions',
    category: 'step-work',
    icon: '📖',
    rarity: 'uncommon',
    requirement: { type: 'stepCompletion', count: 1 },
    hidden: false
  },

  // Community (Common/Uncommon)
  {
    id: 'fellowship',
    title: 'Fellowship',
    description: 'Logged your first meeting',
    category: 'community',
    icon: '🤝',
    rarity: 'common',
    requirement: { type: 'meetingsLogged', count: 1 },
    hidden: false
  },

  // Self-Care (Common)
  {
    id: 'grateful-heart',
    title: 'Grateful Heart',
    description: 'Listed gratitude 7 days in a row',
    category: 'self-care',
    icon: '🙏',
    rarity: 'common',
    requirement: { type: 'streakDays', count: 7, metadata: { streakType: 'dailyCards' } },
    hidden: false
  },

  // Hidden Achievements (Surprise)
  {
    id: 'midnight-oil',
    title: 'Midnight Oil',
    description: 'Journaled between midnight and 3am',
    category: 'self-care',
    icon: '🌟',
    rarity: 'rare',
    requirement: { type: 'journalEntries', count: 1, metadata: { timeRange: '00:00-03:00' } },
    hidden: true
  }

  // ... more achievements
];
```

---

### 3. Daily Challenges Schema

```typescript
export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  theme: 'connection' | 'step-work' | 'gratitude' | 'self-care' | 'reflection' | 'fellowship';
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string; // ISO 8601
  notes?: string; // Optional user notes about completion
}

// Add to AppState
export interface AppState {
  // ... existing fields
  dailyChallenges: Record<string, DailyChallenge>; // date -> challenge
  challengeStreak: number; // Consecutive days completing challenges
}
```

**Challenge Generation Logic**:
```typescript
// client/src/lib/challenges.ts

interface ChallengeTemplate {
  theme: string;
  challenges: string[];
}

const CHALLENGE_TEMPLATES: Record<number, ChallengeTemplate> = {
  1: { // Monday - Connection
    theme: 'connection',
    challenges: [
      'Call or text your sponsor',
      'Reach out to a fellowship friend',
      'Attend a meeting today',
      'Share something in a meeting'
    ]
  },
  2: { // Tuesday - Step Work
    theme: 'step-work',
    challenges: [
      'Answer 3 step questions',
      'Review your Step 4 inventory',
      'Read from the basic text for 10 minutes',
      'Reflect on your recovery journey'
    ]
  },
  // ... more days
};

export function generateDailyChallenge(date: Date, userContext: UserContext): DailyChallenge {
  const dayOfWeek = date.getDay();
  const template = CHALLENGE_TEMPLATES[dayOfWeek];

  // Select challenge based on user's clean time, preferences, etc.
  const selectedChallenge = selectPersonalizedChallenge(template, userContext);

  return {
    id: `challenge_${date.toISOString().split('T')[0]}`,
    date: date.toISOString().split('T')[0],
    dayOfWeek,
    theme: template.theme,
    title: getDayThemeTitle(dayOfWeek),
    description: selectedChallenge,
    completed: false
  };
}
```

---

### 4. Notification Settings Schema

```typescript
export interface NotificationSettings {
  enabled: boolean;
  permission: 'granted' | 'denied' | 'default';

  morningCheckIn: {
    enabled: boolean;
    time: string; // HH:MM format (24-hour)
  };

  eveningReflection: {
    enabled: boolean;
    time: string; // HH:MM format
  };

  milestoneAlerts: boolean;
  streakReminders: boolean;
  challengeReminders: boolean;

  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

// Add to AppSettings
export interface AppSettings {
  // ... existing fields
  notifications: NotificationSettings;
}
```

**Default Notification Settings**:
```typescript
const defaultNotificationSettings: NotificationSettings = {
  enabled: false, // User must opt-in
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
```

---

### 5. Analytics Schema (Optional, Opt-In)

```typescript
export interface AnalyticsSettings {
  enabled: boolean;
  anonymousId: string; // Generated UUID, no PII
  optInDate?: string; // When user opted in
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string; // ISO 8601
  anonymousId: string;
}

// Add to AppSettings
export interface AppSettings {
  // ... existing fields
  analytics: AnalyticsSettings;
}
```

**Event Taxonomy**:
```typescript
// client/src/lib/analytics/events.ts

export const AnalyticsEvents = {
  // Lifecycle
  APP_OPENED: 'app_opened',
  APP_CLOSED: 'app_closed',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_ABANDONED: 'onboarding_abandoned',

  // Features
  FEATURE_USED: 'feature_used', // { feature: string, duration: number }
  QUICK_ACTION_COMPLETED: 'quick_action_completed', // { action: string, timeToComplete: number }

  // Notifications
  NOTIFICATION_PERMISSION_REQUESTED: 'notification_permission_requested',
  NOTIFICATION_PERMISSION_GRANTED: 'notification_permission_granted',
  NOTIFICATION_PERMISSION_DENIED: 'notification_permission_denied',
  NOTIFICATION_RECEIVED: 'notification_received', // { type: string }
  NOTIFICATION_TAPPED: 'notification_tapped', // { type: string }

  // Streaks
  STREAK_MILESTONE: 'streak_milestone', // { type: string, days: number }
  STREAK_BROKEN: 'streak_broken', // { type: string, daysLost: number }

  // Achievements
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked', // { achievementId: string, rarity: string }
  ACHIEVEMENT_VIEWED: 'achievement_viewed',

  // Daily Challenges
  CHALLENGE_COMPLETED: 'challenge_completed', // { theme: string, dayOfWeek: number }
  CHALLENGE_SKIPPED: 'challenge_skipped',

  // Recovery Metrics
  SOBRIETY_MILESTONE: 'sobriety_milestone', // { days: number }
  JOURNAL_ENTRY_CREATED: 'journal_entry_created', // { voiceUsed: boolean }
  STEP_ANSWER_SAVED: 'step_answer_saved', // { stepNumber: number }
  MEETING_LOGGED: 'meeting_logged',

  // Crisis
  CRISIS_MODE_ACTIVATED: 'crisis_mode_activated',
  EMERGENCY_CONTACT_USED: 'emergency_contact_used',
  BREATHING_EXERCISE_COMPLETED: 'breathing_exercise_completed',

  // Retention Signals
  INACTIVE_24HR: 'inactive_24hr',
  INACTIVE_72HR: 'inactive_72hr',
  INACTIVE_7DAY: 'inactive_7day',
} as const;
```

---

## 🔧 State Management Architecture

### Zustand Store Updates

```typescript
// client/src/store/useAppStore.ts

interface AppStore extends AppState {
  // ... existing methods

  // Streak Management
  updateStreak: (type: StreakData['type']) => void;
  checkStreaks: () => void; // Call on app open to update all streaks
  getStreak: (type: StreakData['type']) => StreakData;

  // Achievement Management
  checkAchievements: () => void; // Check if any new achievements unlocked
  unlockAchievement: (achievementId: string) => void;
  markAchievementViewed: (achievementId: string) => void;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getAchievementProgress: (achievementId: string) => number; // 0-100

  // Daily Challenge Management
  getTodaysChallenge: () => DailyChallenge | null;
  completeChallenge: (date: string, notes?: string) => void;
  skipChallenge: (date: string) => void;
  getChallengeStreak: () => number;

  // Notification Management
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  scheduleNotifications: () => Promise<void>;
  clearNotifications: () => Promise<void>;

  // Analytics (Optional)
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
}
```

### Streak Update Logic

```typescript
// client/src/store/streaks.ts

export function updateStreak(
  currentStreak: StreakData,
  activityDate: string // ISO 8601
): StreakData {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const lastActivity = currentStreak.lastActivityDate.split('T')[0];
  const activityDateOnly = activityDate.split('T')[0];

  // If activity is today
  if (activityDateOnly === today) {
    // If last activity was yesterday, continue streak
    if (lastActivity === yesterday) {
      return {
        ...currentStreak,
        current: currentStreak.current + 1,
        longest: Math.max(currentStreak.current + 1, currentStreak.longest),
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

  return currentStreak;
}

export function checkAllStreaks(state: AppState): Partial<AppState> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const updates: Partial<AppState> = { streaks: { ...state.streaks } };

  // Check each streak type
  Object.keys(state.streaks).forEach((key) => {
    const streakType = key as keyof Streaks;
    const streak = state.streaks[streakType];
    const lastActivity = streak.lastActivityDate.split('T')[0];

    // If last activity was not today or yesterday, streak is broken
    if (lastActivity !== today && lastActivity !== yesterday && streak.current > 0) {
      updates.streaks![streakType] = {
        ...streak,
        current: 0,
        startDate: ''
      };

      // Track streak broken event
      if (state.settings.analytics.enabled) {
        trackEvent('streak_broken', {
          type: streakType,
          daysLost: streak.current
        });
      }
    }
  });

  return updates;
}
```

### Achievement Check Logic

```typescript
// client/src/store/achievements.ts

import { ACHIEVEMENTS } from '@/data/achievements';

export function checkAchievements(state: AppState): string[] {
  const newUnlocks: string[] = [];

  ACHIEVEMENTS.forEach((achievement) => {
    // Skip if already unlocked
    if (state.unlockedAchievements[achievement.id]) {
      return;
    }

    // Check if requirement met
    const progress = calculateAchievementProgress(achievement, state);
    if (progress >= 100) {
      newUnlocks.push(achievement.id);
    }
  });

  return newUnlocks;
}

export function calculateAchievementProgress(
  achievement: Achievement,
  state: AppState
): number {
  const { requirement } = achievement;

  switch (requirement.type) {
    case 'cleanDays': {
      if (!state.profile?.cleanDate) return 0;
      const cleanDays = Math.floor(
        (Date.now() - new Date(state.profile.cleanDate).getTime()) / 86400000
      );
      return Math.min(100, (cleanDays / requirement.count) * 100);
    }

    case 'stepCompletion': {
      const stepNumber = requirement.count;
      const stepAnswers = Object.values(state.stepAnswers).filter(
        (answer) => answer.stepNumber === stepNumber
      );
      // Assuming we know total questions per step
      const totalQuestions = getStepQuestionCount(stepNumber);
      return Math.min(100, (stepAnswers.length / totalQuestions) * 100);
    }

    case 'journalEntries': {
      const entries = Object.values(state.journalEntries);

      // Check for metadata constraints (e.g., time range)
      if (requirement.metadata?.timeRange) {
        const [start, end] = requirement.metadata.timeRange.split('-');
        const matchingEntries = entries.filter((entry) => {
          const entryTime = new Date(entry.date).toTimeString().slice(0, 5);
          return entryTime >= start && entryTime <= end;
        });
        return matchingEntries.length >= requirement.count ? 100 : 0;
      }

      return Math.min(100, (entries.length / requirement.count) * 100);
    }

    case 'meetingsLogged': {
      const meetingCount = state.meetings?.length || 0;
      return Math.min(100, (meetingCount / requirement.count) * 100);
    }

    case 'streakDays': {
      const streakType = requirement.metadata?.streakType as keyof Streaks;
      const currentStreak = state.streaks[streakType].current;
      return Math.min(100, (currentStreak / requirement.count) * 100);
    }

    default:
      return 0;
  }
}
```

---

## 🔔 Notification System Architecture

### Service Worker Updates

```typescript
// client/src/service-worker.ts (extend existing)

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';

// Existing precaching...

// Listen for notification scheduling
self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleAllNotifications(event.data.settings);
  }

  if (event.data.type === 'CLEAR_NOTIFICATIONS') {
    clearAllScheduledNotifications();
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationType = event.notification.data?.type;
  const action = event.action;

  // Handle different notification types
  switch (notificationType) {
    case 'morning-checkin':
      if (action === 'open') {
        clients.openWindow('/?modal=daily-intention');
      }
      break;

    case 'evening-reflection':
      if (action === 'quick-journal') {
        clients.openWindow('/?modal=quick-journal');
      }
      break;

    case 'milestone':
      clients.openWindow('/?modal=celebration');
      break;

    case 'streak-reminder':
      clients.openWindow('/?modal=quick-journal');
      break;

    default:
      clients.openWindow('/');
  }
});

// Notification scheduling logic
async function scheduleAllNotifications(settings: NotificationSettings) {
  if (!settings.enabled) return;

  const notifications = [];

  // Morning check-in
  if (settings.morningCheckIn.enabled) {
    const morningTime = parseTime(settings.morningCheckIn.time);
    notifications.push({
      type: 'morning-checkin',
      time: morningTime,
      title: 'Good morning! ☀️',
      body: 'Set your intention for today',
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }

  // Evening reflection
  if (settings.eveningReflection.enabled) {
    const eveningTime = parseTime(settings.eveningReflection.time);
    notifications.push({
      type: 'evening-reflection',
      time: eveningTime,
      title: 'How was your day? 🌙',
      body: 'Take a moment to reflect',
      actions: [
        { action: 'quick-journal', title: 'Quick Journal' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }

  // Schedule using system alarms (if available) or set timers
  notifications.forEach(scheduleNotification);
}

function scheduleNotification(notification: any) {
  // Use Notification Triggers API if available (Chrome 83+)
  if ('showTrigger' in Notification.prototype) {
    const targetTime = getNextOccurrence(notification.time);

    registration.showNotification(notification.title, {
      body: notification.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: notification.type,
      data: { type: notification.type },
      actions: notification.actions,
      showTrigger: new TimestampTrigger(targetTime)
    });
  } else {
    // Fallback: Use setTimeout (requires app to be open)
    // Better approach: Use periodic background sync (requires service)
    console.warn('Notification Triggers API not available. Notifications require app to be periodically active.');
  }
}
```

### Client-Side Notification Manager

```typescript
// client/src/lib/notifications.ts

export class NotificationManager {
  private static instance: NotificationManager;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async scheduleNotifications(settings: NotificationSettings): Promise<void> {
    if (!settings.enabled || settings.permission !== 'granted') {
      return;
    }

    // Send settings to service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATIONS',
        settings
      });
    }
  }

  async clearNotifications(): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_NOTIFICATIONS'
      });
    }
  }

  async showMilestoneNotification(milestone: string, message: string): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Check quiet hours
    const settings = useAppStore.getState().settings.notifications;
    if (this.isQuietHours(settings)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(`🎉 ${milestone}!`, {
      body: message,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: 'milestone',
      vibrate: [200, 100, 200],
      data: { type: 'milestone' },
      actions: [
        { action: 'celebrate', title: 'Celebrate!' },
        { action: 'later', title: 'Later' }
      ]
    });
  }

  private isQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = settings.quietHours;

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }

    return currentTime >= start && currentTime <= end;
  }
}

export const notificationManager = NotificationManager.getInstance();
```

---

## 📊 Analytics Architecture (Optional, Opt-In)

### Analytics Manager

```typescript
// client/src/lib/analytics/manager.ts

import { AnalyticsEvent, AnalyticsSettings } from '@/types';
import { AnalyticsEvents } from './events';

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private queue: AnalyticsEvent[] = [];
  private flushInterval: number | null = null;

  private constructor() {
    // Flush queue every 30 seconds if analytics enabled
    this.flushInterval = window.setInterval(() => {
      this.flush();
    }, 30000);
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  track(event: string, properties?: Record<string, any>): void {
    const settings = useAppStore.getState().settings.analytics;

    if (!settings.enabled) {
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: this.sanitizeProperties(properties),
      timestamp: new Date().toISOString(),
      anonymousId: settings.anonymousId
    };

    this.queue.push(analyticsEvent);

    // Flush immediately for critical events
    if (this.isCriticalEvent(event)) {
      this.flush();
    }
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined;

    // Remove any PII that might have accidentally been included
    const sanitized = { ...properties };

    // Remove fields that might contain PII
    const piiFields = ['name', 'email', 'phone', 'address', 'sponsor'];
    piiFields.forEach((field) => {
      if (field in sanitized) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }

  private isCriticalEvent(event: string): boolean {
    const criticalEvents = [
      AnalyticsEvents.CRISIS_MODE_ACTIVATED,
      AnalyticsEvents.EMERGENCY_CONTACT_USED
    ];
    return criticalEvents.includes(event as any);
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    // In future, send to server
    // For now, just log locally (privacy-first)
    console.log('[Analytics] Events:', events);

    // Store in localStorage for local analysis
    this.storeLocally(events);
  }

  private storeLocally(events: AnalyticsEvent[]): void {
    try {
      const stored = localStorage.getItem('analytics_events');
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [...existing, ...events].slice(-1000); // Keep last 1000 events
      localStorage.setItem('analytics_events', JSON.stringify(updated));
    } catch (error) {
      console.error('[Analytics] Failed to store events locally:', error);
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const analytics = AnalyticsManager.getInstance();

// Convenience functions
export function trackEvent(event: string, properties?: Record<string, any>): void {
  analytics.track(event, properties);
}
```

### Analytics Hooks

```typescript
// client/src/hooks/useAnalytics.ts

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/manager';
import { AnalyticsEvents } from '@/lib/analytics/events';

export function usePageView(pageName: string) {
  useEffect(() => {
    trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature: pageName,
      timestamp: Date.now()
    });

    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature: pageName,
        duration
      });
    };
  }, [pageName]);
}

export function useFeatureTracking(featureName: string) {
  return {
    trackUsage: (action: string, metadata?: Record<string, any>) => {
      trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature: featureName,
        action,
        ...metadata
      });
    }
  };
}
```

---

## 🎨 Component Architecture

### New Shared Components

```typescript
// client/src/components/StreakCard.tsx
interface StreakCardProps {
  title: string;
  icon: LucideIcon;
  streak: StreakData;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}

// client/src/components/QuickActionModal.tsx
interface QuickActionModalProps {
  type: 'journal' | 'gratitude' | 'meeting' | 'step-question';
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

// client/src/components/CelebrationModal.tsx
interface CelebrationModalProps {
  milestone: string;
  message: string;
  icon: string;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
  onJournal?: () => void;
}

// client/src/components/AchievementCard.tsx
interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number; // 0-100
  onClick?: () => void;
}

// client/src/components/DailyChallengeCard.tsx
interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  onComplete: (notes?: string) => void;
  onSkip: () => void;
}

// client/src/components/VoiceRecorder.tsx
interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onComplete: () => void;
  initialText?: string;
}
```

---

## 🔄 Data Migration Strategy

```typescript
// client/src/store/migrations.ts

export const MIGRATIONS = {
  // ... existing migrations

  2: (state: any) => {
    // Add streaks
    if (!state.streaks) {
      state.streaks = initialStreaks;
    }
    return state;
  },

  3: (state: any) => {
    // Add achievements
    if (!state.unlockedAchievements) {
      state.unlockedAchievements = {};
    }
    return state;
  },

  4: (state: any) => {
    // Add daily challenges
    if (!state.dailyChallenges) {
      state.dailyChallenges = {};
    }
    if (typeof state.challengeStreak === 'undefined') {
      state.challengeStreak = 0;
    }
    return state;
  },

  5: (state: any) => {
    // Add notification settings
    if (!state.settings.notifications) {
      state.settings.notifications = defaultNotificationSettings;
    }
    return state;
  },

  6: (state: any) => {
    // Add analytics settings
    if (!state.settings.analytics) {
      state.settings.analytics = {
        enabled: false,
        anonymousId: crypto.randomUUID(),
        optInDate: undefined
      };
    }
    return state;
  }
};

export const CURRENT_VERSION = 6;
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// __tests__/streaks.test.ts

describe('Streak Logic', () => {
  it('should increment streak when activity is consecutive days', () => {
    const streak: StreakData = {
      type: 'journaling',
      current: 5,
      longest: 10,
      lastActivityDate: '2025-01-14T10:00:00Z',
      startDate: '2025-01-10T10:00:00Z',
      history: []
    };

    const updated = updateStreak(streak, '2025-01-15T11:00:00Z');

    expect(updated.current).toBe(6);
    expect(updated.longest).toBe(10);
  });

  it('should break streak when activity skips a day', () => {
    const streak: StreakData = {
      type: 'journaling',
      current: 5,
      longest: 10,
      lastActivityDate: '2025-01-13T10:00:00Z',
      startDate: '2025-01-09T10:00:00Z',
      history: []
    };

    const updated = updateStreak(streak, '2025-01-15T11:00:00Z');

    expect(updated.current).toBe(1);
    expect(updated.longest).toBe(10);
  });

  it('should update longest streak when current exceeds it', () => {
    const streak: StreakData = {
      type: 'journaling',
      current: 10,
      longest: 10,
      lastActivityDate: '2025-01-14T10:00:00Z',
      startDate: '2025-01-05T10:00:00Z',
      history: []
    };

    const updated = updateStreak(streak, '2025-01-15T11:00:00Z');

    expect(updated.current).toBe(11);
    expect(updated.longest).toBe(11);
  });
});

// __tests__/achievements.test.ts

describe('Achievement Logic', () => {
  it('should unlock achievement when requirement met', () => {
    const achievement: Achievement = {
      id: 'first-light',
      title: 'First Light',
      description: '24 hours clean',
      category: 'sobriety',
      icon: '🌅',
      rarity: 'epic',
      requirement: { type: 'cleanDays', count: 1 },
      hidden: false
    };

    const state: Partial<AppState> = {
      profile: {
        id: 'user1',
        name: 'Test',
        cleanDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        timezone: 'America/New_York',
        hasPasscode: false
      },
      unlockedAchievements: {}
    };

    const progress = calculateAchievementProgress(achievement, state as AppState);

    expect(progress).toBe(100);
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/onboarding.test.tsx

describe('Onboarding Flow', () => {
  it('should complete onboarding and show sobriety counter', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<App />);

    // Step 1: Welcome
    expect(getByText('Recovery Companion')).toBeInTheDocument();
    fireEvent.click(getByText('Get Started →'));

    // Step 2: Profile
    fireEvent.change(getByPlaceholderText('First name or nickname'), {
      target: { value: 'Alex' }
    });
    fireEvent.click(getByTestId('date-picker'));
    // ... select date
    fireEvent.click(getByText('Continue →'));

    // Step 3: Should show sobriety counter
    await waitFor(() => {
      expect(getByText(/DAYS/)).toBeInTheDocument();
    });
  });
});
```

---

## 📦 Deployment Architecture

### Build Process

```json
// package.json updates

{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "check": "tsc",
    "lint": "eslint client/src server --ext .ts,.tsx"
  }
}
```

### Environment Variables

```typescript
// server/env.ts (NEW FILE)

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  DATABASE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  REPL_ID: z.string().optional(),
  ISSUER_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
```

---

## 🚀 Performance Optimization

### Code Splitting

```typescript
// client/src/App.tsx

import { lazy, Suspense } from 'react';

// Eager load critical routes
import Home from '@/routes/Home';
import Emergency from '@/routes/Emergency';

// Lazy load non-critical routes
const Steps = lazy(() => import('@/routes/Steps'));
const Journal = lazy(() => import('@/routes/Journal'));
const Settings = lazy(() => import('@/routes/Settings'));
const Analytics = lazy(() => import('@/routes/Analytics'));

// Lazy load heavy components
const CelebrationModal = lazy(() => import('@/components/CelebrationModal'));
const AchievementGallery = lazy(() => import('@/components/AchievementGallery'));
```

### Bundle Size Monitoring

```typescript
// vite.config.ts

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'wouter'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-slider', /* ... */],
          'vendor-charts': ['recharts'],
          'confetti': ['canvas-confetti']
        }
      }
    }
  }
});
```

---

## Next Steps

This technical architecture provides the blueprint for implementation. Ready to start coding Phase 1:

**Phase 1A: Streak Tracking** (Next)
- Implement streak data structures
- Add streak update logic to store
- Create StreakCard component
- Add streak visualization to Home page

Shall I proceed with Phase 1A implementation?
