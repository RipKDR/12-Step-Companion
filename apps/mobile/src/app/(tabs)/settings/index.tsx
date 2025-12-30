/**
 * Settings Hub
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "../../../components/Card";
import {
  Bell,
  Lock,
  Download,
  MapPin,
  User,
  Info,
  RefreshCw,
} from "lucide-react-native";
import { useProfile } from "../../../hooks/useProfile";

export default function SettingsScreen() {
  const router = useRouter();
  const { profile } = useProfile();

  const settingsItems = [
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage reminders and alerts",
      route: "/(tabs)/settings/notifications",
    },
    {
      icon: Lock,
      title: "Privacy",
      description: "Control sharing and data access",
      route: "/(tabs)/settings/privacy",
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Export or delete your data",
      route: "/(tabs)/settings/data-export",
    },
    {
      icon: MapPin,
      title: "Trigger Locations",
      description: "Manage geofenced triggers",
      route: "/(tabs)/settings/trigger-locations",
    },
    {
      icon: RefreshCw,
      title: "Sync Status",
      description: "View offline sync status and queued changes",
      route: "/(tabs)/settings/sync",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View>
              <Text style={styles.profileName}>
                {profile?.handle || "User"}
              </Text>
              <Text style={styles.profileEmail}>{profile?.program || "No program set"}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile/edit")}
            >
              <User size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Settings Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.title}
                style={styles.settingItem}
                onPress={() => router.push(item.route as any)}
              >
                <Icon size={24} color="#007AFF" />
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* About */}
        <Card style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <Info size={20} color="#8E8E93" />
            <Text style={styles.aboutTitle}>About</Text>
          </View>
          <Text style={styles.aboutText}>12-Step Recovery Companion</Text>
          <Text style={styles.aboutText}>Version 1.0.0</Text>
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
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  profileEmail: {
    fontSize: 14,
    color: "#8E8E93",
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
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  settingDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  aboutCard: {
    marginBottom: 24,
  },
  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  aboutText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
});

