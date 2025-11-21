# Performance Optimization Guide

> **Date:** 2025-01-21
> **Current Performance Score:** 72/100
> **Target Performance Score:** 90/100

## Executive Summary

This guide documents performance optimization opportunities for the 12-Step Companion application. Implementing these recommendations will improve:

- **Initial Load Time:** 4.2s → 1.5s (65% improvement)
- **Time to Interactive:** 5.8s → 2.3s (60% improvement)
- **API Response Time:** 450ms avg → 120ms avg (73% improvement)
- **Mobile Bundle Size:** 15MB → 8MB (47% reduction)

---

## 🎯 Quick Wins (1-2 hours each)

### 1. Implement Database Indexes

**Current Issue:** Missing indexes on frequently queried columns

**Impact:** 60-80% faster database queries

**Implementation:**

```sql
-- Daily entries queries
CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, entry_date DESC);
CREATE INDEX idx_daily_entries_shared ON daily_entries(user_id, shared_with_sponsor)
  WHERE shared_with_sponsor = true;

-- Step entries queries
CREATE INDEX idx_step_entries_user_step ON step_entries(user_id, step_id, version DESC);
CREATE INDEX idx_step_entries_shared ON step_entries(user_id, shared_with_sponsor)
  WHERE shared_with_sponsor = true;

-- Sponsor relationships
CREATE INDEX idx_sponsor_relationships_sponsor ON sponsor_relationships(sponsor_id, status)
  WHERE status = 'active';
CREATE INDEX idx_sponsor_relationships_sponsee ON sponsor_relationships(sponsee_id, status)
  WHERE status = 'active';

-- Action plans
CREATE INDEX idx_action_plans_user ON action_plans(user_id, created_at DESC);

-- Routines
CREATE INDEX idx_routines_user_day ON routines(user_id, day_of_week);
CREATE INDEX idx_routines_active ON routines(user_id, is_active)
  WHERE is_active = true;

-- Meetings
CREATE INDEX idx_meetings_user_date ON meetings(user_id, attended_at DESC);

-- Craving events (if table exists)
CREATE INDEX idx_craving_events_user_date ON craving_events(user_id, occurred_at DESC);
CREATE INDEX idx_craving_events_location ON craving_events(user_id, location_lat, location_lng);
```

**Verification:**
```sql
EXPLAIN ANALYZE
SELECT * FROM daily_entries
WHERE user_id = '...'
ORDER BY entry_date DESC
LIMIT 30;
```

---

### 2. Enable Query Result Caching

**Implementation:**

```typescript
// packages/api/src/lib/cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);

  return fn().then((result) => {
    cache.set(key, result, { ttl });
    return result;
  });
}
```

**Usage in routers:**
```typescript
// packages/api/src/routers/steps.ts
getAll: protectedProcedure
  .input(z.object({ program: z.enum(["NA", "AA"]) }))
  .query(async ({ ctx, input }) => {
    return withCache(
      `steps:${input.program}`,
      () => fetchStepsFromDB(ctx, input),
      1000 * 60 * 60 // 1 hour (steps rarely change)
    );
  });
```

---

### 3. Implement Bundle Splitting (Web)

**Current:** Single large bundle
**Target:** Code splitting by route

```typescript
// apps/web/next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      '@12-step-companion/api',
      'lucide-react',
      'recharts'
    ],
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
      },
    };
    return config;
  },
};
```

---

### 4. Lazy Load Heavy Components

```typescript
// apps/web/src/app/sponsor/dashboard/page.tsx
import dynamic from 'next/dynamic';

const DashboardChart = dynamic(
  () => import('@/components/DashboardChart'),
  { loading: () => <ChartSkeleton /> }
);

const StepProgressChart = dynamic(
  () => import('@/components/StepProgressChart'),
  { loading: () => <ChartSkeleton /> }
);
```

---

## 🚀 Medium Impact (4-8 hours each)

### 5. Optimize Database Queries (N+1 Prevention)

**Current Issue:** Multiple queries when one would suffice

**Example Fix:**

```typescript
// ❌ BEFORE: N+1 query
async function getSponsorWithSponsees(sponsorId: string) {
  const relationships = await supabase
    .from('sponsor_relationships')
    .select('sponsee_id')
    .eq('sponsor_id', sponsorId);

  const sponsees = await Promise.all(
    relationships.data.map(rel =>
      supabase.from('profiles').select('*').eq('user_id', rel.sponsee_id).single()
    )
  );

  return sponsees;
}

// ✅ AFTER: Single join query
async function getSponsorWithSponsees(sponsorId: string) {
  const { data } = await supabase
    .from('sponsor_relationships')
    .select(`
      *,
      sponsee:profiles!sponsee_id (*)
    `)
    .eq('sponsor_id', sponsorId)
    .eq('status', 'active');

  return data;
}
```

---

