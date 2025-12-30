/**
 * Routines List Screen
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
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useRoutines, useUpdateRoutine, useDeleteRoutine } from "../../../hooks/useRoutines";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Plus } from "lucide-react-native";
import { format } from "date-fns";

export default function RoutinesListScreen() {
  const router = useRouter();
  const { routines, isLoading } = useRoutines();
  const updateMutation = useUpdateRoutine();
  const deleteMutation = useDeleteRoutine();

  const handleToggleActive = async (routineId: string, currentActive: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id: routineId,
        active: !currentActive,
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update routine"
      );
    }
  };

  const handleDelete = (routineId: string, title: string) => {
    Alert.alert(
      "Delete Routine",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({ id: routineId });
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to delete routine"
              );
            }
          },
        },
      ]
    );
  };

  const getScheduleText = (schedule: any) => {
    if (schedule.type === "daily") {
      return `Daily at ${schedule.time}`;
    } else {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const selectedDays = (schedule.daysOfWeek || [])
        .map((d: number) => days[d])
        .join(", ");
      return `${selectedDays} at ${schedule.time}`;
    }
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
          {routines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Routines</Text>
              <Text style={styles.emptyText}>
                Create routines to build healthy habits and track your progress
              </Text>
              <Button
                title="Create Routine"
                onPress={() => router.push("/(tabs)/routines/create")}
                style={styles.createButton}
              />
            </View>
          ) : (
            routines.map((routine: { id: string; title: string }) => (
              <Card key={routine.id} style={styles.routineCard}>
                <View style={styles.routineHeader}>
                  <View style={styles.routineTitleRow}>
                    <Text style={styles.routineTitle}>{routine.title}</Text>
                    {routine.active ? (
                      <Badge label="Active" variant="success" size="small" />
                    ) : (
                      <Badge label="Inactive" variant="default" size="small" />
                    )}
                  </View>
                  <Switch
                    value={routine.active}
                    onValueChange={() => handleToggleActive(routine.id, routine.active)}
                    trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                    thumbColor="#fff"
                  />
                </View>
                <Text style={styles.routineSchedule}>
                  {getScheduleText(routine.schedule)}
                </Text>
                <View style={styles.routineActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/(tabs)/routines/${routine.id}`)}
                  >
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(routine.id, routine.title)}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
      {routines.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(tabs)/routines/create")}
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
  routineCard: {
    marginBottom: 16,
  },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  routineTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  routineSchedule: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
  },
  routineActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#F2F2F7",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "transparent",
  },
  deleteButtonText: {
    color: "#FF3B30",
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

