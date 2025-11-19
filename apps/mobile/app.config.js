/**
 * Expo App Config
 * Dynamically loads environment variables
 */

export default {
  expo: {
    name: "12-Step Recovery Companion",
    slug: "12-step-companion",
    version: "1.0.0",
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000",
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};

