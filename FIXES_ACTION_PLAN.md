# Action Plan: Critical Fixes for 12-Step Recovery Companion

This document provides step-by-step fixes for the most critical issues identified in the code review.

---

## 🔴 PHASE 1: Critical Security & Type Safety (Do First)

### Fix 1: Create Types Package Entry Point

**File:** `packages/types/src/index.ts`

```typescript
/**
 * @12-step-companion/types
 * 
 * Shared TypeScript types for the 12-Step Recovery Companion
 */

export type { Database } from './supabase';
export * from './supabase';
```

**Action:** Create this file immediately.

---

### Fix 2: Fix tRPC Context Security Issue

**File:** `packages/api/src/lib/auth-helper.ts`

**Replace:**
```typescript
export async function authenticateFromToken(
  token: string | null | undefined
): Promise<AuthResult> {
  let userId: string | null = null;
  let supabase = supabaseServer; // ❌ SECURITY ISSUE: Defaults to server client

  if (token) {
    // ... existing code
  }

  return { userId, supabase };
}
```

**With:**
```typescript
export async function authenticateFromToken(
  token: string | null | undefined
): Promise<AuthResult> {
  let userId: string | null = null;
  let supabase: ReturnType<typeof createUserClient> | null = null;

  if (!token) {
    // Return null - force authentication
    return { userId: null, supabase: null };
  }

  try {
    const userClient = createUserClient(token);
    const {
      data: { user },
      error,
    } = await userClient.auth.getUser();

    if (!error && user) {
      userId = user.id;
      supabase = userClient;
    }
  } catch (error) {
    // Log but don't expose details
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to authenticate token:", error instanceof Error ? error.message : String(error));
    }
  }

  return { userId, supabase };
}
```

**File:** `packages/api/src/context.ts`

**Update:**
```typescript
export async function createContext(opts: { req: Request; res: Response }) {
  const { req } = opts;
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  const { userId, supabase } = await authenticateFromToken(token);

  return {
    req,
    res: opts.res,
    userId,
    supabase, // Can be null for unauthenticated requests
    isAuthenticated: () => userId !== null && supabase !== null,
  };
}
```

**File:** `packages/api/src/trpc.ts`

**Update protectedProcedure:**
```typescript
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.isAuthenticated() || !ctx.supabase) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId!,
      supabase: ctx.supabase, // Now guaranteed to be non-null
    },
  });
});
```

**Update Context type:**
```typescript
// packages/api/src/context.ts
export type Context = {
  req: Request;
  res: Response;
  userId: string | null;
  supabase: ReturnType<typeof createUserClient> | null;
  isAuthenticated: () => boolean;
};
```

---

### Fix 3: Add Environment Variable Validation

**File:** `server/env.ts`

**Replace entire file:**
```typescript
/**
 * Environment Variable Validation
 * 
 * Validates and exports environment variables with proper types
 */

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),
  
  // Supabase (Required)
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(100, "SUPABASE_ANON_KEY appears invalid"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(200, "SUPABASE_SERVICE_ROLE_KEY appears invalid"),
  
  // Database (Optional - for direct Postgres access)
  DATABASE_URL: z.string().url().optional(),
  
  // Optional Services
  GEMINI_API_KEY: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  
  // Next.js (Optional - for web app)
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Observability (Optional)
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  
  // Feature Flags
  ENABLE_GEOFENCING: z.string().transform(val => val === "true").optional(),
  ENABLE_SPONSOR_SHARING: z.string().transform(val => val === "true").optional(),
});

try {
  export const env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment variable validation failed:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Verify Supabase URL format
if (env.SUPABASE_URL && !env.SUPABASE_URL.includes("supabase.co")) {
  console.warn("⚠️  SUPABASE_URL doesn't look like a Supabase URL");
}

// Verify service role key format (should be JWT)
if (env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_ROLE_KEY.startsWith("eyJ")) {
  console.warn("⚠️  SUPABASE_SERVICE_ROLE_KEY doesn't look like a JWT token");
}
```

