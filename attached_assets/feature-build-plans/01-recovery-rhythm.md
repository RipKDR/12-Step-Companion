# Recovery Rhythm Feature - BMAD Build Plan

## B — Background (Context, Constraints, Guardrails)

### Context
The Recovery Rhythm feature transforms the app into a daily habit by creating three micro-interactions (<3 minutes total) that users complete morning, midday, and night. This addresses the #1 retention problem: users forget the app exists without daily touchpoints.

### Current State
- ✅ Morning/Evening cards exist in `DailyCard` type
- ✅ `RoutinePanel` component displays daily cards
- ✅ Streak tracking exists for daily cards
- ❌ No midday pulse check
- ❌ Morning intention is free-text (should be structured)
- ❌ Evening reflection lacks structured inventory

### Hard Constraints
- **Time Budget**: Each interaction must be <2 minutes (morning: 30s, midday: 10s, night: 1-2min)
- **Offline-First**: All data stored locally via Zustand
- **Privacy**: No cloud sync required (local-only)
- **Accessibility**: WCAG 2.2 AA compliance, keyboard navigation, screen reader support
- **Backward Compatibility**: Must not break existing `DailyCard` data

### Principles
- **BMAD**: Operate in Background → Mission → Actions → Deliverables cycles
- **Challenge Assumptions**: Why would someone do this daily? Answer: It's faster than opening social media and provides immediate value
- **Ship Small**: Start with manual check-ins, add smart notifications later

### Risks & Mitigations
1. **Risk**: Users skip midday check-in → **Mitigation**: Make it optional, show gentle reminder only
2. **Risk**: Too many notifications → **Mitigation**: Respect quiet hours, opt-in only
3. **Risk**: Data migration breaks existing cards → **Mitigation**: Add new fields as optional, default values
4. **Risk**: Cognitive load too high → **Mitigation**: One question at a time, swipe interface for midday

---

## M — Mission (What to Build)

### Core Features

#### 1. Morning: "Set the Tone" (30 seconds)
- **Input**: Pick one intention from 3 options OR custom
  - Options: "Stay clean", "Stay connected", "Be gentle with myself"
  - Optional: One-liner reminder ("If today gets hard, remember...")
- **Output**: Stores in `DailyCard.morningIntention` and `morningIntentionCustom`
- **UI**: Single card with 3 large buttons + optional text input
- **Value**: Quick promise to self, shapes day's suggestions

#### 2. Midday: "Pulse Check" (10-20 seconds)
- **Input**: 
  - Mood slider (1-5: low → great) OR swipe
  - Craving slider (0-10: none → intense) OR swipe
  - One context tag: ["Alone", "With people", "Bored", "Stressed", "Hungry"]
- **Output**: Stores in `DailyCard.middayPulseCheck`
- **UI**: Tinder-style swipe interface OR quick sliders
- **Value**: Fastest check-in possible, triggers smart suggestions if risk detected

#### 3. Night: "Tiny Inventory" (1-2 minutes)
- **Input**:
  - "Did I stay clean today?" (Yes / No / Close call)
  - "Did I stay connected?" (meetings / sponsor / recovery friends - toggles)
  - One gratitude OR one improvement ("One thing I'm grateful for / one thing I'd like to do differently")
- **Output**: Stores in `DailyCard.eveningStayedClean`, `eveningStayedConnected`, `eveningGratitude`, `eveningImprovement`
- **UI**: Simple form with checkboxes, toggles, one text input
- **Value**: Quick emotional closure, shows trends over time

### Success Metrics
- **Daily Completion Rate**: 60%+ of users complete all 3 check-ins
- **Midday Adoption**: 40%+ of users use midday pulse check
- **Retention Impact**: 5-10x higher retention for users who complete daily rhythm
- **Time to Complete**: <3 minutes total per day

---

## A — Actions (Step-by-Step Implementation)

### A0. Sanity & Risk Pass
**Challenge Thinking:**
- Why would users do this daily? → Answer: It's faster than social media, provides immediate value
- What if they skip? → Answer: Make it optional, show gentle trends, not guilt
- What if notifications are denied? → Answer: Show in-app reminders, don't block core flow

**Top Risks:**
1. Notification permission denied → Mitigation: In-app reminders, don't require notifications
2. Data migration breaks existing cards → Mitigation: Add fields as optional, migration script
3. Too many fields → Mitigation: Progressive disclosure, one question at a time
4. Users feel judged → Mitigation: No shame language, celebrate small wins

### A1. Type System Updates

**File**: `client/src/types.ts`

