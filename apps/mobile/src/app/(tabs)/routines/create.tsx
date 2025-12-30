/**
 * Create Routine Screen
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
} from "react-native";
import { useRouter } from "expo-router";
import { useCreateRoutine } from "../../../hooks/useRoutines";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function CreateRoutineScreen() {
  const router = useRouter();
  const createMutation = useCreateRoutine();

  const [title, setTitle] = useState("");
  const [scheduleType, setScheduleType] = useState<"daily" | "weekly">("daily");
  const [time, setTime] = useState("09:00");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [active, setActive] = useState(true);

  const toggleDay = (dayIndex: number) => {
    if (daysOfWeek.includes(dayIndex)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== dayIndex));
    } else {
      setDaysOfWeek([...daysOfWeek, dayIndex]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a title");
      return;
    }

    if (scheduleType === "weekly" && daysOfWeek.length === 0) {
      Alert.alert("Required", "Please select at least one day");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        schedule: {
          type: scheduleType,
          time,
          daysOfWeek: scheduleType === "weekly" ? daysOfWeek : undefined,
        },
        active,
      });
      Alert.alert("Success", "Routine created successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create routine"
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Input
          label="Title *"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Morning meditation"
        />

        <View style={styles.section}>
          <Text style={styles.label}>Schedule Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                scheduleType === "daily" && styles.typeButtonActive,
              ]}
              onPress={() => setScheduleType("daily")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  scheduleType === "daily" && styles.typeButtonTextActive,
                ]}
              >
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                scheduleType === "weekly" && styles.typeButtonActive,
              ]}
              onPress={() => setScheduleType("weekly")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  scheduleType === "weekly" && styles.typeButtonTextActive,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Input
          label="Time"
          value={time}
          onChangeText={setTime}
          placeholder="HH:MM (e.g., 09:00)"
        />

        {scheduleType === "weekly" && (
          <View style={styles.section}>
            <Text style={styles.label}>Days of Week</Text>
            <View style={styles.daysContainer}>
              {DAYS.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    daysOfWeek.includes(index) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      daysOfWeek.includes(index) && styles.dayButtonTextActive,
                    ]}
                  >
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active</Text>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.hint}>
            Active routines will send notifications at the scheduled time
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Create Routine"
            onPress={handleSave}
            disabled={createMutation.isPending}
            loading={createMutation.isPending}
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
  typeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    minWidth: 80,
  },
  dayButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  dayButtonText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  dayButtonTextActive: {
    color: "#fff",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
  actions: {
    marginBottom: 24,
  },
});

