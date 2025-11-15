/// <reference lib="webworker" />
import type { NotificationSettings } from '@/types';

declare const self: ServiceWorkerGlobalScope;

// Note: VitePWA plugin handles precaching automatically via its own service worker
// This service worker focuses on notification scheduling and meeting reminders

// This is where VitePWA will inject the precache manifest
// @ts-ignore - This is injected by vite-plugin-pwa at build time
const manifest = self.__WB_MANIFEST;

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('recovery-companion-v1').then((cache) => {
      // Precache all assets from manifest
      return cache.addAll(
        manifest.map((entry: { url: string; revision?: string }) => entry.url)
      );
    })
  );
  // Take control of all pages immediately
  self.skipWaiting();
});

// Claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== 'recovery-companion-v1')
            .map((name) => caches.delete(name))
        );
      }),
    ])
  );
});

// Store for scheduled notification timers
const scheduledTimers = new Map<string, number>();
// Store for meeting reminders
const meetingReminders = new Map<string, {
  meeting: {
    id: string;
    name: string;
    dayOfWeek: number;
    time: string;
    reminderMinutesBefore: number;
  };
  settings: {
    enabled: boolean;
    minutesBefore: number[];
    respectQuietHours: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}>();

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleAllNotifications(event.data.settings);
  }

  if (event.data.type === 'CLEAR_NOTIFICATIONS') {
    clearAllScheduledNotifications();
  }

  if (event.data.type === 'CHECK_RISK_SIGNALS') {
    // Risk signal checking will be handled by the client
    // This is a placeholder for future background checking
  }

  if (event.data.type === 'SCHEDULE_MEETING_REMINDER') {
    scheduleMeetingReminder(event.data.meeting, event.data.settings, event.data.quietHours);
  }

  if (event.data.type === 'CANCEL_MEETING_REMINDER') {
    cancelMeetingReminder(event.data.meetingId);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationType = event.notification.data?.type;
  const action = event.action;

  // Handle different notification types
  let url = '/';

  switch (notificationType) {
    case 'morning-checkin':
      url = action === 'open' ? '/?modal=daily-intention' : '/';
      break;

    case 'evening-reflection':
      url = action === 'quick-journal' ? '/?modal=quick-journal' : '/';
      break;

    case 'milestone':
      url = '/?modal=celebration';
      break;

    case 'streak-reminder':
      url = '/?modal=quick-journal';
      break;

    case 'availability-checkin':
      url = action === 'open-contacts' ? '/contacts?focus=warmline' : '/contacts';
      break;

    case 'jitai-risk-signal':
      url = '/';
      break;

    case 'meeting-reminder':
      url = action === 'directions' 
        ? `/?meeting=${event.notification.data?.meetingId}&action=directions`
        : '/meetings';
      break;

    default:
      url = '/';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if there's already a window open
      for (const client of clients) {
        if ('focus' in client) {
          return client.focus().then(() => {
            // Navigate to the URL
            if (client.url !== url) {
              return client.navigate(url);
            }
          });
        }
      }
      // No window open, open a new one
      return self.clients.openWindow(url);
    })
  );
});

/**
 * Schedule all notifications based on settings
 */
