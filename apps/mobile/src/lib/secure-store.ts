/**
 * Secure Storage Wrapper
 * 
 * Stores sensitive data (tokens, keys) securely
 */

import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "supabase_access_token";
const REFRESH_TOKEN_KEY = "supabase_refresh_token";

/**
 * Store access token
 */
export async function storeAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Store refresh token
 */
export async function storeRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

/**
 * Clear all tokens
 */
export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

