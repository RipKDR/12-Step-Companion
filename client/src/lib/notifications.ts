import type { NotificationSettings } from '@/types';

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
    registration.showNotification(`🎉 ${milestone}!`, {
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
    });
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
    registration.showNotification('Keep your streak going! 🔥', {
      body: `Don't forget to ${streakType} today to maintain your streak`,
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: 'streak-reminder',
      data: { type: 'streak-reminder', streakType },
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
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