function scheduleAllNotifications(settings: NotificationSettings) {
  // Clear existing timers
  clearAllScheduledNotifications();

  if (!settings.enabled) return;

  // Morning check-in
  if (settings.morningCheckIn.enabled) {
    scheduleDailyNotification(
      'morning-checkin',
      settings.morningCheckIn.time,
      {
        title: 'Good morning! ☀️',
        body: 'Set your intention for today',
        actions: [
          { action: 'open', title: 'Open App' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      },
      settings.quietHours
    );
  }

  // Evening reflection
  if (settings.eveningReflection.enabled) {
    scheduleDailyNotification(
      'evening-reflection',
      settings.eveningReflection.time,
      {
        title: 'How was your day? 🌙',
        body: 'Take a moment to reflect',
        actions: [
          { action: 'quick-journal', title: 'Quick Journal' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      },
      settings.quietHours
    );
  }

  // Warmline availability check-ins (legacy feature - removed from NotificationSettings)
  // This code is kept for backward compatibility but won't execute with current type definitions
  // If this feature is needed, add availabilityCheckIn back to NotificationSettings type
  // Using type assertion to access potentially undefined property
  const availabilityCheckIn = (settings as any).availabilityCheckIn;
  if (availabilityCheckIn && availabilityCheckIn.enabled) {
    scheduleDailyNotification(
      'availability-checkin',
      availabilityCheckIn.time,
      {
        title: 'Warmline availability check',
        body: availabilityCheckIn.message || 'Take a moment to confirm your warmline status for today.',
        actions: [
          { action: 'open-contacts', title: 'Update Status' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      },
      settings.quietHours
    );
  }
}

/**
 * Schedule a daily recurring notification
 */
interface NotificationOptions {
  title: string;
  body: string;
  actions?: Array<{ action: string; title: string }>;
}

function scheduleDailyNotification(
  type: string,
  time: string,
  notification: NotificationOptions,
  quietHours: NotificationSettings['quietHours']
) {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);

  // If the time has passed today, schedule for tomorrow
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const delay = targetTime.getTime() - now.getTime();

  const timerId = self.setTimeout(() => {
    // Check if within quiet hours
    if (!isQuietHours(quietHours)) {
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: type,
        data: { type },
        actions: notification.actions,
        vibrate: [200, 100, 200],
        requireInteraction: false
      });
    }

    // Reschedule for next day
    scheduledTimers.delete(type);
    scheduleDailyNotification(type, time, notification, quietHours);
  }, delay);

  scheduledTimers.set(type, timerId);
}

/**
 * Clear all scheduled notification timers
 */
function clearAllScheduledNotifications() {
  scheduledTimers.forEach((timerId) => {
    self.clearTimeout(timerId);
  });
  scheduledTimers.clear();
}

/**
 * Check if current time is within quiet hours
 */
function isQuietHours(quietHours: NotificationSettings['quietHours']): boolean {
  if (!quietHours.enabled) return false;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const { start, end } = quietHours;

  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  if (start > end) {
    return currentTime >= start || currentTime <= end;
  }

  return currentTime >= start && currentTime <= end;
}

/**
 * Schedule a meeting reminder
 */
function scheduleMeetingReminder(
  meeting: {
    id: string;
    name: string;
    dayOfWeek: number;
    time: string;
    reminderMinutesBefore: number;
  },
  settings: {
    enabled: boolean;
    minutesBefore: number[];
    respectQuietHours: boolean;
  },
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  }
) {
  if (!settings.enabled) {
    return;
  }

  // Cancel existing reminder if any
  cancelMeetingReminder(meeting.id);

  // Store reminder info with quiet hours
  meetingReminders.set(meeting.id, { meeting, settings, quietHours });

  // Calculate next reminder time
  const now = new Date();
  const currentDay = now.getDay();
  const [hours, minutes] = meeting.time.split(':').map(Number);
  const meetingTime = hours * 60 + minutes; // minutes since midnight
  const reminderTime = meetingTime - meeting.reminderMinutesBefore;

  // Calculate days until next occurrence
  let daysUntil = (meeting.dayOfWeek - currentDay + 7) % 7;
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Handle edge case: if reminder time is before meeting time and we're past meeting time today
  // or if reminder time is negative (meeting already started), schedule for next week
  if (daysUntil === 0) {
    if (reminderTime < 0 || reminderTime <= currentTime) {
      daysUntil = 7; // Next week
    }
  }

  const reminderDate = new Date(now);
  reminderDate.setDate(now.getDate() + daysUntil);
  
  // Handle negative reminder time (meeting starts before reminder time)
  if (reminderTime < 0) {
    reminderDate.setDate(reminderDate.getDate() + 7); // Next week
    reminderDate.setHours(Math.floor((meetingTime + 24 * 60 - meeting.reminderMinutesBefore) / 60) % 24, 
                         (meetingTime + 24 * 60 - meeting.reminderMinutesBefore) % 60, 0, 0);
  } else {
    reminderDate.setHours(Math.floor(reminderTime / 60), reminderTime % 60, 0, 0);
  }

  const delay = reminderDate.getTime() - now.getTime();

  // Only schedule if delay is positive and within reasonable bounds (7 days)
  if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
    const timerId = self.setTimeout(() => {
      // Check quiet hours using actual settings
      if (settings.respectQuietHours && isQuietHours(quietHours)) {
        // Reschedule for after quiet hours
        const [endHours, endMinutes] = quietHours.end.split(':').map(Number);
        const afterQuietHours = new Date(reminderDate);
        afterQuietHours.setHours(endHours, endMinutes, 0, 0);
        
        // If quiet hours wrap around midnight, adjust accordingly
        if (quietHours.start > quietHours.end && reminderDate.getHours() < endHours) {
          afterQuietHours.setDate(afterQuietHours.getDate() + 1);
        }
        
        const newDelay = afterQuietHours.getTime() - Date.now();
        if (newDelay > 0) {
          const newTimerId = self.setTimeout(() => {
            showMeetingReminderNotification(meeting);
            scheduledTimers.delete(`meeting-${meeting.id}`);
            // Reschedule for next week
            scheduleMeetingReminder(meeting, settings, quietHours);
          }, newDelay);
          scheduledTimers.set(`meeting-${meeting.id}`, newTimerId);
        }
        return;
      }

      showMeetingReminderNotification(meeting);
      scheduledTimers.delete(`meeting-${meeting.id}`);
      // Reschedule for next week
      scheduleMeetingReminder(meeting, settings, quietHours);
    }, delay);

    scheduledTimers.set(`meeting-${meeting.id}`, timerId);
  }
}

/**
 * Cancel a meeting reminder
 */
function cancelMeetingReminder(meetingId: string) {
  const timerId = scheduledTimers.get(`meeting-${meetingId}`);
  if (timerId) {
    self.clearTimeout(timerId);
    scheduledTimers.delete(`meeting-${meetingId}`);
  }
  meetingReminders.delete(meetingId);
}

/**
 * Show meeting reminder notification
 */
function showMeetingReminderNotification(meeting: {
  id: string;
  name: string;
  dayOfWeek: number;
  time: string;
  reminderMinutesBefore: number;
}) {
  const [hours, minutes] = meeting.time.split(':').map(Number);
  const now = new Date();
  const meetingTime = new Date(now);
  meetingTime.setHours(hours, minutes, 0, 0);
  
  const minutesUntil = Math.max(0, Math.floor((meetingTime.getTime() - now.getTime()) / 60000));

  self.registration.showNotification(`Meeting Reminder: ${meeting.name}`, {
    body: `Your meeting starts ${minutesUntil === 0 ? 'now' : `in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`}`,
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
    vibrate: [200, 100, 200],
  });
}

// Clean up old meeting reminders periodically (once per hour)
// This prevents memory leaks from stale reminders that are no longer active
setInterval(() => {
  const remindersToRemove: string[] = [];
  
  meetingReminders.forEach((value, key) => {
    const timerId = scheduledTimers.get(`meeting-${key}`);
    
    // If no active timer exists and reminder is disabled, it's safe to remove
    if (!timerId && !value.settings.enabled) {
      remindersToRemove.push(key);
    }
  });
  
  // Remove stale reminders
  remindersToRemove.forEach(key => {
    meetingReminders.delete(key);
  });
  
  // Also clean up any orphaned timers
  scheduledTimers.forEach((timerId, key) => {
    if (key.startsWith('meeting-') && !meetingReminders.has(key.replace('meeting-', ''))) {
      clearTimeout(timerId);
      scheduledTimers.delete(key);
    }
  });
}, 60 * 60 * 1000); // Check every hour

// Check for meeting reminders every minute
setInterval(() => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  meetingReminders.forEach(({ meeting, settings, quietHours }) => {
    if (!settings.enabled) return;

    const [hours, minutes] = meeting.time.split(':').map(Number);
    const meetingTime = hours * 60 + minutes;
    const reminderTime = meetingTime - meeting.reminderMinutesBefore;

    // Check if reminder should fire now
    if (
      meeting.dayOfWeek === currentDay &&
      currentTime >= reminderTime - 1 && // 1 minute window
      currentTime <= reminderTime + 1 &&
      !scheduledTimers.has(`meeting-${meeting.id}`)
    ) {
      // Check quiet hours using actual settings
      if (settings.respectQuietHours && isQuietHours(quietHours)) {
        return;
      }

      showMeetingReminderNotification(meeting);
      // Reschedule for next week
      scheduleMeetingReminder(meeting, settings, quietHours);
    }
  });
}, 60000); // Check every minute
