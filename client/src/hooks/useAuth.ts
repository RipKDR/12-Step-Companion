// Authentication hook - standalone mode (no auth required)
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // In standalone mode, we still call the endpoint but treat null as "authenticated"
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Return null on error to treat as "auth disabled, allow access"
    throwOnError: false,
  });

  // In standalone mode: null user means auth is disabled, so we're "authenticated"
  // This allows the app to work without any authentication
  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: true, // Always authenticated in standalone mode
  };
}
