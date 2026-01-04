/**
 * Achievement Badge Component
 *
 * Displays achievement with unlock status
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "./Card";
import { Badge } from "./ui/Badge";
import { Trophy, Lock } from "lucide-react-native";
import type { Achievement } from "../hooks/useAchievements";

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress?: () => void;
}

export function AchievementBadge({ achievement, onPress }: AchievementBadgeProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card
        style={[
          styles.card,
          !achievement.unlocked && styles.cardLocked,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {achievement.unlocked ? (
              <Trophy size={32} color="#FFD700" />
            ) : (
              <Lock size={32} color="#8E8E93" />
            )}
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                !achievement.unlocked && styles.titleLocked,
              ]}
            >
              {achievement.title}
            </Text>
            <Text
              style={[
                styles.description,
                !achievement.unlocked && styles.descriptionLocked,
              ]}
            >
              {achievement.description}
            </Text>
            {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                        backgroundColor: achievement.unlocked ? "#34C759" : "#007AFF",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {achievement.progress} / {achievement.maxProgress}
                </Text>
              </View>
            )}
          </View>
          {achievement.unlocked && (
            <Badge label="Unlocked" variant="success" size="small" />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  cardLocked: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  titleLocked: {
    color: "#8E8E93",
  },
  description: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
    lineHeight: 20,
  },
  descriptionLocked: {
    color: "#C7C7CC",
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#8E8E93",
  },
});

