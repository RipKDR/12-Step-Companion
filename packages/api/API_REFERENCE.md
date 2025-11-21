# 12-Step Companion API Reference

> **Version:** 1.0.0
> **Type:** tRPC API
> **Authentication:** Bearer Token (Supabase JWT)

## Overview

The 12-Step Companion API is built with tRPC, providing type-safe, end-to-end typed API routes. All procedures require authentication unless otherwise specified.

## Base URL

```
Development: http://localhost:3000/api/trpc
Production: https://your-domain.com/api/trpc
```

## Authentication

All API calls require a valid Supabase JWT token in the Authorization header:

```
Authorization: Bearer <your_supabase_jwt_token>
```

The token is obtained through Supabase Auth (email/password, OAuth, etc.).

## Core Concepts

### Row Level Security (RLS)

The API respects PostgreSQL Row Level Security policies. When a valid user token is provided:
- Queries are scoped to the authenticated user's data
- Users can only access their own records
- Sponsor relationships allow limited cross-user access

### Offline-First Support

The mobile app supports offline mutations that are queued and synced when connectivity returns.

---

## API Routers

### 1. Steps Router (`steps`)

Manages 12-step program steps (Narcotics Anonymous & Alcoholics Anonymous).

#### `steps.getAll`

Get all steps for a specific program.

**Type:** Query
**Auth:** Required

**Input:**
```typescript
{
  program: "NA" | "AA"
}
```

**Output:**
```typescript
Array<{
  id: string
  program: "NA" | "AA"
  step_number: number
  title: string
  description: string
  questions: string[]
  created_at: string
  updated_at: string
}>
```

**Example:**
```typescript
const steps = await trpc.steps.getAll.query({ program: "NA" });
```

---

#### `steps.getOne`

Get a specific step by ID.

**Type:** Query
**Auth:** Required

**Input:**
```typescript
{
  id: string (UUID)
}
```

**Output:**
```typescript
{
  id: string
  program: "NA" | "AA"
  step_number: number
  title: string
  description: string
  questions: string[]
  created_at: string
  updated_at: string
}
```

---

#### `steps.getUserProgress`

Get user's step entries (work completed on each step).

**Type:** Query
**Auth:** Required

**Input:**
```typescript
{
  program: "NA" | "AA"
}
```

**Output:**
```typescript
Array<{
  id: string
  user_id: string
  step_id: string
  version: number
  content: Record<string, any> // Answers to step questions
  shared_with_sponsor: boolean
  created_at: string
  updated_at: string
}>
```

---

#### `steps.saveProgress`

Save or update step work progress.

**Type:** Mutation
**Auth:** Required

**Input:**
```typescript
{
  stepId: string (UUID)
  content: Record<string, any> // Answers keyed by question ID
  sharedWithSponsor?: boolean
}
```

**Output:**
```typescript
{
  id: string
  user_id: string
  step_id: string
  version: number
  content: Record<string, any>
  shared_with_sponsor: boolean
  created_at: string
  updated_at: string
}
```

**Behavior:**
- Creates a new version if content changes
- Increments version number automatically
- Preserves history of previous versions

---

### 2. Daily Entries Router (`dailyEntries`)

Manages daily journal entries for mood, triggers, and recovery activities.

#### `dailyEntries.getAll`

Get all daily entries for the authenticated user.

**Type:** Query
**Auth:** Required

**Input:** None

**Output:**
```typescript
Array<{
  id: string
  user_id: string
  entry_date: string (ISO date)
  mood_rating: number (1-10)
  gratitude: string[]
  triggers: string[]
  coping_used: string[]
  notes: string | null
  shared_with_sponsor: boolean
  created_at: string
  updated_at: string
}>
```

---

#### `dailyEntries.getByDateRange`

Get entries within a specific date range.

**Type:** Query
**Auth:** Required

**Input:**
```typescript
{
  startDate: string (ISO date)
  endDate: string (ISO date)
}
```

**Output:** Same as `getAll`

---

#### `dailyEntries.create`

Create a new daily entry.

**Type:** Mutation
**Auth:** Required

**Input:**
```typescript
{
  entryDate: string (ISO date)
  moodRating: number (1-10)
  gratitude: string[]
  triggers: string[]
  copingUsed: string[]
  notes?: string
  sharedWithSponsor?: boolean
}
```

**Output:** Created entry object

**Validation:**
- `moodRating` must be between 1-10
- `entryDate` must be valid ISO date
- Arrays cannot be empty

---

#### `dailyEntries.update`

Update an existing daily entry.

**Type:** Mutation
**Auth:** Required
**RLS:** User can only update their own entries

**Input:**
```typescript
{
  id: string (UUID)
  moodRating?: number (1-10)
  gratitude?: string[]
  triggers?: string[]
  copingUsed?: string[]
  notes?: string
  sharedWithSponsor?: boolean
}
```

