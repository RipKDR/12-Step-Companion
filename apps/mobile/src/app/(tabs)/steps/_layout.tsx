/**
 * Steps Stack Layout
 *
 * Handles nested navigation for step detail screens
 */

import { Stack } from "expo-router";

export default function StepsLayout() {
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
          headerShown: false, // Hide header for the list view (handled by tabs)
        }}
      />
      <Stack.Screen
        name="[stepId]"
        options={{
          title: "Step Work",
        }}
      />
      <Stack.Screen
        name="[stepId]/versions"
        options={{
          title: "Version History",
        }}
      />
    </Stack>
  );
}

