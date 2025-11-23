# Deep Dive Code Review - 12-Step Recovery Companion

**Date:** 2025-01-27  
**Reviewer:** AI Code Review  
**Scope:** Complete workspace analysis

---

## Executive Summary

This codebase is a well-structured monorepo for a privacy-first 12-step recovery companion app. The architecture follows best practices with Supabase, tRPC, Expo, and Next.js. However, there are several critical issues, incomplete implementations, and missing features that need attention before production deployment.

**Overall Assessment:** ⚠️ **Needs Work** - Core architecture is solid, but critical gaps exist in implementation, type safety, and production readiness.

---

## 🔴 CRITICAL ISSUES (Must Fix Before Production)

### 1. Missing TypeScript Database Types Package Export

**Location:** `packages/types/src/index.ts` (file doesn't exist)

**Issue:** The `@12-step-companion/types` package is referenced throughout the codebase but lacks a proper entry point. The `Database` type is imported from `@12-step-companion/types` but the package structure is incomplete.

**Impact:** 
- TypeScript compilation may fail
- IDE autocomplete won't work properly
- Type safety is compromised

**Fix:**
```typescript
// packages/types/src/index.ts
export type { Database } from './supabase';
export * from './supabase';
```

**Files Affected:**
- `packages/api/src/lib/supabase-server.ts`
- `packages/api/src/lib/supabase.ts`
- `apps/mobile/src/lib/supabase.ts`
- All files importing `Database` type

---

### 2. Missing Supabase Type Generation Script

**Location:** `package.json` - missing script

**Issue:** No script exists to generate TypeScript types from Supabase schema. The types in `packages/types/src/supabase.ts` appear to be manually created or outdated.

**Impact:**
- Types may not match actual database schema
- Schema changes won't be reflected in types
- Runtime errors possible

**Fix:**
```json
// Add to package.json scripts:
"db:types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/types/src/supabase.ts"
```

**Better Fix:** Use Supabase CLI with local schema:
```json
"db:types": "supabase gen types typescript --local > packages/types/src/supabase.ts"
```

---

### 3. Incomplete tRPC Context Implementation

**Location:** `packages/api/src/context.ts`

**Issue:** The context uses `authenticateFromToken` which defaults to `supabaseServer` (bypasses RLS) when no token is provided. This is a security risk.

**Current Code:**
```typescript
let supabase = supabaseServer; // Default to server client (bypasses RLS)
```

**Impact:**
- Unauthenticated requests bypass RLS policies
- Security vulnerability
- Data exposure risk

**Fix:**
```typescript
// packages/api/src/lib/auth-helper.ts
export async function authenticateFromToken(
  token: string | null | undefined
): Promise<AuthResult> {
  let userId: string | null = null;
  let supabase: ReturnType<typeof createUserClient> | null = null;

  if (!token) {
    // Return null client - force authentication
    return { userId: null, supabase: null };
  }

  try {
    const userClient = createUserClient(token);
    const { data: { user }, error } = await userClient.auth.getUser();

    if (!error && user) {
      userId = user.id;
      supabase = userClient;
    }
  } catch (error) {
    // Log but don't expose details
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to authenticate token");
    }
  }

  return { userId, supabase };
}
```

**Then update context to handle null supabase:**
```typescript
export async function createContext(opts: { req: Request; res: Response }) {
  const { req } = opts;
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  
  const { userId, supabase } = await authenticateFromToken(token);
  
  if (!supabase) {
    // Return minimal context for unauthenticated requests
    return {
      req,
      res: opts.res,
      userId: null,
      supabase: null,
      isAuthenticated: () => false,
    };
  }

  return {
    req,
    res: opts.res,
    userId,
    supabase,
    isAuthenticated: () => userId !== null,
  };
}
```

---

### 4. Missing Protected Procedure Enforcement

**Location:** `packages/api/src/trpc.ts`

**Issue:** `protectedProcedure` checks authentication but doesn't ensure `supabase` client exists. If `supabase` is null, procedures will fail at runtime.

**Impact:**
- Runtime errors when accessing `ctx.supabase` in protected procedures
- Poor error messages
- Type safety issues

**Fix:**
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

---

### 5. Rate Limiting Uses In-Memory Store

**Location:** `packages/api/src/middleware/rateLimit.ts`

**Issue:** Rate limiting uses in-memory store which won't work in multi-instance deployments (Railway, Vercel, etc.).

**Impact:**
- Rate limits reset on each instance
- Can't scale horizontally
- Production deployment issues

**Fix:** Add Redis-based rate limiting:
```typescript
// packages/api/src/middleware/rateLimit.ts
import { Redis } from 'ioredis';

const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : null;

async function checkRateLimitRedis(key: string, isAuthenticated: boolean) {
  if (!redis) {
    // Fallback to in-memory
    return checkRateLimit(key, isAuthenticated);
  }

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
```

---

### 6. Missing Error Boundaries in Mobile App

**Location:** `apps/mobile/src/app/_layout.tsx`

**Issue:** No React Error Boundary to catch and handle crashes gracefully.

**Impact:**
- App crashes show white screen
- Poor user experience
- No error recovery

**Fix:**
```typescript
// apps/mobile/src/components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <Text>Something went wrong.</Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

---

### 7. Missing Environment Variable Validation

**Location:** `server/env.ts`

**Issue:** Environment variables are checked but not validated. Missing required vars cause runtime errors instead of startup errors.

**Impact:**
- App starts but fails at runtime
- Poor developer experience
- Production deployment issues

**Fix:**
```typescript
// server/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(100),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(200),
  DATABASE_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
```

---

## 🟡 ARCHITECTURE ISSUES

### 8. Inconsistent Database Schema Location

**Location:** `shared/schema.ts` vs `server/migrations/`

**Issue:** Database schema is defined in `shared/schema.ts` (Drizzle ORM) but migrations are SQL files. There's no clear single source of truth.

**Impact:**
- Schema drift possible
- Migration generation unclear
- Confusion about which to update

**Recommendation:** 
- Use Drizzle as source of truth
- Generate migrations from Drizzle schema
- Keep SQL migrations for Supabase-specific features (RLS, functions)

---

### 9. Missing Supabase Client Type Export

**Location:** `packages/api/src/lib/supabase.ts` (doesn't exist)

**Issue:** The file `packages/api/src/lib/supabase.ts` is referenced but doesn't exist. Only `supabase-server.ts` exists.

**Impact:**
- Import errors
- Missing client-side Supabase client for API package

**Fix:** Create the file:
```typescript
// packages/api/src/lib/supabase.ts
/**
 * Client-side Supabase client (for use in API routes that need RLS)
 * 
 * IMPORTANT: This uses anon key and respects RLS policies
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@12-step-companion/types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

---

### 10. Missing Next.js tRPC Integration

**Location:** `apps/web/src/app/api/trpc/[trpc]/route.ts` (doesn't exist)

**Issue:** Next.js App Router needs a route handler for tRPC, but it's missing.

**Impact:**
- Web app can't make tRPC calls
- Sponsor portal won't work

**Fix:**
```typescript
// apps/web/src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@12-step-companion/api/routers/_app";
import { createContextNextJS } from "@12-step-companion/api/context-nextjs";

export const runtime = "nodejs";

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

### 11. Missing NextAuth Configuration

**Location:** `apps/web/src/app/api/auth/[...nextauth]/route.ts` (doesn't exist)

**Issue:** NextAuth route handler is missing for Next.js App Router.

**Impact:**
- Web app authentication won't work
- Sponsor portal inaccessible

**Fix:**
```typescript
// apps/web/src/app/api/auth/[...nextauth]/route.ts
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
    // Add providers here
  ],
  callbacks: {
    async session({ session, user }) {
      session.accessToken = user.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## 🟠 INCOMPLETE IMPLEMENTATIONS (TODOs)

### 12. Trigger Locations Hook Not Implemented

**Location:** `apps/mobile/src/hooks/useTriggerLocations.ts`

**Issue:** All methods are TODO stubs.

**Fix Required:**
- Implement `useTriggerLocations` hook
- Create tRPC router for trigger locations
- Add geofencing background task

---

### 13. Offline Sync Not Implemented

**Location:** `apps/mobile/src/hooks/useOfflineSync.ts`

**Issue:** Sync logic is empty.

**Fix Required:**
- Implement conflict resolution
- Queue mutations when offline
- Sync on connection restore

---

### 14. Data Export/Delete Not Implemented

**Location:** `apps/mobile/src/hooks/useDataExport.ts`, `apps/mobile/src/app/(tabs)/settings/data-export.tsx`

**Issue:** Export and delete functions are stubs.

**Fix Required:**
- Implement JSON export
- Implement PDF export (optional)
- Implement data deletion with confirmation
- Add tRPC endpoints

---

### 15. Achievement System Not Implemented

**Location:** `apps/mobile/src/hooks/useAchievements.ts`

**Issue:** All achievements show `unlocked: false`.

**Fix Required:**
- Implement achievement checking logic
- Add achievement unlock tracking
- Create celebration UI

---

### 16. Streak Calculations Incomplete

**Location:** `apps/mobile/src/hooks/useStreaks.ts`

**Issue:** Routine and meeting streaks are hardcoded to 0.

**Fix Required:**
- Calculate routine streaks from `routine_logs`
- Calculate meeting streaks from attendance
- Update streak calculations

---

### 17. Profile Avatar Upload Not Implemented

**Location:** `apps/mobile/src/app/(tabs)/profile/edit.tsx`

**Issue:** TODO comment for Supabase Storage upload.

**Fix Required:**
- Implement image picker
- Upload to Supabase Storage
- Update profile with avatar URL

---

### 18. Sponsor Phone Number Missing

**Location:** `apps/mobile/src/app/(tabs)/support/index.tsx`

**Issue:** Sponsor phone is hardcoded TODO.

**Fix Required:**
- Add phone to sponsor relationship
- Fetch from relationship data
- Display in support card

---

### 19. Region Configuration Missing

**Location:** `apps/mobile/src/app/(tabs)/support/index.tsx`

**Issue:** Region is hardcoded to "US".

**Fix Required:**
- Add region to user profile
- Fetch from profile
- Use for crisis resources

---

### 20. Web App Sponsor Dashboard Incomplete

**Location:** `apps/web/src/app/sponsor/[sponseeId]/page.tsx`

**Issue:** Shared data display is TODO.

**Fix Required:**
- Implement shared step entries display
- Implement shared daily entries display
- Implement shared action plans display
- Add filtering and search

---

## 🔵 CODE QUALITY ISSUES

### 21. Type Safety Issues

**Issues:**
- `any` types in several places
- Missing null checks
- Unsafe type assertions

**Examples:**
```typescript
// packages/api/src/context-nextjs.ts
req: req as any, // Should be properly typed
res: undefined as any, // Should be optional in Context type
```

**Fix:** Improve Context type to support both Express and Next.js:
```typescript
export type Context = {
  req: Request | NextRequest;
  res?: Response;
  userId: string | null;
  supabase: SupabaseClient<Database> | null;
  isAuthenticated: () => boolean;
};
```

---

### 22. Missing Input Validation

**Location:** Multiple tRPC routers

**Issue:** Some procedures don't validate input with Zod schemas.

**Fix:** Add Zod validation to all procedures:
```typescript
export const createStepEntry = protectedProcedure
  .input(z.object({
    stepId: z.string().uuid(),
    content: z.record(z.unknown()),
    version: z.number().int().positive(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Implementation
  });
```

---

### 23. Error Handling Inconsistencies

**Issue:** Some errors are logged, some aren't. Some return user-friendly messages, some don't.

**Fix:** Standardize error handling:
```typescript
// packages/api/src/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public userMessage?: string
  ) {
    super(message);
  }
}

export function handleError(error: unknown): TRPCError {
  if (error instanceof AppError) {
    return new TRPCError({
      code: error.code as any,
      message: error.userMessage || error.message,
    });
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}
```

---

### 24. Missing Logging Integration

**Location:** `packages/api/src/middleware/logger.ts`

**Issue:** Logging only uses console.log/error. No integration with Sentry or structured logging.

**Fix:**
```typescript
import * as Sentry from '@sentry/node';

function logRequest(entry: LogEntry) {
  if (entry.error) {
    Sentry.captureException(new Error(entry.error), {
      tags: { userId: entry.userId, path: entry.path },
      extra: entry,
    });
  } else if (process.env.NODE_ENV === 'production') {
    // Send to structured logging service
    console.log(JSON.stringify(entry));
  } else {
    console.log(message);
  }
}
```

---

## 🟢 MISSING FEATURES

### 25. Missing Test Suite

**Issue:** No tests found for critical business logic.

**Missing:**
- Unit tests for streaks calculation
- Unit tests for achievement unlocking
- Integration tests for tRPC routers
- E2E tests for critical flows

**Fix:** Add Vitest tests:
```typescript
// packages/api/src/routers/__tests__/streaks.test.ts
import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../streaks';

describe('calculateStreak', () => {
  it('calculates correct streak for consecutive days', () => {
    const entries = [
      { date: '2025-01-27' },
      { date: '2025-01-26' },
      { date: '2025-01-25' },
    ];
    expect(calculateStreak(entries)).toBe(3);
  });
});
```

---

### 26. Missing API Documentation

**Issue:** No OpenAPI/Swagger documentation for tRPC API.

**Fix:** Add tRPC OpenAPI plugin or generate docs:
```typescript
// packages/api/src/openapi.ts
import { generateOpenApiDocument } from 'trpc-openapi';
import { appRouter } from './routers/_app';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: '12-Step Recovery Companion API',
  version: '1.0.0',
  baseUrl: 'https://api.example.com',
});
```

---

### 27. Missing Health Check Endpoint

**Location:** `server/routes.ts`

**Issue:** No health check endpoint for monitoring.

**Fix:**
```typescript
app.get('/health', async (_req: Request, res: Response) => {
  const checks = {
    database: await checkDatabase(),
    supabase: await checkSupabase(),
    timestamp: new Date().toISOString(),
  };
  
  const healthy = Object.values(checks).every(c => c === true);
  res.status(healthy ? 200 : 503).json(checks);
});
```

---

### 28. Missing Migration Rollback Script

**Issue:** No way to rollback migrations if they fail.

**Fix:** Add rollback script:
```typescript
// scripts/rollback-migration.ts
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function rollback() {
  // Implementation
}
```

---

### 29. Missing Database Backup Script

**Issue:** No automated backup strategy.

**Fix:** Add backup script using Supabase CLI or pg_dump:
```bash
# scripts/backup-database.sh
pg_dump $DATABASE_URL > backups/backup-$(date +%Y%m%d).sql
```

---

### 30. Missing CI/CD Pipeline

**Issue:** No GitHub Actions or CI/CD configuration.

**Fix:** Add `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run type-check:all
      - run: pnpm run test
```

---

## 📋 CONFIGURATION ISSUES

### 31. Missing .npmrc Configuration

**Issue:** No `.npmrc` file for pnpm workspace configuration.

**Fix:** Create `.npmrc`:
```
node-linker=hoisted
shamefully-hoist=true
```

---

### 32. Missing .gitignore Entries

**Issue:** Some generated files may not be ignored.

**Fix:** Ensure `.gitignore` includes:
```
# Environment
.env
.env.local
.env.*.local

# Build outputs
dist/
.next/
.expo/
build/

# Database
*.db
*.sqlite

# Logs
*.log
```

---

### 33. Missing Docker Configuration for Development

**Issue:** No Docker Compose for local Supabase development.

**Fix:** Add `docker-compose.yml`:
```yaml
version: '3.8'
services:
  supabase:
    image: supabase/postgres:latest
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres
```

---

## 📚 DOCUMENTATION ISSUES

### 34. Missing API Reference Documentation

**Issue:** No comprehensive API documentation.

**Fix:** Generate from tRPC router types or add manual docs.

---

### 35. Missing Deployment Guide

**Issue:** Deployment docs exist but may be outdated.

**Fix:** Update with current deployment steps.

---

## 🎯 PRIORITY FIXES

### Immediate (Before Any Deployment):
1. ✅ Fix TypeScript types package export (#1)
2. ✅ Fix tRPC context security issue (#3)
3. ✅ Add environment variable validation (#7)
4. ✅ Add error boundaries (#6)
5. ✅ Fix Next.js tRPC integration (#10)

### High Priority (Before Production):
6. ✅ Implement missing tRPC routers (#12-19)
7. ✅ Add Redis rate limiting (#5)
8. ✅ Add test suite (#25)
9. ✅ Add health check endpoint (#27)
10. ✅ Fix type safety issues (#21)

### Medium Priority (Soon):
11. ✅ Add CI/CD pipeline (#30)
12. ✅ Add API documentation (#26)
13. ✅ Improve error handling (#23)
14. ✅ Add logging integration (#24)

### Low Priority (Nice to Have):
15. ✅ Add Docker Compose (#33)
16. ✅ Add migration rollback (#28)
17. ✅ Add database backup (#29)

---

## 📝 SUMMARY

**Total Issues Found:** 35  
**Critical:** 7  
**High Priority:** 10  
**Medium Priority:** 8  
**Low Priority:** 10

**Recommendation:** Address all critical and high-priority issues before production deployment. The codebase has a solid foundation but needs completion of core features and security hardening.

---

## 🔧 QUICK WINS (Can Fix Immediately)

1. Create `packages/types/src/index.ts` with proper exports
2. Add environment variable validation with Zod
3. Add error boundaries to mobile app
4. Create Next.js tRPC route handler
5. Add health check endpoint
6. Fix tRPC context to not default to server client

---

*End of Review*

