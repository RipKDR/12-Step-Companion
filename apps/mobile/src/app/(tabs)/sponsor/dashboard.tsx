/**
 * Sponsor Dashboard
 *
 * View shared content from sponsees (similar to web app)
 */

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { trpc } from "../../../lib/trpc";
import { useSponsorRelationships } from "../../../hooks/useSponsor";
import { Card } from "../../../components/Card";
import { Badge } from "../../../components/ui/Badge";
import { FileText, Calendar, Target, Users } from "lucide-react-native";
import { format } from "date-fns";

export default function SponsorDashboardScreen() {
  const router = useRouter();
  const { relationships, isLoading: relationshipsLoading } = useSponsorRelationships();
  const [selectedSponseeId, setSelectedSponseeId] = useState<string | null>(null);

  const activeSponsees = relationships.filter(
    (r) => r.status === "active" && r.sponsee_id !== null
  );

  // If only one sponsee, auto-select
  if (activeSponsees.length === 1 && !selectedSponseeId) {
    setSelectedSponseeId(activeSponsees[0].sponsee_id);
  }

  if (relationshipsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (activeSponsees.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Users size={48} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No Active Sponsees</Text>
          <Text style={styles.emptyText}>
            Share your sponsor code to connect with sponsees
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/(tabs)/sponsor/generate-code")}
          >
            <Text style={styles.emptyButtonText}>Generate Sponsor Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Sponsee Selector */}
        {activeSponsees.length > 1 && (
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>Select Sponsee:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activeSponsees.map((rel) => (
                <TouchableOpacity
                  key={rel.id}
                  style={[
                    styles.selectorButton,
                    selectedSponseeId === rel.sponsee_id && styles.selectorButtonActive,
                  ]}
                  onPress={() => setSelectedSponseeId(rel.sponsee_id)}
                >
                  <Text
                    style={[
                      styles.selectorButtonText,
                      selectedSponseeId === rel.sponsee_id && styles.selectorButtonTextActive,
                    ]}
                  >
                    Sponsee {rel.sponsee_id?.substring(0, 8)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Shared Content */}
        {selectedSponseeId && (
          <SponseeContentView sponseeId={selectedSponseeId} />
        )}
      </View>
    </ScrollView>
  );
}

function SponseeContentView({ sponseeId }: { sponseeId: string }) {
  // Use type assertions to work around TypeScript inference issues
  const {
    data: sharedSteps,
    isLoading: loadingSteps,
  } = (trpc as any).steps.getSharedEntries.useQuery({ sponseeId }) as { data: any; isLoading: boolean };

  const {
    data: sharedDaily,
    isLoading: loadingDaily,
  } = (trpc as any).dailyEntries.getSharedEntries.useQuery({ sponseeId }) as { data: any; isLoading: boolean };

  const {
    data: sharedPlans,
    isLoading: loadingPlans,
  } = (trpc as any).actionPlans.getSharedPlans.useQuery({ sponseeId }) as { data: any; isLoading: boolean };

  if (loadingSteps || loadingDaily || loadingPlans) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading shared content...</Text>
      </View>
    );
  }

  const stepEntries = (sharedSteps || []) as any[];
  const dailyEntries = (sharedDaily || []) as any[];
  const actionPlans = (sharedPlans || []) as any[];

  return (
    <View style={styles.contentView}>
      {/* Shared Step Entries */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>Shared Step Work</Text>
          <Badge label={stepEntries.length.toString()} variant="info" size="small" />
        </View>
        {stepEntries.length > 0 ? (
          stepEntries.map((entry) => (
            <Card key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>
                  {entry.step?.title
                    ? `Step ${entry.step.step_number}: ${entry.step.title}`
                    : "Step Entry"}
                </Text>
                <Text style={styles.entryDate}>
                  {entry.created_at
                    ? format(new Date(entry.created_at), "MMM d, yyyy")
                    : "—"}
                </Text>
              </View>
              <View style={styles.contentPreview}>
                <Text style={styles.contentText} numberOfLines={3}>
                  {typeof entry.content === "string"
                    ? entry.content
                    : JSON.stringify(entry.content, null, 2)}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <FileText size={32} color="#8E8E93" />
            <Text style={styles.emptyText}>No shared step entries yet</Text>
          </Card>
        )}
      </View>

      {/* Shared Daily Entries */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>Shared Daily Logs</Text>
          <Badge label={dailyEntries.length.toString()} variant="info" size="small" />
        </View>
        {dailyEntries.length > 0 ? (
          dailyEntries.map((entry) => (
            <Card key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>
                  {format(new Date(entry.entry_date), "EEEE, MMM d, yyyy")}
                </Text>
                <Badge
                  label={`Intensity: ${entry.cravings_intensity ?? 0}/10`}
                  variant={entry.cravings_intensity && entry.cravings_intensity > 5 ? "destructive" : "success"}
                  size="small"
                />
              </View>
              {entry.gratitude && (
                <View style={styles.gratitudeBox}>
                  <Text style={styles.gratitudeLabel}>Gratitude</Text>
                  <Text style={styles.gratitudeText}>{entry.gratitude}</Text>
                </View>
              )}
              {entry.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Notes</Text>
                  <Text style={styles.notesText}>{entry.notes}</Text>
                </View>
              )}
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Calendar size={32} color="#8E8E93" />
            <Text style={styles.emptyText}>No shared daily logs yet</Text>
          </Card>
        )}
      </View>

      {/* Shared Action Plans */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Target size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>Shared Action Plans</Text>
          <Badge label={actionPlans.length.toString()} variant="info" size="small" />
        </View>
        {actionPlans.length > 0 ? (
          actionPlans.map((plan) => (
            <Card key={plan.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{plan.title}</Text>
                <Text style={styles.entryDate}>
                  {plan.created_at
                    ? format(new Date(plan.created_at), "MMM d, yyyy")
                    : "—"}
                </Text>
              </View>
              {plan.situation && (
                <View style={styles.situationBox}>
                  <Text style={styles.situationText}>{plan.situation}</Text>
                </View>
              )}
              {plan.if_then && plan.if_then.length > 0 && (
                <View style={styles.rulesContainer}>
                  {(plan.if_then as Array<{ if: string; then: string }>).map((rule, idx) => (
                    <View key={idx} style={styles.ruleBox}>
                      <Text style={styles.ruleIf}>
                        <Text style={styles.ruleLabel}>If:</Text> {rule.if}
                      </Text>
                      <Text style={styles.ruleThen}>
                        <Text style={styles.ruleLabel}>Then:</Text> {rule.then}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Target size={32} color="#8E8E93" />
            <Text style={styles.emptyText}>No shared action plans yet</Text>
          </Card>
        )}
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
    padding: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#8E8E93",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
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
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selector: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  selectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginRight: 8,
  },
  selectorButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  selectorButtonTextActive: {
    color: "#fff",
  },
  contentView: {
    gap: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    color: "#000",
  },
  entryCard: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    color: "#000",
  },
  entryDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  contentPreview: {
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 8,
  },
  contentText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "monospace",
  },
  gratitudeBox: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
  },
  gratitudeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  gratitudeText: {
    fontSize: 14,
    color: "#000",
  },
  notesBox: {
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#8E8E93",
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 14,
    color: "#000",
  },
  situationBox: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  situationText: {
    fontSize: 14,
    color: "#000",
    fontStyle: "italic",
  },
  rulesContainer: {
    gap: 8,
  },
  ruleBox: {
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  ruleIf: {
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
  },
  ruleThen: {
    fontSize: 14,
    color: "#000",
  },
  ruleLabel: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  emptyCard: {
    alignItems: "center",
    padding: 32,
  },
});