```typescript
// Enhance existing DailyCard interface
export interface DailyCard {
  id: string;
  date: string; // YYYY-MM-DD
  // Existing fields
  morningIntent?: string;
  eveningReflection?: string;
  morningCompleted: boolean;
  eveningCompleted: boolean;
  gratitudeItems?: string[];
  quickNotes?: string;
  updatedAtISO: string;
  
  // NEW: Recovery Rhythm fields
  // Morning: "Set the Tone"
  morningIntention?: "stay-clean" | "stay-connected" | "be-gentle" | "custom";
  morningIntentionCustom?: string; // if custom
  morningReminder?: string; // "If today gets hard, remember..."
  
  // Midday: "Pulse Check"
  middayPulseCheck?: {
    mood: number; // 1-5 (low -> great)
    craving: number; // 0-10 (none -> intense)
    context: string[]; // ["Alone", "With people", "Bored", "Stressed", "Hungry"]
    timestampISO: string;
  };
  middayCompleted: boolean; // NEW
  
  // Night: "Tiny Inventory"
  eveningStayedClean?: "yes" | "no" | "close-call";
  eveningStayedConnected?: {
    meetings: boolean;
    sponsor: boolean;
    recoveryFriends: boolean;
  };
  eveningGratitude?: string; // Single item for rhythm (separate from gratitudeItems)
  eveningImprovement?: string; // "One thing I'd like to do differently tomorrow"
}
```

**Migration**: Add to `client/src/store/migrations.ts`
- Version bump: `CURRENT_VERSION = 5` (or next version)
- Migration function: Add default values for new fields

### A2. State Management Updates

**File**: `client/src/store/useAppStore.ts`

**Add Actions:**
```typescript
// Enhance existing updateDailyCard to handle new fields
updateDailyCard: (date: string, updates: Partial<DailyCard>) => void;

// NEW: Quick actions for rhythm
setMorningIntention: (date: string, intention: DailyCard['morningIntention'], custom?: string, reminder?: string) => void;
setMiddayPulseCheck: (date: string, mood: number, craving: number, context: string[]) => void;
setEveningInventory: (date: string, stayedClean: DailyCard['eveningStayedClean'], stayedConnected: DailyCard['eveningStayedConnected'], gratitude?: string, improvement?: string) => void;

// NEW: Streak tracking for midday
// Enhance existing streak system to track midday check-ins
```

**Implementation Notes:**
- Use existing `updateDailyCard` pattern
- Auto-update streaks when check-ins completed
- Store in existing Zustand store with persistence

### A3. UI Components

#### A3.1 Morning Intention Component

**File**: `client/src/components/recovery-rhythm/MorningIntentionCard.tsx`

**Props:**
```typescript
interface MorningIntentionCardProps {
  date: string;
  dailyCard?: DailyCard;
  onComplete: (intention: DailyCard['morningIntention'], custom?: string, reminder?: string) => void;
}
```

**UI Design:**
- Large card with title "Set the Tone"
- 3 large buttons (44px+ touch targets):
  - "Stay Clean" (green)
  - "Stay Connected" (blue)
  - "Be Gentle with Myself" (purple)
- Optional: "Custom" button opens text input
- Optional: "If today gets hard, remember..." textarea (collapsed by default)
- Checkmark when completed
- Shows yesterday's intention if available

**Accessibility:**
- Keyboard navigation (arrow keys between buttons)
- ARIA labels: "Morning intention: Stay clean"
- Focus visible on all interactive elements

#### A3.2 Midday Pulse Check Component

**File**: `client/src/components/recovery-rhythm/MiddayPulseCheck.tsx`

**Props:**
```typescript
interface MiddayPulseCheckProps {
  date: string;
  dailyCard?: DailyCard;
  onComplete: (mood: number, craving: number, context: string[]) => void;
}
```

**UI Design:**
- **Option A**: Tinder-style swipe
  - Swipe left/right for mood (1-5)
  - Swipe up/down for craving (0-10)
  - Tap context tags
- **Option B**: Quick sliders (simpler)
  - Mood slider (1-5) with emoji labels
  - Craving slider (0-10) with labels
  - Context chips (tap to select)
- Floating action button on Home screen: "Quick Check-In"
- Modal overlay (non-blocking, can dismiss)

**Accessibility:**
- Slider labels: "Mood: Low" to "Mood: Great"
- Keyboard navigation for sliders
- Screen reader announces values

#### A3.3 Evening Inventory Component

**File**: `client/src/components/recovery-rhythm/EveningInventoryCard.tsx`

**Props:**
```typescript
interface EveningInventoryCardProps {
  date: string;
  dailyCard?: DailyCard;
  onComplete: (stayedClean: DailyCard['eveningStayedClean'], stayedConnected: DailyCard['eveningStayedConnected'], gratitude?: string, improvement?: string) => void;
}
```

**UI Design:**
- Card with title "Tiny Inventory"
- "Did I stay clean today?" → Radio buttons (Yes / No / Close call)
- "Did I stay connected?" → Toggles:
  - ☐ Meetings
  - ☐ Sponsor
  - ☐ Recovery Friends
- "One thing I'm grateful for" → Text input (optional)
- "One thing I'd like to do differently tomorrow" → Text input (optional)
- Shows streak: "You've checked in X nights in a row"

**Accessibility:**
- Radio group with proper labels
- Toggle switches with labels
- Form validation (at least one field required)

### A4. Integration Points

#### A4.1 Home Screen Integration

**File**: `client/src/routes/Home.tsx`

**Changes:**
- Enhance existing `RoutinePanel` to show all 3 check-ins
- Add floating action button for midday pulse check
- Show completion status for each check-in
- Display streak: "X days of complete rhythm"

