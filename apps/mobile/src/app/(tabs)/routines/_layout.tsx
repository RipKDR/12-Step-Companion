/**
 * Routines Stack Layout
 */

import { Stack } from "expo-router";

export default function RoutinesLayout() {
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
          title: "Routines",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Routine",
        }}
      />
      <Stack.Screen
        name="[routineId]"
        options={{
          title: "Routine",
        }}
      />
    </Stack>
  );
}