**Update imports in files that use env vars:**
```typescript
// server/index.ts
import { env } from "./env";

const port = parseInt(env.PORT, 10);
```

---

### Fix 4: Add Error Boundary to Mobile App

**File:** `apps/mobile/src/components/ErrorBoundary.tsx` (NEW)

```typescript
/**
 * Error Boundary for React Native
 * 
 * Catches React errors and displays a fallback UI
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Sentry from "@sentry/react-native";

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
    
    // Send to Sentry if configured
    if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <TouchableOpacity style={styles.button} onPress={this.resetError}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
```

**File:** `apps/mobile/src/app/_layout.tsx`

**Update:**
```typescript
import { ErrorBoundary } from "../../components/ErrorBoundary";

export default function RootLayout() {
  // ... existing code ...

  return (
    <ErrorBoundary>
      <TRPCProvider>
        <SyncManager />
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </TRPCProvider>
    </ErrorBoundary>
  );
}
```

---

### Fix 5: Create Next.js tRPC Route Handler

**File:** `apps/web/src/app/api/trpc/[trpc]/route.ts` (NEW)

```typescript
/**
 * tRPC Route Handler for Next.js App Router
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@12-step-companion/api/routers/_app";
import { createContextNextJS } from "@12-step-companion/api/context-nextjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContextNextJS({ req }),
  });
}

export async function POST(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContextNextJS({ req }),
  });
}
```

---

### Fix 6: Create NextAuth Route Handler

**File:** `apps/web/src/app/api/auth/[...nextauth]/route.ts` (NEW)

