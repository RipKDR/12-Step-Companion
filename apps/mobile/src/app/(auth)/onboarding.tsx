/**
 * Onboarding Flow
 *
 * Multi-step onboarding for new users
 */

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useUpdateProfile } from "../../hooks/useProfile";
import { useUpsertDailyEntry } from "../../hooks/useDailyEntries";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

type OnboardingStep = "welcome" | "program" | "cleanDate" | "profile" | "permissions" | "complete";

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [program, setProgram] = useState<"NA" | "AA" | null>(null);
  const [cleanDate, setCleanDate] = useState<Date>(new Date());
  const [handle, setHandle] = useState("");
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [loading, setLoading] = useState(false);

  const updateProfile = useUpdateProfile();
  const createDailyEntry = useUpsertDailyEntry();

  const handleNext = () => {
    switch (step) {
      case "welcome":
        setStep("program");
        break;
      case "program":
        if (!program) {
          Alert.alert("Required", "Please select a program");
          return;
        }
        setStep("cleanDate");
        break;
      case "cleanDate":
        setStep("profile");
        break;
      case "profile":
        setStep("permissions");
        break;
      case "permissions":
        handleComplete();
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case "program":
        setStep("welcome");
        break;
      case "cleanDate":
        setStep("program");
        break;
      case "profile":
        setStep("cleanDate");
        break;
      case "permissions":
        setStep("profile");
        break;
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Update profile with onboarding data
      await updateProfile.mutateAsync({
        program: program || null,
        cleanDate: cleanDate,
        handle: handle || undefined,
        timezone,
      });

      // Request permissions
      await requestPermissions();

      // Create first gratitude entry
      try {
        await createDailyEntry.mutateAsync({
          entryDate: new Date(),
          gratitude: "Starting my recovery journey",
          cravingsIntensity: null,
          feelings: [],
          triggers: [],
          copingActions: [],
          notes: null,
        });
      } catch (err) {
        // Non-critical, continue
        console.log("Could not create first entry:", err);
      }

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to complete onboarding"
      );
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    // Request location permission
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.log("Location permission error:", err);
    }

    // Request notification permission
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permission denied");
      }
    } catch (err) {
      console.log("Notification permission error:", err);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Welcome to 12-Step Recovery Companion</Text>
            <Text style={styles.description}>
              A privacy-first app to support your recovery journey. Track your progress, complete
              step work, and connect with your sponsor—all with your data under your control.
            </Text>
            <Text style={styles.subtitle}>Let's get started</Text>
          </View>
        );

      case "program":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Which program are you in?</Text>
            <Text style={styles.description}>
              This helps us provide the right step work and meeting finder for you.
            </Text>
            <View style={styles.programSelector}>
              <TouchableOpacity
                style={[styles.programButton, program === "NA" && styles.programButtonActive]}
                onPress={() => setProgram("NA")}
              >
                <Text
                  style={[
                    styles.programButtonText,
                    program === "NA" && styles.programButtonTextActive,
                  ]}
                >
                  Narcotics Anonymous (NA)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.programButton, program === "AA" && styles.programButtonActive]}
                onPress={() => setProgram("AA")}
              >
                <Text
                  style={[
                    styles.programButtonText,
                    program === "AA" && styles.programButtonTextActive,
                  ]}
                >
                  Alcoholics Anonymous (AA)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "cleanDate":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>When is your clean date?</Text>
            <Text style={styles.description}>
              This is the date you started your recovery journey. You can change it later if needed.
            </Text>
            <View style={styles.dateInput}>
              <TextInput
                style={styles.dateTextInput}
                placeholder="YYYY-MM-DD"
                value={cleanDate.toISOString().split("T")[0]}
                onChangeText={(text) => {
                  const date = new Date(text);
                  if (!isNaN(date.getTime())) {
                    setCleanDate(date);
                  }
                }}
              />
              <Text style={styles.dateHint}>
                Selected: {cleanDate.toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.timezoneText}>Timezone: {timezone}</Text>
          </View>
        );

      case "profile":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Create your profile</Text>
            <Text style={styles.description}>
              Choose a handle (optional) that your sponsor will see. You can always change this
              later.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Handle (optional)"
              value={handle}
              onChangeText={setHandle}
              maxLength={30}
            />
            <Text style={styles.hint}>This helps your sponsor identify you</Text>
          </View>
        );

      case "permissions":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Permissions</Text>
            <Text style={styles.description}>
              We need a few permissions to provide the best experience:
            </Text>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionTitle}>Location</Text>
              <Text style={styles.permissionDesc}>
                Find nearby meetings and set up geofenced triggers for your action plans
              </Text>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionTitle}>Notifications</Text>
              <Text style={styles.permissionDesc}>
                Remind you about routines and daily check-ins
              </Text>
            </View>
            <Text style={styles.permissionNote}>
              You can change these anytime in Settings
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const progressMap: Record<string, number> = {
    welcome: 1,
    program: 2,
    cleanDate: 3,
    profile: 4,
    permissions: 5,
  };

  const progress = progressMap[step] ?? 1;
  const totalSteps = 5;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Setting up your account...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(progress / totalSteps) * 100}%` }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigation}>
        {step !== "welcome" && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, step === "welcome" && styles.nextButtonFull]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {step === "permissions" ? "Complete Setup" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5EA",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#000",
  },
  description: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 18,
    color: "#007AFF",
    textAlign: "center",
    marginTop: 24,
    fontWeight: "600",
  },
  programSelector: {
    gap: 16,
    marginTop: 24,
  },
  programButton: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    borderWidth: 2,
    borderColor: "transparent",
  },
  programButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  programButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  programButtonTextActive: {
    color: "#fff",
  },
  dateInput: {
    marginTop: 24,
  },
  dateTextInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    marginBottom: 8,
  },
  dateHint: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  timezoneText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginTop: 24,
  },
  hint: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center",
  },
  permissionItem: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  permissionDesc: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  permissionNote: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 24,
    fontStyle: "italic",
  },
  navigation: {
    flexDirection: "row",
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  nextButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
});

