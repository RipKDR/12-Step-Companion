/**
 * Step Detail Screen
 *
 * Full step work editor with prompts and save functionality
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSteps, useStepEntries, useUpsertStepEntry } from "../../../hooks/useSteps";
import { useProfile } from "../../../hooks/useProfile";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { Clock } from "lucide-react-native";

export default function StepDetailScreen() {
  const router = useRouter();
  const { stepId } = useLocalSearchParams<{ stepId: string }>();
  const { profile } = useProfile();
  const program = (profile?.program as "NA" | "AA") || "NA";
  const { steps } = useSteps(program);
  const { entries } = useStepEntries();
  const upsertMutation = useUpsertStepEntry();

  const step = steps.find((s) => s.id === stepId);
  const existingEntry = entries.find((e) => e.step_id === stepId);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isShared, setIsShared] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (existingEntry?.content) {
      setAnswers(existingEntry.content as Record<string, string>);
      setIsShared(existingEntry.is_shared_with_sponsor || false);
    }
  }, [existingEntry]);

  if (!step) {
    return (
      <View style={styles.container}>
        <Text>Step not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    try {
      await upsertMutation.mutateAsync({
        stepId: step.id,
        content: answers,
        isSharedWithSponsor: isShared,
      });
      setHasChanges(false);
      Alert.alert("Success", "Step work saved successfully");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save step work"
      );
    }
  };

  const handleAnswerChange = (promptIndex: number, value: string) => {
    const key = `prompt_${promptIndex}`;
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepNumber}>Step {step.step_number}</Text>
          <Text style={styles.title}>{step.title}</Text>
          {step.description && (
            <Text style={styles.description}>{step.description}</Text>
          )}
          {existingEntry && (
            <View style={styles.versionBadge}>
              <Badge label={`Version ${existingEntry.version}`} variant="info" />
              <TouchableOpacity
                style={styles.versionsButton}
                onPress={() => router.push(`/(tabs)/steps/${stepId}/versions`)}
              >
                <Clock size={16} color="#007AFF" />
                <Text style={styles.versionsButtonText}>View History</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Prompts Form */}
        <View style={styles.promptsContainer}>
          {(() => {
            // Handle prompts as JSONB - could be array of strings or array of objects
            const promptsArray = step.prompts as any;
            if (!promptsArray || !Array.isArray(promptsArray)) return null;

            return promptsArray.map((prompt: any, index: number) => {
              // Handle both string prompts and object prompts with .prompt field
              const promptText = typeof prompt === "string" ? prompt : prompt.prompt || prompt.question || "";
              const key = `prompt_${index}`;
              const value = answers[key] || "";

              if (!promptText) return null;

              return (
                <View key={index} style={styles.promptItem}>
                  <Text style={styles.promptLabel}>
                    {index + 1}. {promptText}
                  </Text>
                  <TextInput
                    style={styles.promptInput}
                    placeholder="Your answer..."
                    value={value}
                    onChangeText={(text) => handleAnswerChange(index, text)}
                    multiline
                    textAlignVertical="top"
                    minHeight={100}
                  />
                </View>
              );
            });
          })()}
        </View>

        {/* Share Toggle */}
        <View style={styles.shareSection}>
          <View style={styles.shareRow}>
            <Text style={styles.shareLabel}>Share with sponsor</Text>
            <Switch
              value={isShared}
              onValueChange={(value) => {
                setIsShared(value);
                setHasChanges(true);
              }}
              trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.shareHint}>
            When enabled, your sponsor can view this step work
          </Text>
        </View>

        {/* Save Button */}
        <View style={styles.actions}>
          <Button
            title={hasChanges ? "Save Changes" : "Saved"}
            onPress={handleSave}
            disabled={!hasChanges || upsertMutation.isPending}
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
  header: {
    marginBottom: 24,
  },
  stepNumber: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  description: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 16,
    lineHeight: 24,
  },
  promptsContainer: {
    marginBottom: 24,
  },
  promptItem: {
    marginBottom: 24,
  },
  promptLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  promptInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
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
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  shareHint: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
  actions: {
    marginBottom: 24,
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  versionsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  versionsButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});

