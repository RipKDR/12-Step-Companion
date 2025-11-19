# tRPC API Reference

Complete reference for all tRPC endpoints available in the app.

## Base URL

All tRPC endpoints are mounted at `/api/trpc`

## Authentication

Most endpoints require authentication. Include the Supabase auth token in the Authorization header:

```
Authorization: Bearer <supabase-access-token>
```

The tRPC client automatically includes this token when a user is authenticated.

## Routers

### Profiles (`profiles`)

#### `profiles.get`
Get current user's profile.

**Query**
```typescript
trpc.profiles.get.useQuery()
```

**Returns**: `Profile` object

#### `profiles.upsert`
Create or update profile.

**Mutation**
```typescript
trpc.profiles.upsert.useMutation({
  handle?: string;
  timezone?: string;
  avatarUrl?: string | null;
  cleanDate?: Date | null;
  program?: "NA" | "AA" | null;
})
```

**Returns**: Updated `Profile` object

#### `profiles.getByHandle`
Get profile by handle (for sponsor lookup).

**Query**
```typescript
trpc.profiles.getByHandle.useQuery({ handle: string })
```

**Returns**: `Profile` object (limited fields: id, handle, avatar_url)

---

### Steps (`steps`)

#### `steps.getAll`
Get all step definitions for a program.

**Query**
```typescript
trpc.steps.getAll.useQuery({ program: "NA" | "AA" })
```

**Returns**: Array of `Step` objects

#### `steps.getEntries`
Get all step entries for current user.

**Query**
```typescript
trpc.steps.getEntries.useQuery()
```

**Returns**: Array of `StepEntry` objects

#### `steps.upsertEntry`
Create or update step entry.

**Mutation**
```typescript
trpc.steps.upsertEntry.useMutation({
  stepId: string; // UUID
  version?: number; // Optional, auto-increments if not provided
  content: Record<string, unknown>; // Step work content
  isSharedWithSponsor?: boolean;
})
```

**Returns**: `StepEntry` object

#### `steps.getEntry`
Get specific step entry by ID.

**Query**
```typescript
trpc.steps.getEntry.useQuery({ id: string })
```

**Returns**: `StepEntry` object

---

### Daily Entries (`dailyEntries`)

#### `dailyEntries.getAll`
Get all daily entries (optionally filtered by date range).

**Query**
```typescript
trpc.dailyEntries.getAll.useQuery({
  startDate?: Date;
  endDate?: Date;
})
```

**Returns**: Array of `DailyEntry` objects

#### `dailyEntries.getByDate`
Get daily entry for specific date.

**Query**
```typescript
trpc.dailyEntries.getByDate.useQuery({ date: Date })
```

**Returns**: `DailyEntry` object or null

#### `dailyEntries.upsert`
Create or update daily entry.

**Mutation**
```typescript
trpc.dailyEntries.upsert.useMutation({
  entryDate?: Date; // Defaults to today
  cravingsIntensity?: number; // 0-10
  feelings?: string[];
  triggers?: string[];
  copingActions?: string[];
  gratitude?: string | null;
  notes?: string | null;
  shareWithSponsor?: boolean;
})
```

**Returns**: `DailyEntry` object

#### `dailyEntries.delete`
Delete daily entry.

**Mutation**
```typescript
trpc.dailyEntries.delete.useMutation({ id: string })
```

**Returns**: `{ success: true }`

---

### Sponsor (`sponsor`)

#### `sponsor.generateCode`
Generate sponsor connection code.

**Mutation**
```typescript
trpc.sponsor.generateCode.useMutation()
```

**Returns**: `{ code: string }` (8-character code)

#### `sponsor.connect`
Connect to sponsor using code.

**Mutation**
```typescript
trpc.sponsor.connect.useMutation({ code: string })
```

**Returns**: `SponsorRelationship` object

#### `sponsor.getRelationships`
Get all sponsor relationships for current user.

**Query**
```typescript
trpc.sponsor.getRelationships.useQuery()
```

**Returns**: Array of `SponsorRelationship` objects

#### `sponsor.accept`
Accept sponsor relationship (sponsor accepts sponsee).

**Mutation**
```typescript
trpc.sponsor.accept.useMutation({ relationshipId: string })
```

**Returns**: Updated `SponsorRelationship` object

#### `sponsor.revoke`
Revoke sponsor relationship.

**Mutation**
```typescript
trpc.sponsor.revoke.useMutation({ relationshipId: string })
```

**Returns**: Updated `SponsorRelationship` object

---

### Meetings (`meetings`)

#### `meetings.search`
Search for meetings using BMLT.

