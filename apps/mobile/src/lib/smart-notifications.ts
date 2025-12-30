/**
 * Smart Notification System
 *
 * Context-aware notification scheduling with categories, quiet hours, and deep linking
 */

import * as Notifications from "expo-notifications";
import { Platform, Linking } from "react-native";

export type NotificationCategory =
  | "crisis"
  | "routine"
  | "milestone"
  | "reminder"
  | "challenge"
  | "check-in"
  | "risk-alert";

export interface NotificationSettings {
  enabled: boolean;
  permission: "granted" | "denied" | "default";

  // Category toggles
  categories: {
    crisis: boolean;
    routine: boolean;
    milestone: boolean;
    reminder: boolean;
    challenge: boolean;
    checkIn: boolean;
    riskAlert: boolean;
  };

  // Scheduled notifications
  morningCheckIn: {
    enabled: boolean;
    time: string; // HH:MM format
  };

  eveningReflection: {
    enabled: boolean;
    time: string; // HH:MM format
  };

  dailyChallenge: {
    enabled: boolean;
    time: string; // HH:MM format
  };

  // Quiet hours
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };

  // Advanced settings
  streakReminders: boolean;
  milestoneAlerts: boolean;
  riskAlerts: boolean;
}

export interface ScheduledNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger: Notifications.NotificationTriggerInput;
  sound?: boolean;
  priority?: "min" | "low" | "default" | "high" | "max";
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  permission: "default",
  categories: {
    crisis: true,
    routine: true,
    milestone: true,
    reminder: true,
    challenge: true,
    checkIn: true,
    riskAlert: true,
  },
  morningCheckIn: {
    enabled: true,
    time: "08:00",
  },
  eveningReflection: {
    enabled: true,
    time: "20:00",
  },
  dailyChallenge: {
    enabled: true,
    time: "09:00",
  },
  quietHours: {
    enabled: true,
    start: "22:00",
    end: "07:00",
  },
  streakReminders: true,
  milestoneAlerts: true,
  riskAlerts: true,
};

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: false,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  // Configure Android channels
  if (Platform.OS === "android") {
    // Crisis channel (highest priority)
    await Notifications.setNotificationChannelAsync("crisis", {
      name: "Crisis Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF3B30",
      sound: "default",
      enableVibrate: true,
    });

    // Routine channel
    await Notifications.setNotificationChannelAsync("routine", {
      name: "Routine Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250],
      lightColor: "#007AFF",
      sound: "default",
    });

    // Milestone channel
    await Notifications.setNotificationChannelAsync("milestone", {
      name: "Milestones",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 100, 250],
      lightColor: "#FFD700",
      sound: "default",
    });

    // Default channel
    await Notifications.setNotificationChannelAsync("default", {
      name: "General",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: "#007AFF",
    });
  }

  return true;
}

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(
  quietHours: NotificationSettings["quietHours"]
): boolean {
  if (!quietHours.enabled) return false;

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = quietHours.start.split(":").map(Number);
    const [endHour, endMinute] = quietHours.end.split(":").map(Number);

    // Validate parsed times
    if (
      isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute) ||
      startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59 ||
      endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59
    ) {
      console.error("Invalid quiet hours time:", quietHours);
      return false;
    }

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    // Handle quiet hours that span midnight
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }

    return currentTime >= startTime && currentTime < endTime;
  } catch (error) {
    console.error("Error checking quiet hours:", error);
    return false;
  }
}

/**
 * Check if notification category is enabled
 */
export function isCategoryEnabled(
  category: NotificationCategory,
  settings: NotificationSettings
): boolean {
  if (!settings.enabled) return false;
  if (settings.permission !== "granted") return false;

  // Map category names to settings keys
  const categoryMap: Record<NotificationCategory, keyof NotificationSettings["categories"]> = {
    crisis: "crisis",
    routine: "routine",
    milestone: "milestone",
    reminder: "reminder",
    challenge: "challenge",
    "check-in": "checkIn",
    "risk-alert": "riskAlert",
  };

  const settingsKey = categoryMap[category];
  return settings.categories[settingsKey] ?? true;
}

/**
 * Schedule a smart notification with context awareness
 */
