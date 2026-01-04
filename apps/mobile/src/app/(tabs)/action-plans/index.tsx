/**
 * Action Plans List Screen
 */

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useActionPlans, useDeleteActionPlan } from "../../../hooks/useActionPlans";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Plus } from "lucide-react-native";

export default function ActionPlansListScreen() {
  const router = useRouter();
  const { plans, isLoading } = useActionPlans();
  const deleteMutation = useDeleteActionPlan();

  const handleDelete = (planId: string, title: string) => {
    Alert.alert(
      "Delete Action Plan",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({ id: planId });
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to delete plan"
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {plans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Action Plans</Text>
              <Text style={styles.emptyText}>
                Create your first action plan to prepare for difficult situations
              </Text>
              <Button
                title="Create Action Plan"
                onPress={() => router.push("/(tabs)/action-plans/create")}
                style={styles.createButton}
              />
            </View>
          ) : (
            plans.map((plan: { id: string; title: string; situation?: string | null; is_shared_with_sponsor?: boolean | null; if_then?: unknown; emergency_contacts?: unknown }) => (
              <Card
                key={plan.id}
                variant="interactive"
                onPress={() => router.push(`/(tabs)/action-plans/${plan.id}`)}
                style={styles.planCard}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  {plan.is_shared_with_sponsor && (
                    <Badge label="Shared" variant="info" size="small" />
                  )}
                </View>
                {plan.situation && (
                  <Text style={styles.planSituation} numberOfLines={2}>
                    {plan.situation}
                  </Text>
                )}
                <View style={styles.planMeta}>
                  <Text style={styles.planMetaText}>
                    {(plan.if_then as any[])?.length || 0} if-then rules
                  </Text>
                  {plan.emergency_contacts && (plan.emergency_contacts as any[]).length > 0 && (
                    <Text style={styles.planMetaText}>
                      {(plan.emergency_contacts as any[]).length} contacts
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(plan.id, plan.title)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
      {plans.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(tabs)/action-plans/create")}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  createButton: {
    marginTop: 16,
  },
  planCard: {
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    color: "#000",
  },
  planSituation: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
  },
  planMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  planMetaText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  deleteButton: {
    marginTop: 12,
    padding: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

