/**
 * Meetings Stack Layout
 */

import { Stack } from "expo-router";

export default function MeetingsLayout() {
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
        name="[meetingId]"
        options={{
          title: "Meeting Details",
        }}
      />
      <Stack.Screen
        name="map"
        options={{
          title: "Map View",
        }}
      />
    </Stack>
  );
}

