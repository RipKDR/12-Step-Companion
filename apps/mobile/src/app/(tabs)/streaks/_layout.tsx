/**
 * Streaks Stack Layout
 */

import { Stack } from "expo-router";

export default function StreaksLayout() {
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
          title: "Streaks & Achievements",
        }}
      />
    </Stack>
  );
}

