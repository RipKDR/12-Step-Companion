/**
 * Journal Tab - Mobile App
 * 
 * Daily recovery log screen using tRPC
 */

import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useTodaysEntry, useWeeklyEntries, useUpsertDailyEntry } from "../../hooks/useDailyEntries";
import { useProfile } from "../../hooks/useProfile";
import { format } from "date-fns";

export default function JournalScreen() {
  const { profile } = useProfile();
  const { entry: todayEntry, isLoading } = useTodaysEntry(profile?.timezone || "UTC");
  const { entries: weeklyEntries } = useWeeklyEntries(profile?.timezone || "UTC");
  const upsertMutation = useUpsertDailyEntry();

  const [showEditor, setShowEditor] = useState(false);
  const [gratitude, setGratitude] = useState(todayEntry?.gratitude || "");
  const [notes, setNotes] = useState(todayEntry?.notes || "");

  const handleSave = async () => {
    try {
      await upsertMutation.mutateAsync({
        gratitude: gratitude || null,
        notes: notes || null,
      });
      setShowEditor(false);
    } catch (error) {
      console.error("Failed to save entry:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Today's Entry */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Entry</Text>
          {todayEntry ? (
            <View>
              {todayEntry.gratitude && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Gratitude</Text>
                  <Text style={styles.sectionText}>{todayEntry.gratitude}</Text>
                </View>
              )}
              {todayEntry.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Notes</Text>
                  <Text style={styles.sectionText}>{todayEntry.notes}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setShowEditor(true)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.emptyText}>No entry for today</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowEditor(true)}
              >
                <Text style={styles.createButtonText}>Create Entry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Editor */}
        {showEditor && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Edit Entry</Text>
            <TextInput
              style={styles.input}
              placeholder="What are you grateful for today?"
              value={gratitude}
              onChangeText={setGratitude}
              multiline
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="How are you feeling today?"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <View style={styles.editorActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditor(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={upsertMutation.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {upsertMutation.isPending ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Weekly Entries */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week</Text>
          {weeklyEntries.length > 0 ? (
            weeklyEntries.map((entry) => (
              <View key={entry.id} style={styles.entryItem}>
                <Text style={styles.entryDate}>
                  {format(new Date(entry.entry_date), "MMM d")}
                </Text>
                {entry.gratitude && (
                  <Text style={styles.entryText} numberOfLines={1}>
                    {entry.gratitude}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No entries this week</Text>
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
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: "#000",
  },
  emptyText: {
    color: "#8E8E93",
    fontStyle: "italic",
    marginBottom: 12,
  },
  editButton: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  createButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#34C759",
    borderRadius: 6,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  editorActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#000",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  entryItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  entryDate: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  entryText: {
    fontSize: 14,
    color: "#000",
  },
});

