/**
 * Step Version History Screen
 *
 * Shows all versions of a step entry with diff view and restore option
 */

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSteps, useStepEntryVersions, useUpsertStepEntry } from "../../../../hooks/useSteps";
import { useProfile } from "../../../../hooks/useProfile";
import { Card } from "../../../../components/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { format } from "date-fns";
import { Clock, RotateCcw } from "lucide-react-native";

export default function StepVersionsScreen() {
  const router = useRouter();
  const { stepId } = useLocalSearchParams<{ stepId: string }>();
  const { profile } = useProfile();
  const program = (profile?.program as "NA" | "AA") || "NA";
  const { steps } = useSteps(program);
  const { versions, isLoading } = useStepEntryVersions(stepId || null);
  const upsertMutation = useUpsertStepEntry();

  const step = steps.find((s) => s.id === stepId);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [compareVersion, setCompareVersion] = useState<number | null>(null);

  const handleRestore = (version: typeof versions[0]) => {
    Alert.alert(
      "Restore Version",
      `Are you sure you want to restore version ${version.version}? This will create a new version with this content.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: async () => {
            try {
              await upsertMutation.mutateAsync({
                stepId: stepId!,
                content: version.content as Record<string, unknown>,
                isSharedWithSponsor: version.is_shared_with_sponsor || false,
              });
              Alert.alert("Success", "Version restored successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to restore version"
              );
            }
          },
        },
      ]
    );
  };

  const getContentPreview = (content: any) => {
    if (!content || typeof content !== "object") return "No content";
    const keys = Object.keys(content);
    if (keys.length === 0) return "Empty";
    const firstKey = keys[0];
    const firstValue = content[firstKey];
    if (typeof firstValue === "string") {
      return firstValue.substring(0, 100) + (firstValue.length > 100 ? "..." : "");
    }
    return `${keys.length} answers`;
  };

  const getDiff = (oldContent: any, newContent: any) => {
    if (!oldContent || !newContent) return [];
    const oldKeys = Object.keys(oldContent);
    const newKeys = Object.keys(newContent);
    const allKeys = new Set([...oldKeys, ...newKeys]);
    const diffs: Array<{ key: string; old: string; new: string }> = [];

    allKeys.forEach((key) => {
      const oldVal = String(oldContent[key] || "");
      const newVal = String(newContent[key] || "");
      if (oldVal !== newVal) {
        diffs.push({ key, old: oldVal, new: newVal });
      }
    });

    return diffs;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (versions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Versions</Text>
          <Text style={styles.emptyText}>
            Start working on this step to create your first version
          </Text>
          <Button
            title="Go to Step"
            onPress={() => router.back()}
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  }

  const selectedVersionData = selectedVersion
    ? versions.find((v) => v.version === selectedVersion)
    : null;
  const compareVersionData = compareVersion
    ? versions.find((v) => v.version === compareVersion)
    : null;
  const diffs = selectedVersionData && compareVersionData
    ? getDiff(compareVersionData.content, selectedVersionData.content)
    : [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {step && (
          <View style={styles.header}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.versionCount}>
              {versions.length} version{versions.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}

        {/* Version List */}
        <View style={styles.versionsList}>
          {versions.map((version: { id: string; version: number }) => (
            <Card
              key={version.id}
              variant="interactive"
              onPress={() => {
                if (selectedVersion === version.version) {
                  setSelectedVersion(null);
                } else {
                  setSelectedVersion(version.version);
                }
              }}
              style={[
                styles.versionCard,
                selectedVersion === version.version && styles.versionCardSelected,
              ]}
            >
              <View style={styles.versionHeader}>
                <View style={styles.versionInfo}>
                  <Text style={styles.versionNumber}>Version {version.version}</Text>
                  <Text style={styles.versionDate}>
                    {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </Text>
                </View>
                {version.is_shared_with_sponsor && (
                  <Badge label="Shared" variant="info" size="small" />
                )}
              </View>
              <Text style={styles.versionPreview} numberOfLines={2}>
                {getContentPreview(version.content)}
              </Text>
              <View style={styles.versionActions}>
                <TouchableOpacity
                  style={styles.compareButton}
                  onPress={() => {
                    if (compareVersion === version.version) {
                      setCompareVersion(null);
                    } else {
                      setCompareVersion(version.version);
                    }
                  }}
                >
                  <Clock size={16} color="#007AFF" />
                  <Text style={styles.compareButtonText}>
                    {compareVersion === version.version ? "Comparing" : "Compare"}
                  </Text>
                </TouchableOpacity>
                {version.version !== versions[0].version && (
                  <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={() => handleRestore(version)}
                  >
                    <RotateCcw size={16} color="#34C759" />
                    <Text style={styles.restoreButtonText}>Restore</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Diff View */}
        {selectedVersionData && compareVersionData && diffs.length > 0 && (
          <Card style={styles.diffCard}>
            <Text style={styles.diffTitle}>
              Comparing Version {compareVersion} → Version {selectedVersion}
            </Text>
            <ScrollView style={styles.diffContent}>
              {diffs.map((diff: { key: string; old?: string; new?: string }, index: number) => (
                <View key={index} style={styles.diffItem}>
                  <Text style={styles.diffKey}>{diff.key}</Text>
                  <View style={styles.diffValues}>
                    <View style={styles.diffOld}>
                      <Text style={styles.diffLabel}>Old:</Text>
                      <Text style={styles.diffText}>{diff.old || "(empty)"}</Text>
                    </View>
                    <View style={styles.diffNew}>
                      <Text style={styles.diffLabel}>New:</Text>
                      <Text style={styles.diffText}>{diff.new || "(empty)"}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Selected Version Detail */}
        {selectedVersionData && !compareVersionData && (
          <Card style={styles.detailCard}>
            <Text style={styles.detailTitle}>
              Version {selectedVersionData.version} Content
            </Text>
            <ScrollView style={styles.detailContent}>
              {Object.entries(selectedVersionData.content as Record<string, unknown>).map(
                ([key, value]: [string, unknown]) => (
                  <View key={key} style={styles.detailItem}>
                    <Text style={styles.detailKey}>{key}</Text>
                    <Text style={styles.detailValue}>{String(value)}</Text>
                  </View>
                )
              )}
            </ScrollView>
          </Card>
        )}
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
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  versionCount: {
    fontSize: 14,
    color: "#8E8E93",
  },
  versionsList: {
    marginBottom: 24,
  },
  versionCard: {
    marginBottom: 12,
  },
  versionCardSelected: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  versionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  versionInfo: {
    flex: 1,
  },
  versionNumber: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  versionDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  versionPreview: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
    lineHeight: 20,
  },
  versionActions: {
    flexDirection: "row",
    gap: 12,
  },
  compareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
  },
  compareButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
  },
  restoreButtonText: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "600",
  },
  diffCard: {
    marginBottom: 24,
    maxHeight: 400,
  },
  diffTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000",
  },
  diffContent: {
    maxHeight: 300,
  },
  diffItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  diffKey: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  diffValues: {
    gap: 8,
  },
  diffOld: {
    backgroundColor: "#FFEBEE",
    padding: 8,
    borderRadius: 4,
  },
  diffNew: {
    backgroundColor: "#E8F5E9",
    padding: 8,
    borderRadius: 4,
  },
  diffLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  diffText: {
    fontSize: 14,
    color: "#000",
  },
  detailCard: {
    marginBottom: 24,
    maxHeight: 400,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000",
  },
  detailContent: {
    maxHeight: 300,
  },
  detailItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  detailKey: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  detailValue: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 16,
  },
});

