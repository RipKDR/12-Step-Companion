/**
 * Home Tab - Mobile App
 * 
 * Main dashboard screen
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useProfile } from "../../hooks/useProfile";
import { useTodaysEntry } from "../../hooks/useDailyEntries";
import { Card } from "../../components/Card";
import { SobrietyCounter } from "../../components/SobrietyCounter";

export default function HomeScreen() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { entry: todayEntry, isLoading: entryLoading } = useTodaysEntry(
    profile?.timezone || "UTC"
  );

  if (profileLoading || entryLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Sobriety Counter */}
        {profile?.clean_date && (
          <SobrietyCounter cleanDate={new Date(profile.clean_date)} />
        )}

        {/* Today's Entry Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Today's Entry</Text>
          {todayEntry ? (
            <View>
              {todayEntry.cravings_intensity !== null && (
                <Text>Cravings: {todayEntry.cravings_intensity}/10</Text>
              )}
              {todayEntry.gratitude && <Text>Gratitude: {todayEntry.gratitude}</Text>}
            </View>
          ) : (
            <Text style={styles.emptyText}>No entry for today</Text>
          )}
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Quick Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Emergency</Text>
          </TouchableOpacity>
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
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    color: "#8E8E93",
    fontStyle: "italic",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

