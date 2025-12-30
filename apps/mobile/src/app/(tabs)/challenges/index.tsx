/**
 * Challenges Screen
 *
 * Displays daily recovery challenges
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useTodaysChallenge, useWeeklyChallenges, useCompleteChallenge } from "../../../hooks/useChallenges";
import { ChallengeCard } from "../../../components/ChallengeCard";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { Trophy, Calendar } from "lucide-react-native";

export default function ChallengesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: todaysData, isLoading: loadingToday, refetch: refetchToday } = useTodaysChallenge();
  const { data: weeklyData, isLoading: loadingWeekly, refetch: refetchWeekly } = useWeeklyChallenges();
  const completeMutation = useCompleteChallenge();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchToday(), refetchWeekly()]);
    setRefreshing(false);
  };

  const handleComplete = async (challengeId: string) => {
    if (completeMutation.isPending) {
      return; // Prevent double submission
    }

    try {
      await completeMutation.mutateAsync({
        challengeId,
        notes: undefined, // Can add notes UI later
      });
      Alert.alert("Challenge Completed!", "Great job! Keep up the good work.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to complete challenge"
      );
    }
  };

  if (loadingToday || loadingWeekly) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  const todaysChallenge = todaysData?.challenge;
  const weeklyChallenges = weeklyData || [];
  const completedCount = weeklyChallenges.filter((c: { completed?: boolean }) => c.completed).length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Trophy size={24} color="#FFD700" />
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Calendar size={24} color="#007AFF" />
              <Text style={styles.statValue}>
                {todaysChallenge && todaysData?.completed ? "✓" : "—"}
              </Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
          </View>
        </Card>

        {/* Today's Challenge */}
        {todaysChallenge ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Challenge</Text>
            <ChallengeCard
              challenge={todaysChallenge}
              completed={todaysData?.completed || false}
              onComplete={
                !todaysData?.completed && !completeMutation.isPending
                  ? () => handleComplete(todaysChallenge.id)
                  : undefined
              }
            />
          </View>
        ) : (
          !loadingToday && (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No challenge available for today. Please check back tomorrow!
              </Text>
            </Card>
          )
        )}

        {/* Weekly Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Challenges</Text>
            {weeklyChallenges.length > 0 ? (
              weeklyChallenges.map((item: { challenge: { id: string }; completed?: boolean }, index: number) => (
                <ChallengeCard
                  key={item.challenge.id}
                  challenge={item.challenge}
                  completed={item.completed}
                  showDay={true}
                  onComplete={
                    !item.completed && !completeMutation.isPending
                      ? () => handleComplete(item.challenge.id)
                      : undefined
                  }
                />
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No challenges available for this week.
                </Text>
              </Card>
            )}
        </View>
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
  statsCard: {
    marginBottom: 24,
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5EA",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000",
  },
  emptyCard: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    color: "#FF3B30",
    fontSize: 16,
    paddingHorizontal: 20,
  },
});

