/**
 * Sobriety Counter Component for React Native
 * Premium counter with animations and real-time updates
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useColorScheme,
  Platform,
} from "react-native";

interface SobrietyCounterProps {
  cleanDate: Date;
  timezone?: string;
}

export function SobrietyCounter({
  cleanDate,
  timezone = "UTC",
}: SobrietyCounterProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [timeData, setTimeData] = useState(() => calculateTime(cleanDate));

  // Animation values for each time unit
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef({
    days: new Animated.Value(1),
    hours: new Animated.Value(1),
    minutes: new Animated.Value(1),
  }).current;

  // Update counter every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeData = calculateTime(cleanDate);
      setTimeData((prevData) => {
        // Animate when values change
        if (prevData.minutes !== newTimeData.minutes) {
          animateValue("minutes");
        }
        if (prevData.hours !== newTimeData.hours) {
          animateValue("hours");
        }
        if (prevData.days !== newTimeData.days) {
          animateValue("days");
        }
        return newTimeData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cleanDate]);

  // Fade in animation on mount
  useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const animateValue = (unit: "days" | "hours" | "minutes") => {
    Animated.sequence([
      Animated.spring(scaleAnims[unit], {
        toValue: 1.15,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[unit], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        isDark ? styles.containerDark : styles.container,
        { opacity: fadeAnim },
      ]}
    >
      <Text style={isDark ? styles.labelDark : styles.label}>
        🌟 Clean Time
      </Text>

      <View style={styles.timeContainer}>
        <TimeUnit
          value={timeData.days}
          label="Days"
          scaleAnim={scaleAnims.days}
          isDark={isDark}
          isPrimary={true}
        />
        <View style={isDark ? styles.separatorDark : styles.separator} />
        <TimeUnit
          value={timeData.hours}
          label="Hours"
          scaleAnim={scaleAnims.hours}
          isDark={isDark}
        />
        <View style={isDark ? styles.separatorDark : styles.separator} />
        <TimeUnit
          value={timeData.minutes}
          label="Minutes"
          scaleAnim={scaleAnims.minutes}
          isDark={isDark}
        />
      </View>

      {/* Progress indicator for days milestones */}
      {timeData.days > 0 && (
        <View style={styles.milestoneContainer}>
          <Text style={isDark ? styles.milestoneTextDark : styles.milestoneText}>
            {getMilestoneText(timeData.days)}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

function TimeUnit({
  value,
  label,
  scaleAnim,
  isDark,
  isPrimary = false,
}: {
  value: number;
  label: string;
  scaleAnim: Animated.Value;
  isDark: boolean;
  isPrimary?: boolean;
}) {
  return (
    <Animated.View
      style={[styles.timeUnit, { transform: [{ scale: scaleAnim }] }]}
    >
      <Text
        style={[
          isPrimary
            ? isDark
              ? styles.timeValuePrimaryDark
              : styles.timeValuePrimary
            : isDark
            ? styles.timeValueDark
            : styles.timeValue,
        ]}
      >
        {String(value).padStart(2, "0")}
      </Text>
      <Text style={isDark ? styles.timeLabelDark : styles.timeLabel}>
        {label}
      </Text>
    </Animated.View>
  );
}

function calculateTime(cleanDate: Date) {
  const now = new Date();
  const diff = now.getTime() - cleanDate.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

function getMilestoneText(days: number): string {
  if (days >= 365) return "🎉 Over a year strong!";
  if (days >= 180) return "💪 Half a year milestone!";
  if (days >= 90) return "🌟 90 days of strength!";
  if (days >= 30) return "✨ One month achieved!";
  if (days >= 7) return "🔥 One week strong!";
  if (days >= 1) return "⭐ Keep going!";
  return "";
}

const styles = StyleSheet.create({
  // Light mode styles
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeUnit: {
    alignItems: "center",
    minWidth: 70,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#007AFF",
    ...Platform.select({
      ios: {
        fontVariant: ["tabular-nums"],
      },
    }),
  },
  timeValuePrimary: {
    fontSize: 48,
    fontWeight: "800",
    color: "#007AFF",
    ...Platform.select({
      ios: {
        fontVariant: ["tabular-nums"],
      },
    }),
  },
  timeLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 6,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginHorizontal: 4,
  },
  milestoneContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  milestoneText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    textAlign: "center",
  },

  // Dark mode styles
  containerDark: {
    backgroundColor: "rgba(28, 28, 30, 1)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "#0A84FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  labelDark: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  timeValueDark: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0A84FF",
    ...Platform.select({
      ios: {
        fontVariant: ["tabular-nums"],
      },
    }),
  },
  timeValuePrimaryDark: {
    fontSize: 48,
    fontWeight: "800",
    color: "#0A84FF",
    ...Platform.select({
      ios: {
        fontVariant: ["tabular-nums"],
      },
    }),
  },
  timeLabelDark: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 6,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  separatorDark: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 4,
  },
  milestoneTextDark: {
    fontSize: 14,
    color: "#0A84FF",
    fontWeight: "600",
    textAlign: "center",
  },
});