**Output:** Updated entry object

---

### 3. Sponsor Router (`sponsor`)

Manages sponsor-sponsee relationships and sharing.

#### `sponsor.generateCode`

Generate a unique code for sponsor connection.

**Type:** Mutation
**Auth:** Required

**Input:** None

**Output:**
```typescript
{
  code: string // 8-character alphanumeric code
}
```

**Security:**
- Uses cryptographically secure random generation
- Code is single-use (should be implemented)
- Code should expire after 24 hours (TODO)

---

#### `sponsor.connect`

Connect to a sponsor using their code.

**Type:** Mutation
**Auth:** Required

**Input:**
```typescript
{
  code: string (length: 8)
}
```

**Output:**
```typescript
{
  id: string
  sponsor_id: string
  sponsee_id: string
  status: "pending"
  created_at: string
  updated_at: string
}
```

**Behavior:**
- Creates relationship in "pending" status
- Sponsor must accept before activation
- Sponsee cannot sponsor themselves

---

#### `sponsor.getRelationships`

Get all sponsor relationships for the authenticated user.

**Type:** Query
**Auth:** Required

**Input:** None

**Output:**
```typescript
Array<{
  id: string
  sponsor_id: string
  sponsee_id: string
  status: "pending" | "active" | "revoked"
  created_at: string
  updated_at: string
}>
```

**Includes:**
- Relationships where user is the sponsor
- Relationships where user is the sponsee

---

#### `sponsor.accept`

Accept a pending sponsor relationship (sponsor only).

**Type:** Mutation
**Auth:** Required
**Authorization:** Must be the sponsor

**Input:**
```typescript
{
  relationshipId: string (UUID)
}
```

**Output:** Updated relationship with `status: "active"`

---

#### `sponsor.revoke`

Revoke an active relationship (either party).

**Type:** Mutation
**Auth:** Required
**Authorization:** Must be sponsor or sponsee

**Input:**
```typescript
{
  relationshipId: string (UUID)
}
```

**Output:** Updated relationship with `status: "revoked"`

---

### 4. Action Plans Router (`actionPlans`)

Manages crisis action plans and emergency coping strategies.

#### `actionPlans.getAll`

Get all action plans for the authenticated user.

**Type:** Query
**Auth:** Required

#### `actionPlans.create`

Create a new action plan.

**Type:** Mutation
**Auth:** Required

#### `actionPlans.update`

Update an existing action plan.

**Type:** Mutation
**Auth:** Required

---

### 5. Routines Router (`routines`)

Manages daily and weekly routine tracking.

#### `routines.getAll`

Get all routines for the authenticated user.

**Type:** Query
**Auth:** Required

#### `routines.create`

Create a new routine.

**Type:** Mutation
**Auth:** Required

#### `routines.update`

Update a routine.

**Type:** Mutation
**Auth:** Required

#### `routines.delete`

Delete a routine.

**Type:** Mutation
**Auth:** Required

---

### 6. Profiles Router (`profiles`)

Manages user profiles and settings.

#### `profiles.get`

Get the authenticated user's profile.

**Type:** Query
**Auth:** Required

#### `profiles.update`

Update user profile.

**Type:** Mutation
**Auth:** Required

---

### 7. Meetings Router (`meetings`)

Track meeting attendance and statistics.

#### `meetings.getAll`

Get all meetings attended by the user.

**Type:** Query
**Auth:** Required

#### `meetings.create`

Log a meeting attendance.

**Type:** Mutation
**Auth:** Required

---

## Error Handling

All tRPC procedures throw errors with the following structure:

```typescript
{
  message: string,
  code: "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR",
  data?: any
}
```

### Common Error Codes

- `BAD_REQUEST` - Invalid input data
- `UNAUTHORIZED` - Missing or invalid authentication token
- `FORBIDDEN` - Authenticated but not authorized for this operation
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error

---

## Rate Limiting

Currently not implemented. Future implementation will use:
- 100 requests per minute per user (authenticated)
- 20 requests per minute per IP (anonymous)

---

## Versioning

API version is managed through package version. Breaking changes will be communicated through:
1. Major version bump
2. Migration guide
3. Deprecation warnings (minimum 3 months)

---

## Testing

Use the tRPC testing utilities:

```typescript
import { appRouter } from '@12-step-companion/api';
import { createContext } from '@12-step-companion/api/context';

const caller = appRouter.createCaller(await createContext(mockRequest));
const steps = await caller.steps.getAll({ program: "NA" });
```

---

## Support

- **Issues:** https://github.com/RipKDR/12-Step-Companion/issues
- **Docs:** See README.md and TECHNICAL_ARCHITECTURE.md

---

**Last Updated:** 2025-01-21