#### A4.2 Notification Integration

**File**: `client/src/service-worker.ts`

**Enhance:**
- Morning notification: "Set your intention for today" (existing)
- **NEW**: Midday notification: "Quick pulse check?" (optional, opt-in)
- Evening notification: "How was your day?" (existing, enhance)

**Settings:**
- Add to `NotificationSettings`:
  ```typescript
  middayPulseCheck: {
    enabled: boolean;
    time: string; // HH:MM format
  };
  ```

#### A4.3 Streak Integration

**File**: `client/src/lib/streaks.ts`

**Enhance:**
- Track "recoveryRhythm" streak (all 3 check-ins completed)
- Update streak when all 3 completed
- Show streak on Home screen

### A5. Analytics & Insights

**File**: `client/src/lib/analytics.ts`

**Track Events:**
```typescript
// Recovery Rhythm events
"morning_intention_set"
"midday_pulse_check_completed"
"evening_inventory_completed"
"recovery_rhythm_streak_milestone" // 3, 7, 14, 30 days
```

**Insights to Show:**
- "You've completed X complete rhythms this week"
- "Your mood has been trending [up/down] this week"
- "You tend to set 'Stay Connected' intentions on [day]"

### A6. Testing

**Unit Tests:**
- `client/src/lib/__tests__/recovery-rhythm.test.ts`
  - Test morning intention storage
  - Test midday pulse check storage
  - Test evening inventory storage
  - Test streak calculation

**Integration Tests:**
- `client/src/components/__tests__/MorningIntentionCard.test.tsx`
  - Test button selection
  - Test custom intention
  - Test completion state

**E2E Tests:**
- Complete full rhythm flow (morning → midday → night)
- Verify data persists
- Verify streak updates

---

## D — Deliverables (What Must Exist)

### Code Deliverables
1. ✅ Enhanced `DailyCard` type with Recovery Rhythm fields
2. ✅ Migration script for existing data
3. ✅ `MorningIntentionCard` component
4. ✅ `MiddayPulseCheck` component
5. ✅ `EveningInventoryCard` component
6. ✅ Updated `RoutinePanel` to show all 3 check-ins
7. ✅ Streak tracking for complete rhythm
8. ✅ Notification settings for midday check-in
9. ✅ Analytics events for rhythm completion

### UX Deliverables
1. ✅ Morning intention can be completed in <30 seconds
2. ✅ Midday pulse check can be completed in <20 seconds
3. ✅ Evening inventory can be completed in <2 minutes
4. ✅ All components accessible (keyboard, screen reader)
5. ✅ Mobile-responsive (large touch targets)

### Data Deliverables
1. ✅ Existing `DailyCard` data migrates without breaking
2. ✅ New fields have sensible defaults
3. ✅ Streak data calculates correctly
4. ✅ Analytics events fire correctly

### Documentation Deliverables
1. ✅ README update: How Recovery Rhythm works
2. ✅ User guide: Why daily rhythm matters
3. ✅ Developer notes: How to extend rhythm features

---

## Success Criteria

### Must Have (MVP)
- [ ] Morning intention can be set (3 options + custom)
- [ ] Midday pulse check can be completed (mood + craving + context)
- [ ] Evening inventory can be completed (stayed clean + connected + gratitude/improvement)
- [ ] All data stores correctly in `DailyCard`
- [ ] Streak tracks complete rhythm
- [ ] Existing data migrates without breaking

### Should Have (Enhanced)
- [ ] Midday notification (opt-in)
- [ ] Trends visualization (mood over time, intention patterns)
- [ ] Quick actions from Home screen
- [ ] Analytics insights

### Nice to Have (Future)
- [ ] AI suggestions based on intention ("You set 'Stay Connected' - here are meetings starting soon")
- [ ] Weekly rhythm summary
- [ ] Share rhythm streak with sponsor

---

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: Type system + migration
- Day 3-4: Morning intention component
- Day 5: Midday pulse check component

### Week 2: Completion
- Day 1-2: Evening inventory component
- Day 3: Integration with Home screen
- Day 4: Streak tracking
- Day 5: Testing + polish

### Week 3: Enhancement (Optional)
- Day 1-2: Notifications
- Day 3-4: Analytics insights
- Day 5: Documentation

---

## Notes & Considerations

### Privacy
- All data stored locally (no cloud sync required)
- No sharing without explicit user action
- Analytics are anonymous

### Accessibility
- All components must meet WCAG 2.2 AA
- Keyboard navigation required
- Screen reader support required
- Large touch targets (44px+)

### Performance
- Components should load instantly (<100ms)
- No blocking operations
- Optimistic updates for better UX

### Edge Cases
- What if user completes morning but not midday/night? → Streak doesn't update, but morning data saved
- What if user completes midday multiple times? → Keep latest, but don't break streak
- What if timezone changes? → Use date string (YYYY-MM-DD) not timestamp

---

**Status**: Ready for Implementation
**Priority**: P0 (Critical for Retention)
**Estimated Effort**: 2 weeks
**Dependencies**: None (builds on existing DailyCard)

