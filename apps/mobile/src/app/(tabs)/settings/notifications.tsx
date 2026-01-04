/**
 * Notification Settings Screen
 *
 * Comprehensive notification settings with categories, quiet hours, and scheduling
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parse } from "date-fns";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useSmartNotifications } from "../../../hooks/useSmartNotifications";
import { Bell, BellOff, Clock, Shield } from "lucide-react-native";

export default function NotificationSettingsScreen() {
  const {
    settings,
    isLoading,
    scheduledNotifications,
    updateSettings,
    requestPermissions,
    refreshScheduledNotifications,
  } = useSmartNotifications();

  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);
  const [showChallengePicker, setShowChallengePicker] = useState(false);
  const [showQuietStartPicker, setShowQuietStartPicker] = useState(false);
  const [showQuietEndPicker, setShowQuietEndPicker] = useState(false);

  useEffect(() => {
    if (settings.enabled && settings.permission === "granted") {
      refreshScheduledNotifications();
    }
  }, [settings.enabled, settings.permission, refreshScheduledNotifications]);

  const handleToggleEnabled = async (enabled: boolean) => {
    if (enabled && settings.permission !== "granted") {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to use this feature."
        );
        return;
      }
    }
    await updateSettings({ enabled });
  };

  const handleCategoryToggle = async (
    category: keyof typeof settings.categories,
    enabled: boolean
  ) => {
    await updateSettings({
      categories: {
        ...settings.categories,
        [category]: enabled,
      },
    });
  };

  const handleTimeChange = async (
    field: "morningCheckIn" | "eveningReflection" | "dailyChallenge",
    time: string
  ) => {
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      Alert.alert("Invalid Time", "Please enter time in HH:MM format (e.g., 09:00)");
      return;
    }

    try {
      await updateSettings({
        [field]: {
          ...settings[field],
          time,
        },
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update time"
      );
    }
  };

  const handleQuietHoursToggle = async (enabled: boolean) => {
    await updateSettings({
      quietHours: {
        ...settings.quietHours,
        enabled,
      },
    });
  };

  const handleQuietHoursTimeChange = async (
    field: "start" | "end",
    time: string
  ) => {
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      Alert.alert("Invalid Time", "Please enter time in HH:MM format (e.g., 22:00)");
      return;
    }

    try {
      await updateSettings({
        quietHours: {
          ...settings.quietHours,
          [field]: time,
        },
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update quiet hours"
      );
    }
  };

  const parseTime = (timeStr: string): Date => {
    try {
      const [hours, minutes] = timeStr.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error("Invalid time format");
      }
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    } catch (error) {
      console.error("Error parsing time:", error);
      return new Date(); // Return current time as fallback
    }
  };

  const formatTime = (date: Date): string => {
    return format(date, "HH:mm");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Main Toggle */}
        <Card style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <View style={styles.iconRow}>
                {settings.enabled ? (
                  <Bell size={20} color="#007AFF" />
                ) : (
                  <BellOff size={20} color="#8E8E93" />
                )}
                <Text style={styles.switchLabel}>Enable Notifications</Text>
              </View>
              <Text style={styles.switchHint}>
                {settings.permission === "granted"
                  ? "Notifications are enabled"
                  : settings.permission === "denied"
                  ? "Permission denied - enable in device settings"
                  : "Allow the app to send you notifications"}
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>
          {settings.permission === "denied" && (
            <View style={styles.permissionWarning}>
              <Shield size={16} color="#FF3B30" />
              <Text style={styles.permissionWarningText}>
                Enable notifications in device settings to use this feature
              </Text>
            </View>
          )}
        </Card>

        {settings.enabled && settings.permission === "granted" && (
          <>
            {/* Notification Categories */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Categories</Text>
              <Text style={styles.sectionHint}>
                Choose which types of notifications you want to receive
              </Text>

              <View style={styles.categoryList}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>Crisis Alerts</Text>
                    <Text style={styles.categoryHint}>
                      Always shown, highest priority
                    </Text>
                  </View>
                  <Switch
                    value={settings.categories.crisis}
                    onValueChange={(val) => handleCategoryToggle("crisis", val)}
                    trackColor={{ false: "#E5E5EA", true: "#FF3B30" }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.categoryRow}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>Routine Reminders</Text>
                    <Text style={styles.categoryHint}>
                      Notifications for scheduled routines
                    </Text>
                  </View>
                  <Switch
                    value={settings.categories.routine}
                    onValueChange={(val) =>
                      handleCategoryToggle("routine", val)
                    }
                    trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.categoryRow}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>Milestones</Text>
                    <Text style={styles.categoryHint}>
                      Celebrate your achievements
                    </Text>
                  </View>
                  <Switch
                    value={settings.categories.milestone}
                    onValueChange={(val) =>
                      handleCategoryToggle("milestone", val)
                    }
                    trackColor={{ false: "#E5E5EA", true: "#FFD700" }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.categoryRow}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>Daily Reminders</Text>
                    <Text style={styles.categoryHint}>
                      Morning check-ins and evening reflections
                    </Text>
                  </View>
                  <Switch
                    value={settings.categories.reminder}
                    onValueChange={(val) =>
                      handleCategoryToggle("reminder", val)
                    }
                    trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.categoryRow}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>Daily Challenges</Text>
                    <Text style={styles.categoryHint}>
                      Reminders for daily recovery challenges
                    </Text>
                  </View>
                  <Switch
                    value={settings.categories.challenge}
                    onValueChange={(val) =>
                      handleCategoryToggle("challenge", val)
                    }
                    trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.categoryRow}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>Check-ins</Text>
                    <Text style={styles.categoryHint}>
                      Accountability check-in reminders
                    </Text>
                  </View>
                  <Switch
                    value={settings.categories.checkIn}
                    onValueChange={(val) =>
                      handleCategoryToggle("checkIn", val)
                    }
                    trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.categoryRow}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>Risk Alerts</Text>
                    <Text style={styles.categoryHint}>
                      Proactive risk score notifications
                    </Text>
                  </View>
                  <Switch
                    value={settings.categories.riskAlert}
                    onValueChange={(val) =>
                      handleCategoryToggle("riskAlert", val)
                    }
                    trackColor={{ false: "#E5E5EA", true: "#FF9500" }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            </Card>

            {/* Scheduled Notifications */}
            <Card style={styles.section}>
              <View style={styles.iconRow}>
                <Clock size={20} color="#007AFF" />
                <Text style={styles.sectionTitle}>Scheduled Notifications</Text>
              </View>

              {/* Morning Check-in */}
              <View style={styles.scheduledRow}>
                <View style={styles.scheduledContent}>
                  <Text style={styles.scheduledLabel}>Morning Check-in</Text>
                  <Text style={styles.scheduledHint}>
                    Set your intention for the day
                  </Text>
                </View>
                <Switch
                  value={settings.morningCheckIn.enabled}
                  onValueChange={(enabled) =>
                    updateSettings({
                      morningCheckIn: {
                        ...settings.morningCheckIn,
                        enabled,
                      },
                    })
                  }
                  trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                  thumbColor="#fff"
                />
              </View>
              {settings.morningCheckIn.enabled && (
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowMorningPicker(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {settings.morningCheckIn.time}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Evening Reflection */}
              <View style={styles.scheduledRow}>
                <View style={styles.scheduledContent}>
                  <Text style={styles.scheduledLabel}>Evening Reflection</Text>
                  <Text style={styles.scheduledHint}>
                    Reflect on your day
                  </Text>
                </View>
                <Switch
                  value={settings.eveningReflection.enabled}
                  onValueChange={(enabled) =>
                    updateSettings({
                      eveningReflection: {
                        ...settings.eveningReflection,
                        enabled,
                      },
                    })
                  }
                  trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                  thumbColor="#fff"
                />
              </View>
              {settings.eveningReflection.enabled && (
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowEveningPicker(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {settings.eveningReflection.time}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Daily Challenge */}
              <View style={styles.scheduledRow}>
                <View style={styles.scheduledContent}>
                  <Text style={styles.scheduledLabel}>Daily Challenge</Text>
                  <Text style={styles.scheduledHint}>
                    Reminder for today's challenge
                  </Text>
                </View>
                <Switch
                  value={settings.dailyChallenge.enabled}
                  onValueChange={(enabled) =>
                    updateSettings({
                      dailyChallenge: {
                        ...settings.dailyChallenge,
                        enabled,
                      },
                    })
                  }
                  trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                  thumbColor="#fff"
                />
              </View>
              {settings.dailyChallenge.enabled && (
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowChallengePicker(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {settings.dailyChallenge.time}
                  </Text>
                </TouchableOpacity>
              )}
            </Card>

            {/* Quiet Hours */}
            <Card style={styles.section}>
              <View style={styles.switchRow}>
                <View style={styles.switchContent}>
                  <Text style={styles.switchLabel}>Quiet Hours</Text>
                  <Text style={styles.switchHint}>
                    Don't send notifications during these hours (except crisis alerts)
                  </Text>
                </View>
                <Switch
                  value={settings.quietHours.enabled}
                  onValueChange={handleQuietHoursToggle}
                  trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                  thumbColor="#fff"
                />
              </View>
              {settings.quietHours.enabled && (
                <View style={styles.quietHours}>
                  <View style={styles.quietHoursItem}>
                    <Text style={styles.timeLabel}>Start</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setShowQuietStartPicker(true)}
                    >
                      <Text style={styles.timeButtonText}>
                        {settings.quietHours.start}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.quietHoursItem}>
                    <Text style={styles.timeLabel}>End</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setShowQuietEndPicker(true)}
                    >
                      <Text style={styles.timeButtonText}>
                        {settings.quietHours.end}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Card>

            {/* Advanced Settings */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Advanced Settings</Text>
              <View style={styles.categoryList}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>Streak Reminders</Text>
                    <Text style={styles.categoryHint}>
                      Remind you to maintain your streaks
                    </Text>
                  </View>
                  <Switch
                    value={settings.streakReminders}
                    onValueChange={(val) =>
                      updateSettings({ streakReminders: val })
                    }
                    trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.categoryRow}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>Milestone Alerts</Text>
                    <Text style={styles.categoryHint}>
                      Celebrate when you reach milestones
                    </Text>
                  </View>
                  <Switch
                    value={settings.milestoneAlerts}
                    onValueChange={(val) =>
                      updateSettings({ milestoneAlerts: val })
                    }
                    trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.categoryRow}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>Risk Alerts</Text>
                    <Text style={styles.categoryHint}>
                      Get notified when risk score increases
                    </Text>
                  </View>
                  <Switch
                    value={settings.riskAlerts}
                    onValueChange={(val) =>
                      updateSettings({ riskAlerts: val })
                    }
                    trackColor={{ false: "#E5E5EA", true: "#FF9500" }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            </Card>

            {/* Scheduled Notifications Count */}
            {scheduledNotifications.length > 0 && (
              <Card style={styles.section}>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Scheduled Notifications</Text>
                  <Badge
                    label={scheduledNotifications.length.toString()}
                    variant="info"
                  />
                </View>
                <Text style={styles.statsHint}>
                  Active notifications will be delivered according to your settings
                </Text>
              </Card>
            )}
          </>
        )}

        {/* Date Pickers */}
        {showMorningPicker && (
          <DateTimePicker
            value={parseTime(settings.morningCheckIn.time)}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, date) => {
              setShowMorningPicker(false);
              if (date) {
                handleTimeChange("morningCheckIn", formatTime(date));
              }
            }}
          />
        )}

        {showEveningPicker && (
          <DateTimePicker
            value={parseTime(settings.eveningReflection.time)}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, date) => {
              setShowEveningPicker(false);
              if (date) {
                handleTimeChange("eveningReflection", formatTime(date));
              }
            }}
          />
        )}

        {showChallengePicker && (
          <DateTimePicker
            value={parseTime(settings.dailyChallenge.time)}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, date) => {
              setShowChallengePicker(false);
              if (date) {
                handleTimeChange("dailyChallenge", formatTime(date));
              }
            }}
          />
        )}

        {showQuietStartPicker && (
          <DateTimePicker
            value={parseTime(settings.quietHours.start)}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, date) => {
              setShowQuietStartPicker(false);
              if (date) {
                handleQuietHoursTimeChange("start", formatTime(date));
              }
            }}
          />
        )}

        {showQuietEndPicker && (
          <DateTimePicker
            value={parseTime(settings.quietHours.end)}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, date) => {
              setShowQuietEndPicker(false);
              if (date) {
                handleQuietHoursTimeChange("end", formatTime(date));
              }
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  switchHint: {
    fontSize: 14,
    color: "#8E8E93",
  },
  permissionWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF3F3",
    borderRadius: 8,
  },
  permissionWarningText: {
    fontSize: 13,
    color: "#FF3B30",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  sectionHint: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
  },
  categoryList: {
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryContent: {
    flex: 1,
    marginRight: 16,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
    color: "#000",
  },
  categoryHint: {
    fontSize: 13,
    color: "#8E8E93",
  },
  scheduledRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  scheduledContent: {
    flex: 1,
    marginRight: 16,
  },
  scheduledLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
    color: "#000",
  },
  scheduledHint: {
    fontSize: 13,
    color: "#8E8E93",
  },
  timeButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
  },
  quietHours: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  quietHoursItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  statsHint: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
  },
});
