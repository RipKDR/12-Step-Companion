/**
 * Root Layout - Expo Router
 * 
 * Sets up navigation and providers
 */

import { Stack } from "expo-router";
import { TRPCProvider } from "../../lib/trpc-provider";
import { initDatabase } from "../../lib/sqlite";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Initialize SQLite database
    initDatabase()
      .then(() => setDbReady(true))
      .catch((error) => {
        console.error("Failed to initialize database:", error);
        setDbReady(true); // Continue anyway
      });
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TRPCProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </TRPCProvider>
  );
}

