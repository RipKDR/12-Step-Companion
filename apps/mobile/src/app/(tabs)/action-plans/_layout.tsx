/**
 * Action Plans Stack Layout
 */

import { Stack } from "expo-router";

export default function ActionPlansLayout() {
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
          title: "Action Plans",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Action Plan",
        }}
      />
      <Stack.Screen
        name="[planId]"
        options={{
          title: "Action Plan",
        }}
      />
    </Stack>
  );
}

