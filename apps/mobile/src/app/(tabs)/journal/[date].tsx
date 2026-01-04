/**
 * Daily Entry Detail Screen
 *
 * Full editor for daily recovery log entry
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format, parseISO } from "date-fns";
import { useDailyEntry, useUpsertDailyEntry } from "../../../hooks/useDailyEntries";
import { Button } from "../../../components/ui/Button";
import { Slider } from "../../../components/ui/Slider";
import { VoiceInput } from "../../../components/VoiceInput";

const FEELINGS_OPTIONS = [
  "Grateful",
  "Anxious",
  "Peaceful",
  "Angry",
  "Hopeful",
  "Sad",
  "Excited",
  "Tired",
  "Content",
  "Frustrated",
];

const TRIGGERS_OPTIONS = [
  "Stress",
  "Loneliness",
  "Boredom",
  "Celebration",
  "Conflict",
  "Financial",
  "Work",
  "Family",
  "Social",
  "Health",
];

const COPING_OPTIONS = [
  "Called sponsor",
  "Went to meeting",
  "Exercise",
  "Meditation",
  "Reading",
  "Journaling",
  "Reached out",
  "Prayer",
  "Breathing",
  "Distraction",
];

export default function DailyEntryDetailScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const entryDate = date ? parseISO(date) : new Date();
  const { entry, isLoading } = useDailyEntry(entryDate);
  const upsertMutation = useUpsertDailyEntry();

  const [cravingsIntensity, setCravingsIntensity] = useState(0);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [copingActions, setCopingActions] = useState<string[]>([]);
  const [gratitude, setGratitude] = useState("");
  const [notes, setNotes] = useState("");
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (entry) {
      setCravingsIntensity(entry.cravings_intensity || 0);
      setFeelings(entry.feelings || []);
      setTriggers(entry.triggers || []);
      setCopingActions(entry.coping_actions || []);
      setGratitude(entry.gratitude || "");
      setNotes(entry.notes || "");
      setIsShared(entry.share_with_sponsor || false);
    }
  }, [entry]);

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleSave = async () => {
    try {
      await upsertMutation.mutateAsync({
        entryDate,
        cravingsIntensity: cravingsIntensity || null,
        feelings,
        triggers,
        copingActions,
        gratitude: gratitude || null,
        notes: notes || null,
        shareWithSponsor: isShared,
      });
      Alert.alert("Success", "Entry saved successfully");
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save entry"
      );
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
        <Text style={styles.dateHeader}>
          {format(entryDate, "EEEE, MMMM d, yyyy")}
        </Text>

        {/* Cravings Intensity */}
        <View style={styles.section}>
          <Slider
            label="Cravings Intensity"
            value={cravingsIntensity}
            onValueChange={setCravingsIntensity}
            minimumValue={0}
            maximumValue={10}
            showValue
          />
        </View>

        {/* Feelings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feelings</Text>
          <View style={styles.chipContainer}>
            {FEELINGS_OPTIONS.map((feeling) => (
              <TouchableOpacity
                key={feeling}
                style={[
                  styles.chip,
                  feelings.includes(feeling) && styles.chipActive,
                ]}
                onPress={() => toggleArrayItem(feelings, setFeelings, feeling)}
              >
                <Text
                  style={[
                    styles.chipText,
                    feelings.includes(feeling) && styles.chipTextActive,
                  ]}
                >
                  {feeling}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Triggers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Triggers</Text>
          <View style={styles.chipContainer}>
            {TRIGGERS_OPTIONS.map((trigger) => (
              <TouchableOpacity
                key={trigger}
                style={[
                  styles.chip,
                  triggers.includes(trigger) && styles.chipActive,
                ]}
                onPress={() => toggleArrayItem(triggers, setTriggers, trigger)}
              >
                <Text
                  style={[
                    styles.chipText,
                    triggers.includes(trigger) && styles.chipTextActive,
                  ]}
                >
                  {trigger}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coping Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coping Actions</Text>
          <View style={styles.chipContainer}>
            {COPING_OPTIONS.map((action) => (
              <TouchableOpacity
                key={action}
                style={[
                  styles.chip,
                  copingActions.includes(action) && styles.chipActive,
                ]}
                onPress={() => toggleArrayItem(copingActions, setCopingActions, action)}
              >
                <Text
                  style={[
                    styles.chipText,
                    copingActions.includes(action) && styles.chipTextActive,
                  ]}
                >
                  {action}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gratitude */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gratitude</Text>
          <VoiceInput
            value={gratitude}
            onChangeText={setGratitude}
            placeholder="What are you grateful for today? Tap microphone to speak or type here..."
            multiline
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <VoiceInput
            value={notes}
            onChangeText={setNotes}
            placeholder="How are you feeling? Any thoughts or reflections? Tap microphone to speak or type here..."
            multiline
          />
        </View>

        {/* Share Toggle */}
        <View style={styles.shareSection}>
          <View style={styles.shareRow}>
            <Text style={styles.shareLabel}>Share with sponsor</Text>
            <Switch
              value={isShared}
              onValueChange={setIsShared}
              trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.actions}>
          <Button
            title="Save Entry"
            onPress={handleSave}
            disabled={upsertMutation.isPending}
            loading={upsertMutation.isPending}
            fullWidth
          />
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
  dateHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#000",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  chipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  chipText: {
    fontSize: 14,
    color: "#000",
  },
  chipTextActive: {
    color: "#fff",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  shareSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shareLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  actions: {
    marginBottom: 24,
  },
});

