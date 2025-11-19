/**
 * Steps Tab - Mobile App
 * 
 * Step work screen using tRPC
 */

import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSteps, useStepEntries } from "../../hooks/useSteps";

export default function StepsScreen() {
  const [program, setProgram] = useState<"NA" | "AA">("NA");
  const [selectedStepNumber, setSelectedStepNumber] = useState<number | null>(null);

  const { steps, isLoading } = useSteps(program);
  const { entries } = useStepEntries();

  const selectedStep = steps.find((s) => s.step_number === selectedStepNumber);
  const selectedStepEntry = entries.find((e) => e.step_id === selectedStep?.id);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading steps...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Program Selector */}
        <View style={styles.programSelector}>
          <TouchableOpacity
            style={[styles.programButton, program === "NA" && styles.programButtonActive]}
            onPress={() => setProgram("NA")}
          >
            <Text style={styles.programButtonText}>NA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.programButton, program === "AA" && styles.programButtonActive]}
            onPress={() => setProgram("AA")}
          >
            <Text style={styles.programButtonText}>AA</Text>
          </TouchableOpacity>
        </View>

        {/* Steps Grid */}
        <View style={styles.stepsGrid}>
          {steps.map((step) => {
            const entry = entries.find((e) => e.step_id === step.id);
            const hasEntry = !!entry;

            return (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.stepCard,
                  selectedStepNumber === step.step_number && styles.stepCardSelected,
                ]}
                onPress={() => setSelectedStepNumber(step.step_number)}
              >
                <Text style={styles.stepNumber}>Step {step.step_number}</Text>
                <Text style={styles.stepTitle} numberOfLines={2}>
                  {step.title}
                </Text>
                {hasEntry && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Started</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Step Detail */}
        {selectedStep && (
          <View style={styles.stepDetail}>
            <Text style={styles.stepDetailTitle}>{selectedStep.title}</Text>
            <Text style={styles.stepDetailSubtitle}>
              {selectedStep.prompts.length} questions
            </Text>
            {selectedStepEntry && (
              <Text style={styles.stepDetailNote}>
                Version {selectedStepEntry.version} saved
              </Text>
            )}
          </View>
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
  programSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  programButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  programButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  programButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  stepsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  stepCard: {
    width: "30%",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  stepCardSelected: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  stepNumber: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  stepDetail: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },
  stepDetailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  stepDetailSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  stepDetailNote: {
    fontSize: 12,
    color: "#8E8E93",
    fontStyle: "italic",
  },
});

