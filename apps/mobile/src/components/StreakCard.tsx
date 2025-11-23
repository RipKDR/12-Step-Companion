/**
 * Streak Card Component
 *
 * Displays streak information with visual indicators
 */

import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { Card } from "./Card";
import { Badge } from "./ui/Badge";
import { Flame } from "lucide-react-native";

interface StreakCardProps {
  type: "journaling" | "stepWork" | "routines" | "meetings";
  current: number;
  longest: number;
  label: string;
}

export function StreakCard({ type, current, longest, label }: StreakCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const getStreakColor = () => {
    if (current >= 30) return "#34C759";
    if (current >= 7) return "#FF9500";
    return "#007AFF";
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Flame size={24} color={getStreakColor()} />
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Text style={[styles.streakValue, { color: getStreakColor() }]}>
                {current}
              </Text>
              <Text style={styles.streakLabel}>Current</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{longest}</Text>
              <Text style={styles.streakLabel}>Longest</Text>
            </View>
          </View>
        </View>
        {current > 0 && (
          <Badge
            label={`${current} day${current !== 1 ? "s" : ""}`}
            variant={current >= 30 ? "success" : current >= 7 ? "warning" : "info"}
            size="small"
          />
        )}
      </View>
      {current === 0 && (
        <Text style={styles.hint}>Start your streak today!</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  streakItem: {
    alignItems: "flex-start",
  },
  streakValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 12,
    color: "#8E8E93",
  },
  streakDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E5EA",
  },
  hint: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 8,
    fontStyle: "italic",
  },
});