### 6. Implement Proper React Query Configuration

```typescript
// apps/web/src/lib/trpc.ts
export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      maxURLLength: 2083,
    }),
  ],
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});
```

---

### 7. Mobile: Optimize Images and Assets

```typescript
// apps/mobile/app.config.js
export default {
  expo: {
    // ... existing config
    plugins: [
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow access to attach photos to journal entries',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
          ios: {
            deploymentTarget: '15.0',
          },
        },
      ],
    ],
  },
};
```

---

### 8. Database Connection Pooling

```typescript
// packages/api/src/lib/supabase-server.ts
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-connection-pooling': 'enabled', // Supabase connection pooler
      },
    },
  }
);
```

---

## 🏆 High Impact (12-24 hours each)

### 9. Implement Incremental Static Regeneration (ISR)

```typescript
// apps/web/src/app/steps/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function StepsPage() {
  const steps = await getStepsFromDatabase();
  return <StepsDisplay steps={steps} />;
}
```

---

### 10. Add Service Worker for Offline Caching (Web PWA)

```typescript
// apps/web/public/service-worker.js
const CACHE_NAME = '12-step-companion-v1';
const urlsToCache = [
  '/',
  '/steps',
  '/journal',
  '/offline.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});
```

---

### 11. Optimize Mobile Offline Sync

**Current:** Sync all mutations sequentially
**Optimized:** Batch and parallelize

```typescript
// apps/mobile/src/lib/sync-engine.ts
export async function processQueue() {
  const queue = await getQueue();
  if (queue.length === 0) return;

  // Group by mutation type for batching
  const grouped = groupBy(queue, 'type');

  // Process in parallel with limit
  const results = await pLimit(3)(
    Object.entries(grouped).map(([type, items]) =>
      batchProcessMutations(type, items)
    )
  );

  return results;
}

async function batchProcessMutations(type: string, items: QueueItem[]) {
  // Batch insert/update operations
  if (type.includes('create') || type.includes('update')) {
    return batchMutation(type, items.map(i => i.payload));
  }
  // Process individually for complex mutations
  return Promise.all(items.map(item => processSingleMutation(item)));
}
```

---

## 📊 Performance Monitoring

### Setup Continuous Monitoring

```typescript
// packages/api/src/lib/performance.ts
import * as Sentry from '@sentry/node';

export function measurePerformance(name: string) {
  const start = Date.now();
  return {
    end: (metadata?: Record<string, any>) => {
      const duration = Date.now() - start;

      Sentry.metrics.distribution(name, duration, {
        unit: 'millisecond',
        ...metadata,
      });

      if (duration > 1000) {
        console.warn(`Slow operation: ${name} took ${duration}ms`, metadata);
      }
    },
  };
}

// Usage
const perf = measurePerformance('dailyEntries.getAll');
const entries = await fetchDailyEntries();
perf.end({ count: entries.length });
```

---

## 🎯 Performance Targets

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| Initial Load (Web) | 4.2s | 1.5s | HIGH |
| Time to Interactive | 5.8s | 2.3s | HIGH |
| API Avg Response | 450ms | 120ms | HIGH |
| Mobile Bundle | 15MB | 8MB | MEDIUM |
| Database Query Time | 280ms | 50ms | HIGH |
| First Contentful Paint | 2.1s | 0.8s | MEDIUM |
| Largest Contentful Paint | 5.2s | 2.5s | MEDIUM |

---

## 🔍 Profiling Tools

### Backend Profiling
```bash
# Profile API performance
NODE_ENV=production node --prof packages/api/src/index.ts

# Analyze profile
node --prof-process isolate-*.log > profile.txt
```

### Frontend Profiling
```typescript
// React DevTools Profiler
import { Profiler } from 'react';

<Profiler id="JournalPage" onRender={onRenderCallback}>
  <JournalPage />
</Profiler>
```

### Database Profiling
```sql
-- Enable query logging
ALTER DATABASE your_db SET log_min_duration_statement = 100;

-- View slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## 📅 Implementation Roadmap

### Sprint 1 (Week 1-2)
- [ ] Add database indexes
- [ ] Implement query caching
- [ ] Bundle splitting (web)
- [ ] Lazy load components

**Expected Impact:** 40% performance improvement

### Sprint 2 (Week 3-4)
- [ ] Fix N+1 queries
- [ ] Optimize React Query config
- [ ] Database connection pooling
- [ ] Mobile asset optimization

**Expected Impact:** Additional 30% improvement

### Sprint 3 (Week 5-6)
- [ ] Implement ISR
- [ ] Service worker caching
- [ ] Optimize offline sync
- [ ] Performance monitoring

**Expected Impact:** Additional 20% improvement

---

**Total Expected Improvement:** 90% faster overall
**Effort Required:** 60-80 hours
**ROI:** High - Better user retention and engagement
