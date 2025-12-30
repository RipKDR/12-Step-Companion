/**
 * Privacy Settings Screen
 */

import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { useSponsorRelationships } from "../../../hooks/useSponsor";
import { useRouter } from "expo-router";

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { relationships } = useSponsorRelationships();
  const [dataSync, setDataSync] = useState(true);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);

  const activeRelationships = relationships.filter((r) => r.status === "active");

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Sponsor Sharing</Text>
          <Text style={styles.sectionDesc}>
            {activeRelationships.length > 0
              ? `You have ${activeRelationships.length} active sponsor relationship(s)`
              : "No active sponsor relationships"}
          </Text>
          <Button
            title="Manage Relationships"
            onPress={() => router.push("/(tabs)/sponsor/relationships")}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />
        </Card>

        <Card style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>Data Sync</Text>
              <Text style={styles.switchHint}>
                Sync your data to the cloud for backup and access across devices
              </Text>
            </View>
            <Switch
              value={dataSync}
              onValueChange={setDataSync}
              trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>Analytics (Optional)</Text>
              <Text style={styles.switchHint}>
                Help improve the app by sharing anonymous usage data. No personal information is collected.
              </Text>
            </View>
            <Switch
              value={analyticsOptIn}
              onValueChange={setAnalyticsOptIn}
              trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.sectionDesc}>
            Your data is stored securely and never shared without your explicit permission.
          </Text>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>View Privacy Policy</Text>
          </TouchableOpacity>
        </Card>
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
    marginBottom: 12,
    lineHeight: 20,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  switchHint: {
    fontSize: 14,
    color: "#8E8E93",
  },
  actionButton: {
    marginTop: 12,
  },
  linkButton: {
    marginTop: 8,
    padding: 8,
  },
  linkText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});

