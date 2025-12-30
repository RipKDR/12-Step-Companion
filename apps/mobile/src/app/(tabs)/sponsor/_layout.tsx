/**
 * Sponsor Stack Layout
 */

import { Stack } from "expo-router";

export default function SponsorLayout() {
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
          title: "Sponsor Connection",
        }}
      />
      <Stack.Screen
        name="generate-code"
        options={{
          title: "Generate Code",
        }}
      />
      <Stack.Screen
        name="enter-code"
        options={{
          title: "Enter Code",
        }}
      />
      <Stack.Screen
        name="relationships"
        options={{
          title: "Relationships",
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          title: "Sponsor Dashboard",
        }}
      />
    </Stack>
  );
}