**Query**
```typescript
trpc.meetings.search.useQuery({
  lat: number;
  lng: number;
  radius?: number; // Default: 25 miles
  program?: "NA" | "AA";
})
```

**Returns**: Array of meeting objects (BMLT format)

#### `meetings.getById`
Get meeting details by ID.

**Query**
```typescript
trpc.meetings.getById.useQuery({ id: string })
```

**Returns**: Meeting object or null

---

### Action Plans (`actionPlans`)

#### `actionPlans.getAll`
Get all action plans for current user.

**Query**
```typescript
trpc.actionPlans.getAll.useQuery()
```

**Returns**: Array of `ActionPlan` objects

#### `actionPlans.getById`
Get action plan by ID.

**Query**
```typescript
trpc.actionPlans.getById.useQuery({ id: string })
```

**Returns**: `ActionPlan` object

#### `actionPlans.create`
Create action plan.

**Mutation**
```typescript
trpc.actionPlans.create.useMutation({
  title: string;
  situation?: string;
  ifThen?: Array<{ if: string; then: string }>;
  checklist?: string[];
  emergencyContacts?: Array<{ name: string; phone: string }>;
  isSharedWithSponsor?: boolean;
})
```

**Returns**: `ActionPlan` object

#### `actionPlans.update`
Update action plan.

**Mutation**
```typescript
trpc.actionPlans.update.useMutation({
  id: string;
  title?: string;
  situation?: string;
  ifThen?: Array<{ if: string; then: string }>;
  checklist?: string[];
  emergencyContacts?: Array<{ name: string; phone: string }>;
  isSharedWithSponsor?: boolean;
})
```

**Returns**: Updated `ActionPlan` object

#### `actionPlans.delete`
Delete action plan.

**Mutation**
```typescript
trpc.actionPlans.delete.useMutation({ id: string })
```

**Returns**: `{ success: true }`

---

### Routines (`routines`)

#### `routines.getAll`
Get all routines for current user.

**Query**
```typescript
trpc.routines.getAll.useQuery()
```

**Returns**: Array of `Routine` objects

#### `routines.getActive`
Get active routines only.

**Query**
```typescript
trpc.routines.getActive.useQuery()
```

**Returns**: Array of `Routine` objects

#### `routines.getById`
Get routine by ID.

**Query**
```typescript
trpc.routines.getById.useQuery({ id: string })
```

**Returns**: `Routine` object

#### `routines.create`
Create routine.

**Mutation**
```typescript
trpc.routines.create.useMutation({
  title: string;
  schedule: {
    type: "daily" | "weekly";
    time: string; // HH:MM format
    daysOfWeek?: number[]; // For weekly: 0=Sunday, 6=Saturday
  };
  active?: boolean;
})
```

**Returns**: `Routine` object

#### `routines.update`
Update routine.

**Mutation**
```typescript
trpc.routines.update.useMutation({
  id: string;
  title?: string;
  schedule?: {
    type: "daily" | "weekly";
    time: string;
    daysOfWeek?: number[];
  };
  active?: boolean;
})
```

**Returns**: Updated `Routine` object

#### `routines.delete`
Delete routine.

**Mutation**
```typescript
trpc.routines.delete.useMutation({ id: string })
```

**Returns**: `{ success: true }`

#### `routines.log`
Log routine completion.

**Mutation**
```typescript
trpc.routines.log.useMutation({
  routineId: string;
  status: "completed" | "skipped" | "failed";
  note?: string | null;
})
```

**Returns**: `RoutineLog` object

#### `routines.getLogs`
Get routine logs.

**Query**
```typescript
trpc.routines.getLogs.useQuery({
  routineId?: string;
  startDate?: Date;
  endDate?: Date;
})
```

**Returns**: Array of `RoutineLog` objects

---

## Error Handling

All tRPC endpoints return errors in a consistent format:

```typescript
{
  message: string; // User-friendly error message
  code: string; // Error code (e.g., "UNAUTHORIZED", "NOT_FOUND")
  data?: {
    zodError?: object; // Zod validation errors if applicable
  }
}
```

Handle errors in components:

```typescript
const { data, error } = trpc.steps.getAll.useQuery({ program: "NA" });

if (error) {
  if (error.data?.code === "UNAUTHORIZED") {
    // Redirect to login
  } else {
    // Show error message
    toast.error(error.message);
  }
}
```

## Type Safety

All endpoints are fully type-safe. TypeScript will autocomplete:
- Query parameters
- Mutation inputs
- Return types
- Error types

Use the generated types from `packages/types/src/supabase.ts` for database types.

## React Query Integration

All tRPC queries use React Query under the hood, providing:
- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication
- Retry logic

See React Query docs for advanced features: https://tanstack.com/query/latest

