/**
 * Action Plan Detail Screen
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useActionPlan, useUpdateActionPlan, useDeleteActionPlan } from "../../../hooks/useActionPlans";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/Card";
import { Phone } from "lucide-react-native";
import { Linking } from "react-native";

export default function ActionPlanDetailScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { plan, isLoading } = useActionPlan(planId || null);
  const updateMutation = useUpdateActionPlan();
  const deleteMutation = useDeleteActionPlan();

  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (plan) {
      setIsShared(plan.is_shared_with_sponsor || false);
    }
  }, [plan]);

  const handleToggleShare = async () => {
    try {
      await updateMutation.mutateAsync({
        id: planId!,
        isSharedWithSponsor: !isShared,
      });
      setIsShared(!isShared);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update plan"
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Action Plan",
      `Are you sure you want to delete "${plan?.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({ id: planId! });
              router.back();
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

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (isLoading || !plan) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const ifThenRules = (plan.if_then as any[]) || [];
  const checklist = (plan.checklist as string[]) || [];
  const emergencyContacts = (plan.emergency_contacts as any[]) || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{plan.title}</Text>
          {plan.is_shared_with_sponsor && (
            <Badge label="Shared" variant="info" size="small" />
          )}
        </View>

        {plan.situation && (
          <Card style={styles.situationCard}>
            <Text style={styles.situationLabel}>Situation</Text>
            <Text style={styles.situationText}>{plan.situation}</Text>
          </Card>
        )}

        {/* If-Then Rules */}
        {ifThenRules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>If-Then Rules</Text>
            {ifThenRules.map((rule, index) => (
              <Card key={index} style={styles.ruleCard}>
                <Text style={styles.ruleIf}>If: {rule.if}</Text>
                <Text style={styles.ruleThen}>Then: {rule.then}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Checklist */}
        {checklist.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Checklist</Text>
            {checklist.map((item, index) => (
              <View key={index} style={styles.checklistItem}>
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Emergency Contacts */}
        {emergencyContacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            {emergencyContacts.map((contact, index) => (
              <Card key={index} style={styles.contactCard}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <TouchableOpacity
                  style={styles.phoneButton}
                  onPress={() => handleCall(contact.phone)}
                >
                  <Phone size={16} color="#007AFF" />
                  <Text style={styles.phoneText}>{contact.phone}</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {/* Share Toggle */}
        <View style={styles.shareSection}>
          <View style={styles.shareRow}>
            <Text style={styles.shareLabel}>Share with sponsor</Text>
            <Switch
              value={isShared}
              onValueChange={handleToggleShare}
              trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
              thumbColor="#fff"
              disabled={updateMutation.isPending}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Edit"
            onPress={() => router.push(`/(tabs)/action-plans/${planId}/edit`)}
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
  situationCard: {
    marginBottom: 16,
  },
  situationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
  },
  situationText: {
    fontSize: 16,
    color: "#000",
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  ruleCard: {
    marginBottom: 12,
  },
  ruleIf: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  ruleThen: {
    fontSize: 16,
    color: "#34C759",
  },
  checklistItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  checklistText: {
    fontSize: 16,
    color: "#000",
  },
  contactCard: {
    marginBottom: 12,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phoneText: {
    fontSize: 16,
    color: "#007AFF",
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
  },
  shareLabel: {
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
});

