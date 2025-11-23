/**
 * Smart Notifications Hook
 *
 * React hook for managing smart notifications
 */

import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import {
  NotificationSettings,
  DEFAULT_SETTINGS,
  requestNotificationPermissions,
  scheduleAllNotifications,
  cancelAllNotifications,
  getAllScheduledNotifications,
  setupNotificationHandler,
} from "../lib/smart-notifications";
import * as Notifications from "expo-notifications";

const SETTINGS_KEY = "notification_settings";

/**
 * Hook for managing smart notifications
 */
export function useSmartNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledNotifications, setScheduledNotifications] = useState<
    Notifications.NotificationRequest[]
  >([]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    setupNotificationHandler();
  }, []);

  // Load scheduled notifications when settings change
  useEffect(() => {
    if (settings.enabled && settings.permission === "granted") {
      refreshScheduledNotifications();
    }
  }, [settings.enabled, settings.permission]);

  const loadSettings = async () => {
    try {
      const stored = await SecureStore.getItemAsync(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const refreshScheduledNotifications = useCallback(async () => {
    try {
      const notifications = await getAllScheduledNotifications();
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error("Failed to refresh scheduled notifications:", error);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      await SecureStore.setItemAsync(
        SETTINGS_KEY,
        JSON.stringify(newSettings)
      );
      setSettings(newSettings);

      // Request permissions if enabling
      if (newSettings.enabled && newSettings.permission !== "granted") {
        const granted = await requestNotificationPermissions();
        if (granted) {
          const updated = { ...newSettings, permission: "granted" as const };
          await SecureStore.setItemAsync(
            SETTINGS_KEY,
            JSON.stringify(updated)
          );
          setSettings(updated);
          // Reschedule notifications with updated permissions
          await scheduleAllNotifications(updated);
          await refreshScheduledNotifications();
          return;
        } else {
          const updated = { ...newSettings, permission: "denied" as const };
          await SecureStore.setItemAsync(
            SETTINGS_KEY,
            JSON.stringify(updated)
          );
          setSettings(updated);
          await cancelAllNotifications();
          setScheduledNotifications([]);
          return;
        }
      }

      // Reschedule all notifications
      if (newSettings.enabled && newSettings.permission === "granted") {
        await scheduleAllNotifications(newSettings);
        await refreshScheduledNotifications();
      } else {
        await cancelAllNotifications();
        setScheduledNotifications([]);
      }
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      throw error;
    }
  }, [refreshScheduledNotifications]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await requestNotificationPermissions();
      const updated = {
        ...settings,
        permission: granted ? ("granted" as const) : ("denied" as const),
      };
      await saveSettings(updated);
      return granted;
    } catch (error) {
      console.error("Failed to request permissions:", error);
      return false;
    }
  }, [settings, saveSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<NotificationSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...updates };
        saveSettings(updated);
        return updated;
      });
    },
    [saveSettings]
  );

  return {
    settings,
    isLoading,
    scheduledNotifications,
    updateSettings,
    requestPermissions,
    refreshScheduledNotifications,
  };
}

