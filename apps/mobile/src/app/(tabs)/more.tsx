/**
 * More Tab - Mobile App
 *
 * Settings and additional features
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useProfile } from "../../hooks/useProfile";
import { supabase } from "../../lib/supabase";
import { clearTokens } from "../../lib/secure-store";

export default function MoreScreen() {
  const router = useRouter();
  const { profile } = useProfile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await clearTokens();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          {profile && (
            <View>
              {profile.handle && (
                <Text style={styles.profileText}>Handle: {profile.handle}</Text>
              )}
              {profile.program && (
                <Text style={styles.profileText}>Program: {profile.program}</Text>
              )}
              {profile.clean_date && (
                <Text style={styles.profileText}>
                  Clean Date: {new Date(profile.clean_date).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(tabs)/settings/notifications")}
          >
            <Text style={styles.settingText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(tabs)/settings/privacy")}
          >
            <Text style={styles.settingText}>Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(tabs)/settings/data-export")}
          >
            <Text style={styles.settingText}>Data Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(tabs)/settings/trigger-locations")}
          >
            <Text style={styles.settingText}>Trigger Locations</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actions</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(tabs)/sponsor")}
          >
            <Text style={styles.settingText}>Sponsor Connection</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(tabs)/action-plans")}
          >
            <Text style={styles.settingText}>Action Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(tabs)/routines")}
          >
            <Text style={styles.settingText}>Routines</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(tabs)/support")}
          >
            <Text style={styles.settingText}>Support Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(tabs)/streaks")}
          >
            <Text style={styles.settingText}>Streaks & Achievements</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  profileText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#000",
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingText: {
    fontSize: 16,
    color: "#000",
  },
  logoutButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

