/**
 * Settings Stack Layout
 */

import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "",
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#007AFF",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: "Privacy",
        }}
      />
      <Stack.Screen
        name="data-export"
        options={{
          title: "Data Export",
        }}
      />
      <Stack.Screen
        name="trigger-locations"
        options={{
          title: "Trigger Locations",
        }}
      />
      <Stack.Screen
        name="sync"
        options={{
          title: "Sync Status",
        }}
      />
    </Stack>
  );
}

