/**
 * Sponsor Connection Hub
 */

import { useState, useEffect } from "react";
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
import {
  useSponsorRelationships,
  useGenerateSponsorCode,
  useAcceptSponsorRelationship,
} from "../../../hooks/useSponsor";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useProfile } from "../../../hooks/useProfile";

export default function SponsorConnectionScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { relationships, isLoading } = useSponsorRelationships();
  const generateCodeMutation = useGenerateSponsorCode();
  const acceptMutation = useAcceptSponsorRelationship();

  // Get current user ID from Supabase auth
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { supabase } = await import("../../../lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  const activeRelationships = relationships.filter((r) => r.status === "active");
  const pendingAsSponsee = relationships.filter(
    (r) => r.status === "pending" && r.sponsee_id === userId
  );
  const pendingAsSponsor = relationships.filter(
    (r) => r.status === "pending" && r.sponsor_id === userId
  );

  const handleGenerateCode = async () => {
    try {
      const result = await generateCodeMutation.mutateAsync();
      router.push({
        pathname: "/(tabs)/sponsor/generate-code",
        params: { code: result.code, expiresAt: result.expiresAt },
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to generate code"
      );
    }
  };

  const handleAccept = async (relationshipId: string) => {
    try {
      await acceptMutation.mutateAsync({ relationshipId });
      Alert.alert("Success", "Relationship accepted");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to accept relationship"
      );
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Active Relationships */}
        {activeRelationships.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Relationships</Text>
            {activeRelationships.map((rel) => (
              <Card key={rel.id} style={styles.relationshipCard}>
                <View style={styles.relationshipHeader}>
                  <Text style={styles.relationshipText}>
                    {rel.sponsor_id === userId ? "Sponsee" : "Sponsor"}
                  </Text>
                  <Badge label="Active" variant="success" size="small" />
                </View>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => router.push(`/(tabs)/sponsor/relationships`)}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {/* Pending Requests (as Sponsor) */}
        {pendingAsSponsor.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            {pendingAsSponsor.map((rel) => (
              <Card key={rel.id} style={styles.relationshipCard}>
                <Text style={styles.relationshipText}>
                  Someone wants to connect with you as their sponsor
                </Text>
                <View style={styles.pendingActions}>
                  <Button
                    title="Accept"
                    onPress={() => handleAccept(rel.id)}
                    size="small"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Decline"
                    onPress={() => {}}
                    variant="outline"
                    size="small"
                    style={styles.actionButton}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Generate Sponsor Code"
            onPress={handleGenerateCode}
            loading={generateCodeMutation.isPending}
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="Enter Sponsor Code"
            onPress={() => router.push("/(tabs)/sponsor/enter-code")}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="Manage Relationships"
            onPress={() => router.push("/(tabs)/sponsor/relationships")}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />
          {activeRelationships.some((r) => r.sponsor_id === userId) && (
            <Button
              title="View Sponsee Content"
              onPress={() => router.push("/(tabs)/sponsor/dashboard")}
              variant="primary"
              fullWidth
              style={styles.actionButton}
            />
          )}
        </View>

        {activeRelationships.length === 0 && pendingAsSponsor.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Connect with your sponsor to share your recovery journey
            </Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  relationshipCard: {
    marginBottom: 12,
  },
  relationshipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  relationshipText: {
    fontSize: 16,
    color: "#000",
  },
  viewButton: {
    marginTop: 8,
    padding: 8,
  },
  viewButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  pendingActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    marginBottom: 12,
  },
  actions: {
    marginTop: 24,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
});

