/**
 * Routine Detail Screen
 */

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRoutine, useUpdateRoutine, useDeleteRoutine, useLogRoutine } from "../../../hooks/useRoutines";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/Card";
import { format } from "date-fns";

export default function RoutineDetailScreen() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { routine, isLoading } = useRoutine(routineId || null);
  const updateMutation = useUpdateRoutine();
  const deleteMutation = useDeleteRoutine();
  const logMutation = useLogRoutine();

  const [showLogModal, setShowLogModal] = useState(false);
  const [logStatus, setLogStatus] = useState<"completed" | "skipped" | "failed">("completed");
  const [logNote, setLogNote] = useState("");

  const handleToggleActive = async () => {
    if (!routine) return;
    try {
      await updateMutation.mutateAsync({
        id: routine.id,
        active: !routine.active,
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update routine"
      );
    }
  };

  const handleLog = async () => {
    if (!routine) return;
    try {
      await logMutation.mutateAsync({
        routineId: routine.id,
        status: logStatus,
        note: logNote || undefined,
      });
      setShowLogModal(false);
      setLogNote("");
      Alert.alert("Success", "Routine logged successfully");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to log routine"
      );
    }
  };

  const handleDelete = () => {
    if (!routine) return;
    Alert.alert(
      "Delete Routine",
      `Are you sure you want to delete "${routine.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({ id: routine.id });
              router.back();
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

  if (isLoading || !routine) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const schedule = routine.schedule as any;
  const getScheduleText = () => {
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{routine.title}</Text>
          {routine.active ? (
            <Badge label="Active" variant="success" size="small" />
          ) : (
            <Badge label="Inactive" variant="default" size="small" />
          )}
        </View>

        <Card style={styles.scheduleCard}>
          <Text style={styles.scheduleLabel}>Schedule</Text>
          <Text style={styles.scheduleText}>{getScheduleText()}</Text>
        </Card>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active</Text>
            <Switch
              value={routine.active}
              onValueChange={handleToggleActive}
              trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
              thumbColor="#fff"
              disabled={updateMutation.isPending}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Log Completion"
            onPress={() => setShowLogModal(true)}
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="Edit"
            onPress={() => router.push(`/(tabs)/routines/${routineId}/edit`)}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            variant="danger"
            fullWidth
            style={styles.actionButton}
            disabled={deleteMutation.isPending}
            loading={deleteMutation.isPending}
          />
        </View>
      </View>

      {/* Log Modal */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Routine</Text>
            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.statusButtons}>
              {(["completed", "skipped", "failed"] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    logStatus === status && styles.statusButtonActive,
                  ]}
                  onPress={() => setLogStatus(status)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      logStatus === status && styles.statusButtonTextActive,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLabel}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note..."
              value={logNote}
              onChangeText={setLogNote}
              multiline
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowLogModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Log"
                onPress={handleLog}
                disabled={logMutation.isPending}
                loading={logMutation.isPending}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    color: "#000",
  },
  scheduleCard: {
    marginBottom: 16,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#000",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  statusButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  statusButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  statusButtonTextActive: {
    color: "#fff",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

