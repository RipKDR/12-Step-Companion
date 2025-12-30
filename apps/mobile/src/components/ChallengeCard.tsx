/**
 * Challenge Card Component
 *
 * Displays a daily recovery challenge
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "./Card";
import { Badge } from "./ui/Badge";
import { CheckCircle, Circle } from "lucide-react-native";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
  day_of_week: number;
  program?: "NA" | "AA";
  min_clean_days?: number;
  max_clean_days?: number | null;
}

interface ChallengeCardProps {
  challenge: Challenge;
  completed?: boolean;
  onPress?: () => void;
  onComplete?: () => void;
  showDay?: boolean;
}

const categoryColors: Record<string, string> = {
  gratitude: "#FFD700",
  reflection: "#007AFF",
  action: "#34C759",
  connection: "#FF9500",
  "self-care": "#AF52DE",
  sponsor: "#FF3B30",
  meeting: "#5AC8FA",
};

const difficultyLabels: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ChallengeCard({
  challenge,
  completed = false,
  onPress,
  onComplete,
  showDay = false,
}: ChallengeCardProps) {
  const categoryColor = categoryColors[challenge.category] || "#007AFF";

  return (
    <Card
      style={[styles.card, completed && styles.completedCard]}
      variant={onPress ? "interactive" : "default"}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {showDay && (
            <Badge
              label={dayNames[challenge.day_of_week]}
              variant="outline"
              size="small"
              style={styles.dayBadge}
            />
          )}
          <Badge
            label={challenge.category}
            variant="info"
            size="small"
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryColor + "20", borderColor: categoryColor },
            ]}
          />
          {challenge.difficulty && (
            <Badge
              label={difficultyLabels[challenge.difficulty]}
              variant="outline"
              size="small"
            />
          )}
        </View>
        {completed ? (
          <CheckCircle size={24} color="#34C759" />
        ) : (
          <Circle size={24} color="#8E8E93" />
        )}
      </View>

      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.description}>{challenge.description}</Text>

      <View style={styles.footer}>
        {challenge.points !== undefined && (
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>{challenge.points} pts</Text>
          </View>
        )}
        {!completed && onComplete && (
          <TouchableOpacity
            style={[styles.completeButton, { borderColor: categoryColor }]}
            onPress={onComplete}
            disabled={false}
            accessibilityLabel="Complete challenge"
            accessibilityRole="button"
          >
            <Text style={[styles.completeButtonText, { color: categoryColor }]}>
              Complete
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: "#F0F0F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  dayBadge: {
    marginRight: 4,
  },
  categoryBadge: {
    marginRight: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  pointsContainer: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },
  completeButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

