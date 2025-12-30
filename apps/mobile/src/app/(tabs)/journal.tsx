/**
 * Journal Tab - Mobile App
 *
 * Daily recovery log screen using tRPC
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTodaysEntry, useWeeklyEntries } from "../../hooks/useDailyEntries";
import { useProfile } from "../../hooks/useProfile";
import { format } from "date-fns";
import { Card } from "../../components/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export default function JournalScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { entry: todayEntry, isLoading } = useTodaysEntry(profile?.timezone || "UTC");
  const { entries: weeklyEntries } = useWeeklyEntries(profile?.timezone || "UTC");

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="Quick Craving Log"
            onPress={() => router.push("/(tabs)/journal/quick-craving")}
            variant="primary"
            style={styles.quickActionButton}
          />
          <Button
            title="Full Entry"
            onPress={() => router.push(`/(tabs)/journal/${todayFormatted}`)}
            variant="outline"
            style={styles.quickActionButton}
          />
        </View>

        {/* Today's Entry */}
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
              {todayEntry.notes && (
                <Text style={styles.notesText} numberOfLines={2}>
                  {todayEntry.notes}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No entry for today. Tap to create one.</Text>
          )}
        </Card>

        {/* Weekly Entries */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>This Week</Text>
          {weeklyEntries.length > 0 ? (
            weeklyEntries.map((entry: { id: string; entry_date: string | Date }) => {
              const entryDate = format(new Date(entry.entry_date), "yyyy-MM-dd");
              return (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.entryItem}
                  onPress={() => router.push(`/(tabs)/journal/${entryDate}`)}
                >
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>
                      {format(new Date(entry.entry_date), "MMM d")}
                    </Text>
                    {entry.cravings_intensity !== null && (
                      <Badge
                        label={`${entry.cravings_intensity}/10`}
                        variant={entry.cravings_intensity > 5 ? "danger" : "info"}
                        size="small"
                      />
                    )}
                  </View>
                  {entry.gratitude && (
                    <Text style={styles.entryText} numberOfLines={1}>
                      {entry.gratitude}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No entries this week</Text>
          )}
        </Card>
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
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
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
  notesText: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
    fontStyle: "italic",
  },
  emptyText: {
    color: "#8E8E93",
    fontStyle: "italic",
  },
  entryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  entryText: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
});

