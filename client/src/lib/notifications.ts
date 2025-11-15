import type { NotificationSettings, Meeting } from '@/types';

/**
 * Singleton class to manage push notifications
 */
export class NotificationManager {
  private static instance: NotificationManager;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Schedule all recurring notifications based on settings
   */
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

  /**
   * Clear all scheduled notifications
   */
  async clearNotifications(): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_NOTIFICATIONS'
      });
    }
  }

  /**
   * Show immediate milestone notification
   */
  async showMilestoneNotification(milestone: string, message: string, settings: NotificationSettings): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Check quiet hours
    if (this.isQuietHours(settings)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const options: NotificationOptions & {
      vibrate?: number[];
      actions?: Array<{ action: string; title: string }>;
    } = {
      body: message,
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: 'milestone',
      vibrate: [200, 100, 200],
      data: { type: 'milestone' },
      actions: [
        { action: 'celebrate', title: 'Celebrate!' },
        { action: 'later', title: 'Later' }
      ]
    };
    registration.showNotification(`🎉 ${milestone}!`, options);
  }

  /**
   * Show streak reminder notification
   */
  async showStreakReminder(streakType: string, settings: NotificationSettings): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Check quiet hours
    if (this.isQuietHours(settings)) {
      return;
    }

    // Only show if close to midnight and no activity today
    const now = new Date();
    const hour = now.getHours();

    // Show between 8 PM and 11 PM
    if (hour < 20 || hour >= 23) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const options: NotificationOptions & {
      actions?: Array<{ action: string; title: string }>;
    } = {
      body: `Don't forget to ${streakType} today to maintain your streak`,
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: 'streak-reminder',
      data: { type: 'streak-reminder', streakType },
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };
    registration.showNotification('Keep your streak going! 🔥', options);
  }

  /**
   * Schedule meeting reminder notification
   */
  async scheduleMeetingReminder(
    meeting: Meeting,
    reminderMinutesBefore: number,
    settings: NotificationSettings
  ): Promise<void> {
    if (!settings.meetingReminders.enabled) {
      return;
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Send to service worker to schedule
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_MEETING_REMINDER',
        meeting: {
          id: meeting.id,
          name: meeting.name,
          dayOfWeek: meeting.dayOfWeek,
          time: meeting.time,
          reminderMinutesBefore,
        },
        settings: settings.meetingReminders,
        quietHours: settings.quietHours, // Pass quiet hours settings
      });
    }
  }

  /**
   * Cancel meeting reminder notification
   */
  async cancelMeetingReminder(meetingId: string): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CANCEL_MEETING_REMINDER',
        meetingId,
      });
    }
  }

  /**
   * Show immediate meeting reminder notification
   */
  async showMeetingReminder(
    meeting: Meeting,
    minutesUntil: number,
    settings: NotificationSettings
  ): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Check quiet hours if enabled
    if (settings.meetingReminders.respectQuietHours && this.isQuietHours(settings)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const locationText = meeting.location
      ? `${meeting.location.city}, ${meeting.location.state || meeting.location.country}`
      : 'Online meeting';

    const options: NotificationOptions & {
      actions?: Array<{ action: string; title: string }>;
    } = {
      body: `${meeting.name} starts ${minutesUntil === 0 ? 'now' : `in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`}. ${locationText}`,
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: `meeting-reminder-${meeting.id}`,
      data: {
        type: 'meeting-reminder',
        meetingId: meeting.id,
        meetingName: meeting.name,
      },
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'directions', title: 'Directions' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    registration.showNotification(`Meeting Reminder: ${meeting.name}`, options);
  }

  /**
   * Check if current time is within quiet hours
   */
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
