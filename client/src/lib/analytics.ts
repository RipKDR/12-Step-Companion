import type {
  AppState,
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsMetrics,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Privacy-First Analytics Manager
 *
 * This class handles local analytics tracking with strict privacy controls:
 * - All data stored locally (never sent to external servers)
 * - No personally identifiable information (PII) collected
 * - User opt-in required
 * - Configurable data retention
 * - Transparent to users (can view all tracked data)
 */
export class AnalyticsManager {
  private sessionId: string;
  private sessionStartTime: number;

  constructor() {
    this.sessionId = uuidv4();
    this.sessionStartTime = Date.now();
  }

  /**
   * Track an analytics event
   */
  trackEvent(
    type: AnalyticsEventType,
    metadata?: Record<string, any>,
  ): AnalyticsEvent {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      type,
      timestamp: new Date().toISOString(),
      metadata: this.sanitizeMetadata(metadata),
      sessionId: this.sessionId,
    };

    return event;
  }

  /**
   * Sanitize metadata to ensure no PII is included
   */
  private sanitizeMetadata(
    metadata?: Record<string, any>,
  ): Record<string, any> | undefined {
    if (!metadata) return undefined;

    const sanitized: Record<string, any> = {};
    const allowedKeys = [
      "category",
      "type",
      "duration",
      "count",
      "rarity",
      "theme",
      "stepNumber",
      "hasSponsor",
      "hasAudio",
      "hasVoice",
      "streakLength",
      "milestoneDays",
      "achievementCategory",
    ];

    for (const key of allowedKeys) {
      if (key in metadata) {
        sanitized[key] = metadata[key];
      }
    }

    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }

  /**
   * Clean up old analytics events based on retention policy
   */
  cleanupOldEvents(
    events: Record<string, AnalyticsEvent>,
    retentionDays: number,
  ): Record<string, AnalyticsEvent> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTimestamp = cutoffDate.toISOString();

    const cleaned: Record<string, AnalyticsEvent> = {};
    for (const [id, event] of Object.entries(events)) {
      if (event.timestamp >= cutoffTimestamp) {
        cleaned[id] = event;
      }
    }

    return cleaned;
  }

  /**
   * Calculate analytics metrics from current state
   */
  calculateMetrics(state: AppState): AnalyticsMetrics {
    const events = state.analyticsEvents || {};
    const eventsByType: Record<AnalyticsEventType, number> = {
      app_opened: 0,
      profile_created: 0,
      journal_entry_created: 0,
      journal_entry_voice_used: 0,
      journal_entry_audio_recorded: 0,
      daily_card_morning_completed: 0,
      daily_card_evening_completed: 0,
      step_answer_saved: 0,
      meeting_logged: 0,
      goal_created: 0,
      goal_completed: 0,
      crisis_mode_activated: 0,
      emergency_contact_called: 0,
      achievement_unlocked: 0,
      milestone_celebrated: 0,
      daily_challenge_completed: 0,
      streak_extended: 0,
      recovery_points_awarded: 0,
      recovery_reward_redeemed: 0,
      recovery_points_summary_exported: 0,
    };

    // Count events by type
    for (const event of Object.values(events)) {
      if (event.type in eventsByType) {
        eventsByType[event.type]++;
      }
    }

    // Calculate active streaks
    const streaks = state.streaks;
    const activeStreaks = [
      streaks.journaling,
      streaks.dailyCards,
      streaks.meetings,
      streaks.stepWork,
    ].filter((s) => s.current > 0).length;

    // Calculate sobriety days
    let sobrietyDays = 0;
    if (state.profile?.cleanDate) {
      const cleanDate = new Date(state.profile.cleanDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - cleanDate.getTime());
      sobrietyDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // Find last activity date
    const allDates = [
      ...Object.values(state.journalEntries).map((e) => e.date),
      ...Object.values(state.dailyCards).map((c) => c.date),
      ...(state.meetings?.map((m) => m.date) || []),
    ];
    const lastActivityDate =
      allDates.length > 0
        ? allDates.sort().reverse()[0]
        : new Date().toISOString();

    return {
      totalEvents: Object.keys(events).length,
      eventsByType,
      activeStreaks,
      totalJournalEntries: Object.keys(state.journalEntries).length,
      totalMeetings: state.meetings?.length || 0,
      totalGoals: Object.keys(state.goals || {}).length,
      sobrietyDays,
      lastActivityDate,
    };
  }

  /**
   * Get events within a date range
   */
  getEventsByDateRange(
    events: Record<string, AnalyticsEvent>,
    startDate: Date,
    endDate: Date,
  ): AnalyticsEvent[] {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    return Object.values(events).filter(
      (event) => event.timestamp >= startISO && event.timestamp <= endISO,
    );
  }

  /**
   * Get event count by type within date range
   */
  getEventCountByType(
    events: Record<string, AnalyticsEvent>,
    type: AnalyticsEventType,
    startDate?: Date,
    endDate?: Date,
  ): number {
    let filteredEvents = Object.values(events).filter((e) => e.type === type);

    if (startDate && endDate) {
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();
      filteredEvents = filteredEvents.filter(
        (e) => e.timestamp >= startISO && e.timestamp <= endISO,
      );
    }

    return filteredEvents.length;
  }

  /**
   * Get daily event counts for the past N days
   */
  getDailyEventCounts(
    events: Record<string, AnalyticsEvent>,
    days: number,
  ): Record<string, number> {
    const counts: Record<string, number> = {};
    const today = new Date();

    // Initialize all days to 0
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      counts[dateKey] = 0;
    }

    // Count events per day
    for (const event of Object.values(events)) {
      const dateKey = event.timestamp.split("T")[0];
      if (dateKey in counts) {
        counts[dateKey]++;
      }
    }

    return counts;
  }

  /**
   * Export analytics data for transparency
   */
  exportAnalyticsData(state: AppState): {
    metrics: AnalyticsMetrics;
    events: AnalyticsEvent[];
    settings: typeof state.settings.analytics;
  } {
    return {
      metrics: this.calculateMetrics(state),
      events: Object.values(state.analyticsEvents || {}),
      settings: state.settings.analytics,
    };
  }

  /**
   * Get session duration in minutes
   */
  getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000 / 60);
  }
}

// Singleton instance
let analyticsManager: AnalyticsManager | null = null;

export function getAnalyticsManager(): AnalyticsManager {
  if (!analyticsManager) {
    analyticsManager = new AnalyticsManager();
  }
  return analyticsManager;
}

/**
 * Helper to track an event if analytics is enabled
 */
export function trackEvent(
  state: AppState,
  type: AnalyticsEventType,
  metadata?: Record<string, any>,
): AnalyticsEvent | null {
  if (!state.settings.analytics.enabled) {
    return null;
  }

  const manager = getAnalyticsManager();
  return manager.trackEvent(type, metadata);
}
