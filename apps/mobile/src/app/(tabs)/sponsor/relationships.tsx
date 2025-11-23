/**
 * Manage Relationships Screen
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
  useRevokeSponsorRelationship,
} from "../../../hooks/useSponsor";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { format } from "date-fns";

export default function RelationshipsScreen() {
  const router = useRouter();
  const { relationships, isLoading } = useSponsorRelationships();
  const revokeMutation = useRevokeSponsorRelationship();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { supabase } = await import("../../../lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  const handleRevoke = (relationshipId: string) => {
    Alert.alert(
      "Revoke Relationship",
      "Are you sure you want to revoke this relationship?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            try {
              await revokeMutation.mutateAsync({ relationshipId });
              Alert.alert("Success", "Relationship revoked");
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to revoke relationship"
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {relationships.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No relationships</Text>
          </View>
        ) : (
          relationships.map((rel) => {
            const isSponsor = rel.sponsor_id === userId;
            const statusColors = {
              active: "success",
              pending: "warning",
              revoked: "default",
            } as const;

            return (
              <Card key={rel.id} style={styles.relationshipCard}>
                <View style={styles.relationshipHeader}>
                  <View>
                    <Text style={styles.relationshipType}>
                      {isSponsor ? "You are the Sponsor" : "You are the Sponsee"}
                    </Text>
                    <Text style={styles.relationshipDate}>
                      Created: {format(new Date(rel.created_at), "MMM d, yyyy")}
                    </Text>
                  </View>
                  <Badge
                    label={rel.status}
                    variant={statusColors[rel.status as keyof typeof statusColors] || "default"}
                    size="small"
                  />
                </View>
                {rel.status === "active" && (
                  <TouchableOpacity
                    style={styles.revokeButton}
                    onPress={() => handleRevoke(rel.id)}
                  >
                    <Text style={styles.revokeButtonText}>Revoke</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })
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
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  relationshipCard: {
    marginBottom: 16,
  },
  relationshipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  relationshipType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  relationshipDate: {
    fontSize: 14,
    color: "#8E8E93",
  },
  revokeButton: {
    marginTop: 12,
    padding: 8,
    alignItems: "center",
  },
  revokeButtonText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "600",
  },
});

