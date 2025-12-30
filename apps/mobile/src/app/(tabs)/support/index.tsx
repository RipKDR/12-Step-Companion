/**
 * Support Card - Crisis Tools
 *
 * Always accessible crisis support resources
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { Phone, Heart, BookOpen, MapPin } from "lucide-react-native";
import { useActionPlans } from "../../../hooks/useActionPlans";
import { useSponsorRelationships } from "../../../hooks/useSponsor";
import { useProfile } from "../../../hooks/useProfile";
import { useMemo } from "react";

const CRISIS_NUMBERS = {
  US: {
    suicide: "988",
    substanceAbuse: "1-800-662-4357",
    emergency: "911",
  },
  AU: {
    suicide: "13 11 14",
    substanceAbuse: "1800 250 015",
    emergency: "000",
  },
};

export default function SupportCardScreen() {
  const router = useRouter();
  const { plans } = useActionPlans();
  const { relationships } = useSponsorRelationships();
  const { profile } = useProfile();
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [groundingStep, setGroundingStep] = useState(0);

  const activeSponsors = relationships.filter((r) => r.status === "active");

  // Infer region from timezone or default to US
  const region = useMemo<"US" | "AU">(() => {
    const timezone = profile?.timezone || "UTC";
    // Simple heuristic: Australian timezones contain "Australia" or "Sydney" or "Melbourne"
    if (timezone.includes("Australia") || timezone.includes("Sydney") || timezone.includes("Melbourne") || timezone.includes("Adelaide") || timezone.includes("Brisbane") || timezone.includes("Perth") || timezone.includes("Darwin")) {
      return "AU";
    }
    return "US"; // Default to US
  }, [profile?.timezone]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleBreathing = () => {
    if (!breathingActive) {
      setBreathingActive(true);
      startBreathingCycle();
    } else {
      setBreathingActive(false);
    }
  };

  const startBreathingCycle = () => {
    // 4-7-8 breathing: inhale 4, hold 7, exhale 8
    const phases = [
      { phase: "inhale" as const, duration: 4000 },
      { phase: "hold" as const, duration: 7000 },
      { phase: "exhale" as const, duration: 8000 },
    ];

    let currentIndex = 0;
    const cycle = () => {
      if (!breathingActive) return;
      setBreathingPhase(phases[currentIndex].phase);
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % phases.length;
        if (breathingActive) cycle();
      }, phases[currentIndex].duration);
    };
    cycle();
  };

  const groundingSteps = [
    "5 things you can see",
    "4 things you can touch",
    "3 things you can hear",
    "2 things you can smell",
    "1 thing you can taste",
  ];

  // Get sponsor phone from action plans' emergency contacts if available
  const sponsorPhone = useMemo(() => {
    if (activeSponsors.length === 0) return null;

    // Check action plans for sponsor phone in emergency contacts
    for (const plan of plans) {
      if (plan.emergency_contacts && Array.isArray(plan.emergency_contacts)) {
        const sponsorContact = plan.emergency_contacts.find(
          (contact: { name?: string; phone?: string }) =>
            contact.name?.toLowerCase().includes("sponsor") && contact.phone
        );
        if (sponsorContact?.phone) {
          return sponsorContact.phone;
        }
      }
    }
    return null;
  }, [plans, activeSponsors]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Support & Crisis Resources</Text>

        {/* Breathing Timer */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Breathing Exercise</Text>
          <Text style={styles.sectionDesc}>
            4-7-8 breathing pattern to help calm your nervous system
          </Text>
          <TouchableOpacity
            style={[
              styles.breathingCircle,
              breathingActive && styles.breathingCircleActive,
            ]}
            onPress={handleBreathing}
          >
            <Text style={styles.breathingText}>
              {breathingActive
                ? breathingPhase === "inhale"
                  ? "Breathe In"
                  : breathingPhase === "hold"
                  ? "Hold"
                  : "Breathe Out"
                : "Start"}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Grounding Exercise */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>5-4-3-2-1 Grounding</Text>
          <Text style={styles.sectionDesc}>
            Focus on your senses to ground yourself in the present moment
          </Text>
          {groundingStep < groundingSteps.length ? (
            <>
              <Text style={styles.groundingStep}>
                {groundingSteps[groundingStep]}
              </Text>
              <Button
                title={groundingStep === 0 ? "Start" : "Next"}
                onPress={() => setGroundingStep(groundingStep + 1)}
                fullWidth
                style={styles.groundingButton}
              />
            </>
          ) : (
            <>
              <Text style={styles.groundingComplete}>
                You've completed the grounding exercise. How do you feel?
              </Text>
              <Button
                title="Start Over"
                onPress={() => setGroundingStep(0)}
                variant="outline"
                fullWidth
                style={styles.groundingButton}
              />
            </>
          )}
        </Card>

        {/* Action Plans */}
        {plans.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Your Action Plans</Text>
            {plans.slice(0, 3).map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.actionPlanItem}
                onPress={() => router.push(`/(tabs)/action-plans/${plan.id}`)}
              >
                <BookOpen size={20} color="#007AFF" />
                <Text style={styles.actionPlanText}>{plan.title}</Text>
              </TouchableOpacity>
            ))}
            <Button
              title="View All Action Plans"
              onPress={() => router.push("/(tabs)/action-plans")}
              variant="outline"
              fullWidth
              style={styles.actionButton}
            />
          </Card>
        )}

        {/* Call Sponsor */}
        {activeSponsors.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Call Your Sponsor</Text>
            <Text style={styles.sectionDesc}>
              Reach out to your sponsor for support
            </Text>
            <Button
              title="Call Sponsor"
              onPress={() => {
                Alert.alert(
                  "Call Sponsor",
                  "Would you like to call your sponsor?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Call",
                      onPress: () => {
                        if (sponsorPhone) {
                          handleCall(sponsorPhone);
                        } else {
                          Alert.alert(
                            "Phone Not Available",
                            "Sponsor phone number not found. Please add your sponsor's phone to an Action Plan's emergency contacts, or contact them directly.",
                            [
                              {
                                text: "Add to Action Plan",
                                onPress: () => router.push("/(tabs)/action-plans"),
                              },
                              { text: "OK", style: "cancel" },
                            ]
                          );
                        }
                      },
                    },
                  ]
                );
              }}
              fullWidth
              style={styles.actionButton}
            />
          </Card>
        )}

        {/* Crisis Resources */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Crisis Resources</Text>
          <View style={styles.crisisButtons}>
            <TouchableOpacity
              style={styles.crisisButton}
              onPress={() => handleCall(CRISIS_NUMBERS[region].suicide)}
            >
              <Phone size={20} color="#fff" />
              <Text style={styles.crisisButtonText}>
                Suicide & Crisis Lifeline
              </Text>
              <Text style={styles.crisisNumber}>
                {CRISIS_NUMBERS[region].suicide}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.crisisButton}
              onPress={() => handleCall(CRISIS_NUMBERS[region].substanceAbuse)}
            >
              <Phone size={20} color="#fff" />
              <Text style={styles.crisisButtonText}>
                Substance Abuse Hotline
              </Text>
              <Text style={styles.crisisNumber}>
                {CRISIS_NUMBERS[region].substanceAbuse}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.crisisButton, styles.emergencyButton]}
              onPress={() => handleCall(CRISIS_NUMBERS[region].emergency)}
            >
              <Phone size={20} color="#fff" />
              <Text style={styles.crisisButtonText}>Emergency</Text>
              <Text style={styles.crisisNumber}>
                {CRISIS_NUMBERS[region].emergency}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="Quick Journal Entry"
            onPress={() => router.push("/(tabs)/journal/quick-craving")}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="Find Meetings"
            onPress={() => router.push("/(tabs)/meetings")}
            variant="outline"
            fullWidth
            style={styles.actionButton}
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#000",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  sectionDesc: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
    lineHeight: 20,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 16,
  },
  breathingCircleActive: {
    backgroundColor: "#34C759",
  },
  breathingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  groundingStep: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#000",
  },
  groundingButton: {
    marginTop: 8,
  },
  groundingComplete: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    color: "#000",
  },
  actionPlanItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  actionPlanText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  actionButton: {
    marginTop: 12,
  },
  crisisButtons: {
    gap: 12,
  },
  crisisButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  emergencyButton: {
    backgroundColor: "#FF3B30",
  },
  crisisButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  crisisNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  quickActions: {
    marginTop: 8,
    gap: 12,
  },
});

