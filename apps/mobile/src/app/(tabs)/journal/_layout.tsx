/**
 * Journal Stack Layout
 *
 * Handles nested navigation for journal screens
 */

import { Stack } from "expo-router";

export default function JournalLayout() {
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
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[date]"
        options={{
          title: "Daily Entry",
        }}
      />
      <Stack.Screen
        name="quick-craving"
        options={{
          title: "Quick Craving Log",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