```typescript
/**
 * NextAuth Route Handler for Next.js App Router
 */

import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions = {
  adapter: SupabaseAdapter(supabase),
  providers: [
    // Add email provider or others as needed
  ],
  callbacks: {
    async session({ session, user }) {
      // Add access token to session
      (session as any).accessToken = (user as any).accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

---

## 🟡 PHASE 2: Missing Implementations (High Priority)

### Fix 7: Implement Trigger Locations Router

**File:** `packages/api/src/routers/triggerLocations.ts` (NEW)

```typescript
/**
 * Trigger Locations Router
 * 
 * Manages geofenced trigger locations
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { eq, and } from "drizzle-orm";
import { triggerLocations } from "@12-step-companion/types";

const createTriggerLocationSchema = z.object({
  label: z.string().min(1).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusM: z.number().int().min(50).max(10000),
  onEnter: z.array(z.string()).default([]),
  onExit: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

const updateTriggerLocationSchema = createTriggerLocationSchema.partial().extend({
  id: z.string().uuid(),
});

export const triggerLocationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase!
      .from("trigger_locations")
      .select("*")
      .eq("user_id", ctx.userId!)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase!
        .from("trigger_locations")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.userId!)
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  create: protectedProcedure
    .input(createTriggerLocationSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase!
        .from("trigger_locations")
        .insert({
          user_id: ctx.userId!,
          ...input,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  update: protectedProcedure
    .input(updateTriggerLocationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      
      const { data, error } = await ctx.supabase!
        .from("trigger_locations")
        .update(updates)
        .eq("id", id)
        .eq("user_id", ctx.userId!)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase!
        .from("trigger_locations")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.userId!);

      if (error) throw new Error(error.message);
      return { success: true };
    }),
});
```

**Update:** `packages/api/src/routers/_app.ts`

```typescript
import { triggerLocationsRouter } from "./triggerLocations";

export const appRouter = router({
  // ... existing routers
  triggerLocations: triggerLocationsRouter,
});
```

---

### Fix 8: Implement Data Export Router

**File:** `packages/api/src/routers/dataExport.ts` (NEW)

```typescript
/**
 * Data Export Router
 * 
 * Handles data export and deletion requests
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const dataExportRouter = router({
  export: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId!;
    const supabase = ctx.supabase!;

    // Fetch all user data
    const [profiles, stepEntries, dailyEntries, actionPlans, routines, streaks] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("step_entries").select("*").eq("user_id", userId),
      supabase.from("daily_entries").select("*").eq("user_id", userId),
      supabase.from("action_plans").select("*").eq("user_id", userId),
      supabase.from("routines").select("*").eq("user_id", userId),
      supabase.from("sobriety_streaks").select("*").eq("user_id", userId),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      profile: profiles.data,
      stepEntries: stepEntries.data,
      dailyEntries: dailyEntries.data,
      actionPlans: actionPlans.data,
      routines: routines.data,
      streaks: streaks.data,
    };
  }),

  delete: protectedProcedure
    .input(z.object({ confirm: z.literal(true) }))
    .mutation(async ({ ctx, input }) => {
      if (!input.confirm) {
        throw new Error("Deletion must be confirmed");
      }

      const userId = ctx.userId!;
      const supabase = ctx.supabase!;

      // Delete all user data (CASCADE will handle related records)
      const tables = [
        "step_entries",
        "daily_entries",
        "craving_events",
        "action_plans",
        "routines",
        "routine_logs",
        "sobriety_streaks",
        "trigger_locations",
        "messages",
        "notification_tokens",
        "risk_signals",
        "profiles",
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("user_id", userId);

        if (error) {
          console.error(`Failed to delete from ${table}:`, error);
        }
      }

      // Delete auth user (requires service role)
      // This should be done via a server-side function or admin API

      return { success: true };
    }),
});
```

---

### Fix 9: Add Health Check Endpoint

**File:** `server/routes.ts`

**Add:**
```typescript
// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  const checks: Record<string, boolean | string> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  // Check Supabase connection
  try {
    const { supabaseAnon } = await import("./lib/supabase");
    const { error } = await supabaseAnon.from("profiles").select("id").limit(1);
    checks.supabase = !error;
  } catch (error) {
    checks.supabase = false;
  }

  // Check database (if DATABASE_URL is set)
  if (process.env.DATABASE_URL) {
    try {
      // Simple connection check
      checks.database = true; // Add actual check if needed
    } catch (error) {
      checks.database = false;
    }
  }

  const healthy = Object.values(checks).every(
    (v) => v === true || typeof v === "string"
  );

  res.status(healthy ? 200 : 503).json(checks);
});
```

---

## 🟢 PHASE 3: Improvements (Medium Priority)

### Fix 10: Add Redis Rate Limiting (Optional)

**Install:** `pnpm add ioredis @types/ioredis`

**File:** `packages/api/src/middleware/rateLimit.ts`

**Update:**
```typescript
import Redis from "ioredis";

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

// Use Redis if available, fallback to in-memory
async function checkRateLimit(key: string, isAuthenticated: boolean) {
  if (redis) {
    // Redis implementation
    const limits = isAuthenticated
      ? RATE_LIMITS.authenticated
      : RATE_LIMITS.unauthenticated;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, Math.floor(limits.windowMs / 1000));
    }

    const ttl = await redis.ttl(key);
    return {
      allowed: count <= limits.max,
      remaining: Math.max(0, limits.max - count),
      resetAt: Date.now() + (ttl * 1000),
    };
  }

  // Fallback to in-memory
  return checkRateLimitMemory(key, isAuthenticated);
}
```

---

## 📋 Testing Checklist

After implementing fixes, verify:

- [ ] TypeScript compiles without errors (`pnpm run type-check:all`)
- [ ] Server starts without errors (`pnpm run dev`)
- [ ] Mobile app builds (`pnpm run mobile:android`)
- [ ] Web app builds (`pnpm run build:web`)
- [ ] Health check endpoint returns 200 (`curl http://localhost:5000/health`)
- [ ] tRPC calls work from mobile app
- [ ] tRPC calls work from web app
- [ ] Authentication works end-to-end
- [ ] Error boundary catches React errors
- [ ] Environment validation catches missing vars

---

## 🚀 Next Steps

1. Implement Phase 1 fixes (Critical)
2. Test thoroughly
3. Implement Phase 2 fixes (High Priority)
4. Add tests for new functionality
5. Deploy to staging
6. Implement Phase 3 improvements

---

*Last Updated: 2025-01-27*