export async function scheduleSmartNotification(
  notification: Omit<ScheduledNotification, "id">,
  settings: NotificationSettings
): Promise<string | null> {
  // Check if notifications are enabled
  if (!settings.enabled || settings.permission !== "granted") {
    return null;
  }

  // Check if category is enabled
  if (!isCategoryEnabled(notification.category, settings)) {
    return null;
  }

  // Check quiet hours (except for crisis notifications)
  if (notification.category !== "crisis" && isQuietHours(settings.quietHours)) {
    // Schedule for after quiet hours end
    try {
      const [endHour, endMinute] = settings.quietHours.end.split(":").map(Number);
      if (isNaN(endHour) || isNaN(endMinute) || endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
        console.error("Invalid quiet hours end time:", settings.quietHours.end);
        // Fall back to scheduling immediately if time is invalid
      } else {
        const now = new Date();
        const quietEnd = new Date();
        quietEnd.setHours(endHour, endMinute, 0, 0);

        // If quiet end is tomorrow, add a day
        if (quietEnd < now) {
          quietEnd.setDate(quietEnd.getDate() + 1);
        }

        notification.trigger = {
          date: quietEnd,
        };
      }
    } catch (error) {
      console.error("Error parsing quiet hours end time:", error);
      // Fall back to scheduling immediately
    }
  }

  // Determine priority based on category
  const priority = notification.priority ||
    (notification.category === "crisis" ? "max" :
     notification.category === "risk-alert" ? "high" :
     notification.category === "milestone" ? "high" :
     "default");

  // Schedule notification
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        sound: notification.sound !== false,
        data: notification.data || {},
        categoryIdentifier: notification.category,
        priority: priority === "max" ? "max" :
                   priority === "high" ? "high" :
                   "default",
      },
      trigger: notification.trigger,
    });

    return identifier;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return null;
  }
}

/**
 * Schedule recurring daily notification
 */
export async function scheduleDailyNotification(
  time: string, // HH:MM format
  title: string,
  body: string,
  category: NotificationCategory,
  settings: NotificationSettings,
  data?: Record<string, any>
): Promise<string | null> {
  if (!isCategoryEnabled(category, settings)) {
    return null;
  }

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    console.error("Invalid time format:", time);
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.error("Invalid time values:", { hours, minutes });
    return null;
  }

  return scheduleSmartNotification(
    {
      category,
      title,
      body,
      data,
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    },
    settings
  );
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Cancel notifications by category
 */
export async function cancelNotificationsByCategory(
  category: NotificationCategory
): Promise<void> {
  const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = allNotifications.filter(
    (n) => n.content.categoryIdentifier === category
  );

  for (const notification of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Setup notification handler with deep linking
 */
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const category = notification.request.content
        .categoryIdentifier as NotificationCategory;

      // Crisis notifications always show
      if (category === "crisis") {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
      }

      // Check quiet hours for other notifications
      // Note: This is a client-side check, actual scheduling respects quiet hours
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });

  // Handle notification taps (deep linking)
  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    const category = response.notification.request.content
      .categoryIdentifier as NotificationCategory;

    // Handle deep linking based on category and data
    // Note: Deep linking to app routes requires expo-linking or router navigation
    // For now, we'll log the notification tap - actual navigation should be handled
    // by the app's notification response handler
    if (data?.route) {
      console.log("Notification tapped with route:", data.route);
      // In production, use expo-linking or router.push() here
    } else {
      const defaultRoutes: Record<NotificationCategory, string> = {
        crisis: "/(tabs)/support",
        routine: "/(tabs)/routines",
        milestone: "/(tabs)/streaks",
        reminder: "/(tabs)/journal",
        challenge: "/(tabs)/challenges",
        "check-in": "/(tabs)/check-ins",
        "risk-alert": "/(tabs)/support",
      };
      const route = defaultRoutes[category] || "/(tabs)";
      console.log("Notification tapped, default route:", route);
      // In production, use expo-linking or router.push() here
    }
  });
}

/**
 * Schedule all notifications based on settings
 */
export async function scheduleAllNotifications(
  settings: NotificationSettings
): Promise<string[]> {
  const identifiers: string[] = [];

  try {
    // Cancel existing notifications first
    await cancelAllNotifications();

    if (!settings.enabled || settings.permission !== "granted") {
      return identifiers;
    }

    // Morning check-in
    if (settings.morningCheckIn.enabled) {
      try {
        const id = await scheduleDailyNotification(
          settings.morningCheckIn.time,
          "Good morning! ☀️",
          "Set your intention for today",
          "reminder",
          settings,
          { route: "/(tabs)/journal" }
        );
        if (id) identifiers.push(id);
      } catch (error) {
        console.error("Failed to schedule morning check-in:", error);
      }
    }

    // Evening reflection
    if (settings.eveningReflection.enabled) {
      try {
        const id = await scheduleDailyNotification(
          settings.eveningReflection.time,
          "How was your day? 🌙",
          "Take a moment to reflect",
          "reminder",
          settings,
          { route: "/(tabs)/journal" }
        );
        if (id) identifiers.push(id);
      } catch (error) {
        console.error("Failed to schedule evening reflection:", error);
      }
    }

    // Daily challenge
    if (settings.dailyChallenge.enabled) {
      try {
        const id = await scheduleDailyNotification(
          settings.dailyChallenge.time,
          "Today's Challenge",
          "Check out your daily recovery challenge",
          "challenge",
          settings,
          { route: "/(tabs)/challenges" }
        );
        if (id) identifiers.push(id);
      } catch (error) {
        console.error("Failed to schedule daily challenge:", error);
      }
    }
  } catch (error) {
    console.error("Failed to schedule notifications:", error);
  }

  return identifiers;
}

export { DEFAULT_SETTINGS };

