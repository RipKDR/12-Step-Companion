# tRPC Migration Guide

This guide shows how to migrate existing components from local state/Zustand to tRPC.

## Overview

The app currently uses:
- **Local state**: Zustand store (`useAppStore`)
- **Local files**: JSON files in `public/content/steps/`
- **Local storage**: Browser localStorage

We're migrating to:
- **tRPC**: Type-safe API calls
- **Supabase**: Cloud database with RLS
- **React Query**: Automatic caching and refetching

## Migration Strategy

### Phase 1: Parallel Implementation (Current)
- Keep existing functionality working
- Add tRPC hooks alongside existing code
- Test tRPC endpoints work correctly

### Phase 2: Gradual Migration
- Replace one feature at a time
- Start with read-only operations (queries)
- Then add mutations (writes)
- Keep fallback to local state during transition

### Phase 3: Full Migration
- Remove local state dependencies
- Remove JSON file loading
- All data flows through tRPC

## Example Migrations

### Steps Component

**Before (Current)**:
```typescript
import { loadStepContent } from '@/lib/contentLoader';
import { useAppStore } from '@/store/useAppStore';

const [stepContent, setStepContent] = useState<StepContent | null>(null);
const getStepAnswers = useAppStore((state) => state.getStepAnswers);

useEffect(() => {
  loadStepContent(selectedStep).then(setStepContent);
}, [selectedStep]);
```

**After (tRPC)**:
```typescript
import { useSteps, useStepEntries } from '@/hooks/useSteps';

const { steps } = useSteps("NA");
const { entries } = useStepEntries();
const selectedStep = steps.find(s => s.step_number === selectedStepNumber);
```

### Daily Entries

**Before (Current)**:
```typescript
import { useAppStore } from '@/store/useAppStore';

const getDailyCard = useAppStore((state) => state.getDailyCard);
const dailyCard = getDailyCard(todayDate);
```

**After (tRPC)**:
```typescript
import { useTodaysEntry } from '@/hooks/useDailyEntries';

const { entry: dailyCard } = useTodaysEntry(profile?.timezone || "UTC");
```

## Available Hooks

### Steps
- `useSteps(program)` - Get all steps for a program
- `useStepEntries()` - Get user's step entries
- `useStepEntry(entryId)` - Get specific entry
- `useUpsertStepEntry()` - Save/update entry
- `useStepsWithProgress(program)` - Steps with completion status

### Daily Entries
- `useDailyEntries(options?)` - Get entries (with date filters)
- `useDailyEntry(date)` - Get entry for specific date
- `useTodaysEntry(timezone)` - Get today's entry
- `useWeeklyEntries(timezone)` - Get current week's entries
- `useUpsertDailyEntry()` - Save/update entry
- `useDeleteDailyEntry()` - Delete entry

### Sponsor
- `useSponsorRelationships()` - Get relationships
- `useGenerateSponsorCode()` - Generate code
- `useConnectToSponsor()` - Connect using code
- `useSponsorConnection()` - Combined hook

## Migration Checklist

### Steps Component
- [ ] Replace `loadStepContent` with `useSteps`
- [ ] Replace `loadAllSteps` with `useSteps`
- [ ] Replace Zustand `getStepAnswers` with `useStepEntries`
- [ ] Replace Zustand `saveStepAnswer` with `useUpsertStepEntry`
- [ ] Test step loading works
- [ ] Test step saving works
- [ ] Test offline fallback (if needed)

### Journal Component
- [ ] Replace `getDailyCard` with `useTodaysEntry`
- [ ] Replace `updateDailyCard` with `useUpsertDailyEntry`
- [ ] Replace journal entries loading with `useDailyEntries`
- [ ] Test entry creation works
- [ ] Test entry editing works
- [ ] Test date filtering works

### Home Component
- [ ] Replace step progress calculation with `useStepsWithProgress`
- [ ] Replace daily card with `useTodaysEntry`
- [ ] Test all data loads correctly
- [ ] Test real-time updates work

## Error Handling

tRPC provides built-in error handling:

```typescript
const { data, error, isLoading } = trpc.steps.getAll.useQuery({ program: "NA" });

if (error) {
  // Handle error - show user-friendly message
  return <ErrorMessage message={error.message} />;
}

if (isLoading) {
  return <LoadingSpinner />;
}

// Use data
return <StepsList steps={data} />;
```

## Offline Support

During migration, you can implement offline fallback:

```typescript
const { data, error } = trpc.steps.getAll.useQuery(
  { program: "NA" },
  {
    retry: false,
    staleTime: Infinity,
  }
);

// Fallback to local data if offline
const steps = data || localSteps;
```

## Testing

After migrating a component:

1. **Test online**: Verify data loads from Supabase
2. **Test offline**: Verify fallback works (if implemented)
3. **Test mutations**: Verify saves work correctly
4. **Test RLS**: Verify user can only see their own data
5. **Test sponsor sharing**: Verify sharing works correctly

## Common Patterns

### Optimistic Updates

```typescript
const utils = trpc.useUtils();

const mutation = trpc.dailyEntries.upsert.useMutation({
  onMutate: async (newEntry) => {
    // Cancel outgoing refetches
    await utils.dailyEntries.getAll.cancel();
    
    // Snapshot previous value
    const previous = utils.dailyEntries.getAll.getData();
    
    // Optimistically update
    utils.dailyEntries.getAll.setData(undefined, (old) => {
      return [...(old || []), newEntry];
    });
    
    return { previous };
  },
  onError: (err, newEntry, context) => {
    // Rollback on error
    utils.dailyEntries.getAll.setData(undefined, context?.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    utils.dailyEntries.getAll.invalidate();
  },
});
```

### Conditional Queries

```typescript
// Only fetch if step is selected
const { data } = trpc.steps.getEntry.useQuery(
  { id: selectedStepId },
  { enabled: !!selectedStepId }
);
```

### Dependent Queries

```typescript
// First get steps
const { data: steps } = trpc.steps.getAll.useQuery({ program: "NA" });

// Then get entries for the first step
const firstStepId = steps?.[0]?.id;
const { data: entry } = trpc.steps.getEntry.useQuery(
  { id: firstStepId! },
  { enabled: !!firstStepId }
);
```

## Next Steps

1. Start with read-only components (Steps list, Journal list)
2. Then migrate write operations (saving entries)
3. Finally migrate complex features (sponsor sharing, geofencing)
4. Remove old code once migration is complete

See example components in `client/src/components/examples/` for reference implementations.

