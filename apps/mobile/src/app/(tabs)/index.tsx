/**
 * Home Tab - Mobile App
 *
 * Main dashboard screen
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useProfile } from "../../hooks/useProfile";
import { useTodaysEntry, useWeeklyEntries } from "../../hooks/useDailyEntries";
import { useActionPlans } from "../../hooks/useActionPlans";
import { useActiveRoutines } from "../../hooks/useRoutines";
import { useStreaks } from "../../hooks/useStreaks";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { Card } from "../../components/Card";
import { SobrietyCounter } from "../../components/SobrietyCounter";
import { StreakCard } from "../../components/StreakCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { WifiOff, Wifi } from "lucide-react-native";
import { useMilestones } from "../../hooks/useMilestones";
import { MilestoneCelebration } from "../../components/MilestoneCelebration";
import { Milestone } from "../../lib/milestones";

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { profile, isLoading: profileLoading } = useProfile();
  const { entry: todayEntry, isLoading: entryLoading } = useTodaysEntry(
    profile?.timezone || "UTC"
  );
  const { entries: weeklyEntries } = useWeeklyEntries(profile?.timezone || "UTC");
  const { plans } = useActionPlans();
  const { routines } = useActiveRoutines();
  const streaks = useStreaks();
  const { isOnline, isOffline, queuedMutations, sync, canSync } = useOfflineSync();
  const { newlyUnlocked, clearNewlyUnlocked, nextMilestone } = useMilestones();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<Milestone | null>(null);

  // Check for newly unlocked milestones
  useEffect(() => {
    if (newlyUnlocked.length > 0 && !showCelebration) {
      // Show the first newly unlocked milestone
      const milestoneToShow = newlyUnlocked[0];
      setCelebrationMilestone(milestoneToShow);
      setShowCelebration(true);
    }
  }, [newlyUnlocked.length, showCelebration]);

  // Clear newly unlocked milestones when celebration is closed
  useEffect(() => {
    if (!showCelebration && celebrationMilestone) {
      clearNewlyUnlocked();
      setCelebrationMilestone(null);
    }
  }, [showCelebration, celebrationMilestone, clearNewlyUnlocked]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic handled by TanStack Query
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (profileLoading || entryLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const activePlans = plans.filter((p: { active?: boolean }) => p.active !== false);
  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Offline Indicator */}
        {isOffline && (
          <Card style={styles.offlineCard}>
            <View style={styles.offlineRow}>
              <WifiOff size={20} color="#FF9500" />
              <View style={styles.offlineContent}>
                <Text style={styles.offlineTitle}>Offline Mode</Text>
                <Text style={styles.offlineText}>
                  {queuedMutations.length > 0
                    ? `${queuedMutations.length} change${queuedMutations.length !== 1 ? "s" : ""} queued`
                    : "Changes will sync when online"}
                </Text>
              </View>
              {canSync && (
                <Button
                  title="Sync"
                  onPress={sync}
                  size="small"
                  style={styles.syncButton}
                />
              )}
            </View>
          </Card>
        )}

        {/* Sobriety Counter */}
        {profile?.clean_date && (
          <SobrietyCounter cleanDate={new Date(profile.clean_date)} />
        )}

        {/* Top Streak */}
        {streaks.journaling.current > 0 && (
          <StreakCard
            type="journaling"
            current={streaks.journaling.current}
            longest={streaks.journaling.longest}
            label="Journaling Streak"
          />
        )}

        {/* Today's Entry Card */}
        <Card
          variant="interactive"
          onPress={() => router.push(`/(tabs)/journal/${todayFormatted}`)}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Entry</Text>
            {todayEntry && <Badge label="Saved" variant="success" size="small" />}
          </View>
          {todayEntry ? (
            <View>
              {todayEntry.cravings_intensity !== null && (
                <View style={styles.entryRow}>
                  <Text style={styles.entryLabel}>Cravings:</Text>
                  <Text style={styles.entryValue}>
                    {todayEntry.cravings_intensity}/10
                  </Text>
                </View>
              )}
              {todayEntry.gratitude && (
                <Text style={styles.gratitudeText} numberOfLines={2}>
                  {todayEntry.gratitude}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No entry for today</Text>
          )}
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="Quick Journal"
            onPress={() => router.push("/(tabs)/journal/quick-craving")}
            variant="primary"
            style={styles.quickActionButton}
          />
          <Button
            title="Support"
            onPress={() => router.push("/(tabs)/support")}
            variant="danger"
            style={styles.quickActionButton}
          />
        </View>

        {/* Weekly Summary */}
        {weeklyEntries.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>This Week</Text>
            <View style={styles.weeklyStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weeklyEntries.length}</Text>
                <Text style={styles.statLabel}>Entries</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {weeklyEntries.filter((e: { cravings_intensity?: number | null }) => e.cravings_intensity && e.cravings_intensity > 5).length}
                </Text>
                <Text style={styles.statLabel}>High Intensity</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Active Action Plans */}
        {activePlans.length > 0 && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Action Plans</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/action-plans")}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {activePlans.slice(0, 2).map((plan: { id: string; title: string }) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.planItem}
                onPress={() => router.push(`/(tabs)/action-plans/${plan.id}`)}
              >
                <Text style={styles.planItemText}>{plan.title}</Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Active Routines */}
        {routines.length > 0 && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Active Routines</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/routines")}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {routines.slice(0, 2).map((routine: { id: string; title: string }) => (
              <TouchableOpacity
                key={routine.id}
                style={styles.routineItem}
                onPress={() => router.push(`/(tabs)/routines/${routine.id}`)}
              >
                <Text style={styles.routineItemText}>{routine.title}</Text>
                <Text style={styles.routineSchedule}>
                  {(routine.schedule as any)?.time || "No schedule"}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* View All Streaks */}
        <Card
          variant="interactive"
          onPress={() => router.push("/(tabs)/streaks")}
          style={styles.viewAllCard}
        >
          <View style={styles.viewAllContent}>
            <Text style={styles.viewAllTitle}>View All Streaks & Achievements</Text>
            <Text style={styles.viewAllSubtext}>
              Track your progress and unlock achievements
            </Text>
          </View>
        </Card>
      </View>

      {/* Milestone Celebration */}
      <MilestoneCelebration
        visible={showCelebration}
        milestone={celebrationMilestone}
        onClose={() => {
          setShowCelebration(false);
          setCelebrationMilestone(null);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  viewAllText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  entryLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  entryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  gratitudeText: {
    fontSize: 14,
    color: "#000",
    marginTop: 8,
  },
  emptyText: {
    color: "#8E8E93",
    fontStyle: "italic",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
  },
  weeklyStats: {
    flexDirection: "row",
    gap: 24,
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
  planItem: {
    padding: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    marginBottom: 8,
  },
  planItemText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  routineItem: {
    padding: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    marginBottom: 8,
  },
  routineItemText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    marginBottom: 4,
  },
  routineSchedule: {
    fontSize: 12,
    color: "#8E8E93",
  },
  offlineCard: {
    marginBottom: 16,
    backgroundColor: "#FFF3CD",
    borderColor: "#FFC107",
  },
  offlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  offlineContent: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#856404",
  },
  offlineText: {
    fontSize: 14,
    color: "#856404",
  },
  syncButton: {
    marginLeft: "auto",
  },
  viewAllCard: {
    marginBottom: 16,
  },
  viewAllContent: {
    alignItems: "center",
  },
  viewAllTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  viewAllSubtext: {
    fontSize: 14,
    color: "#8E8E93",
  },
});

