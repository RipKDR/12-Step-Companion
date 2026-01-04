/**
 * Quick Craving Log
 *
 * 30-second flow for logging cravings quickly
 */

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useUpsertDailyEntry } from "../../../hooks/useDailyEntries";
import { Button } from "../../../components/ui/Button";
import { Slider } from "../../../components/ui/Slider";

const QUICK_TRIGGERS = ["Stress", "Loneliness", "Boredom", "Other"];
const QUICK_COPING = ["Called sponsor", "Breathing", "Meeting", "Other"];

export default function QuickCravingLogScreen() {
  const router = useRouter();
  const upsertMutation = useUpsertDailyEntry();
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [coping, setCoping] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      await upsertMutation.mutateAsync({
        entryDate: new Date(),
        cravingsIntensity: intensity,
        triggers: trigger ? [trigger] : [],
        copingActions: coping ? [coping] : [],
        feelings: [],
        gratitude: null,
        notes: null,
        shareWithSponsor: false,
      });
      Alert.alert("Saved", "Craving logged successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to log craving"
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quick Craving Log</Text>
        <Text style={styles.subtitle}>Log your craving in 30 seconds</Text>

        {/* Intensity */}
        <View style={styles.section}>
          <Slider
            label="Intensity (0-10)"
            value={intensity}
            onValueChange={setIntensity}
            minimumValue={0}
            maximumValue={10}
            showValue
          />
        </View>

        {/* Trigger */}
        <View style={styles.section}>
          <Text style={styles.label}>What triggered this?</Text>
          <View style={styles.options}>
            {QUICK_TRIGGERS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.option, trigger === t && styles.optionActive]}
                onPress={() => setTrigger(t)}
              >
                <Text
                  style={[
                    styles.optionText,
                    trigger === t && styles.optionTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coping */}
        <View style={styles.section}>
          <Text style={styles.label}>What did you do?</Text>
          <View style={styles.options}>
            {QUICK_COPING.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.option, coping === c && styles.optionActive]}
                onPress={() => setCoping(c)}
              >
                <Text
                  style={[
                    styles.optionText,
                    coping === c && styles.optionTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Save"
            onPress={handleSave}
            disabled={upsertMutation.isPending}
            loading={upsertMutation.isPending}
            fullWidth
          />
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => {
              Alert.alert(
                "Need Help?",
                "Would you like to open your support card or action plan?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Support Card",
                    onPress: () => router.push("/(tabs)/support"),
                  },
                  {
                    text: "Action Plans",
                    onPress: () => router.push("/(tabs)/action-plans"),
                  },
                ]
              );
            }}
          >
            <Text style={styles.helpButtonText}>Need more help?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    minWidth: 100,
  },
  optionActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  optionText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  optionTextActive: {
    color: "#fff",
  },
  actions: {
    marginTop: 24,
  },
  helpButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  helpButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});

