# Recovery Scenes Feature - BMAD Build Plan

## B — Background (Context, Constraints, Guardrails)

### Context
Recovery Scenes are situation-specific playbooks that help users navigate high-risk moments. Most relapses occur in predictable patterns (payday, alone at night, after arguments, specific locations). This feature transforms the app from reactive logging to proactive intervention.

### Current State
- ✅ Emergency screen exists with configurable actions
- ✅ `FellowshipContact` type exists (can reference for "call friend")
- ✅ Tools exist (breathing, grounding, etc.)
- ❌ No situation-specific plans
- ❌ No scene management
- ❌ No time/location triggers

### Hard Constraints
- **Privacy-First**: Geofencing is opt-in only, requires explicit permission
- **Offline-First**: Scenes must work offline (no API calls for core functionality)
- **Local Storage**: All scenes stored locally via Zustand
- **Accessibility**: WCAG 2.2 AA compliance
- **Copyright**: No copyrighted NA/AA text in prompts

### Principles
- **BMAD**: Operate in Background → Mission → Actions → Deliverables cycles
- **Challenge Assumptions**: Why would users create scenes? Answer: They know their patterns, app helps them prepare
- **Ship Small**: Start with manual scene selection, add triggers later

### Risks & Mitigations
1. **Risk**: Users don't create scenes → **Mitigation**: Onboarding prompts, example scenes, AI coach helps
2. **Risk**: Geofencing drains battery → **Mitigation**: Opt-in only, background task optimization
3. **Risk**: Too many scenes → **Mitigation**: Limit to 10 active scenes, archive old ones
4. **Risk**: Privacy concerns with location → **Mitigation**: Clear opt-in, local-only storage, can revoke anytime

---

## M — Mission (What to Build)

### Core Features

#### 1. Scene Management
- **Create Scene**: User defines situation (e.g., "Home alone after 10pm")
- **Edit Scene**: Modify triggers, actions, message
- **Delete Scene**: Archive or permanently delete
- **List Scenes**: View all scenes, filter by active/inactive

#### 2. Scene Structure
Each scene contains:
- **Label**: Human-readable name ("Home alone after 10pm")
- **Description**: Optional context
- **Triggers**: What tends to happen (thoughts, feelings, people, places)
- **Early Warning Signs**: Body cues, obsessive thinking
- **Actions**: Top 3 replacement actions (call friend, tool, meeting, etc.)
- **Message**: From "sober me" to "struggling me"
- **Time Triggers**: Optional (day of week, time range)
- **Location Trigger**: Optional (geofencing, opt-in)

#### 3. Scene Activation
- **Manual**: User opens app, selects "I'm in a scene" → shows scene playbook
- **Time-Based**: Notification at risky time ("This is one of your risky times. Want to open your 'Payday Scene'?")
- **Location-Based**: Background task detects location → opens scene (opt-in, future)

#### 4. Scene Usage Tracking
- Track when scenes are used
- Track which actions were taken
- Track outcomes (did it help?)
- Use data to refine scenes

### Success Metrics
- **Scene Creation**: 50%+ of users create at least 1 scene
- **Scene Usage**: 30%+ of users use scenes weekly
- **Action Completion**: 60%+ of users complete at least 1 action when scene activated
- **Retention Impact**: Users with scenes have 2x higher retention

---

## A — Actions (Step-by-Step Implementation)

### A0. Sanity & Risk Pass
**Challenge Thinking:**
- Why would users create scenes? → Answer: They know their patterns, app helps them prepare proactively
- What if they don't know their triggers? → Answer: AI coach helps identify patterns from journal/cravings data
- What if geofencing is denied? → Answer: Time-based triggers still work, manual selection always available

**Top Risks:**
1. Geofencing permission denied → Mitigation: Time-based triggers, manual selection
2. Battery drain → Mitigation: Efficient background tasks, opt-in only
3. Too complex → Mitigation: Simple wizard, example scenes, AI coach helps
4. Privacy concerns → Mitigation: Clear opt-in, local-only, can revoke

### A1. Type System

**File**: `client/src/types.ts`

```typescript
export interface RecoveryScene {
  id: string;
  label: string; // "Home alone after 10pm", "Day after payday"
  description?: string;
  
  // Triggers & Context
  triggers: string[]; // ["loneliness", "boredom", "stress", "financial stress"]
  earlyWarningSigns: string[]; // ["tight chest", "racing thoughts", "fantasizing", "restlessness"]
  
  // Actions & Replacements
  actions: SceneAction[]; // Ordered list of actions to take
  messageFromSoberMe: string; // "Remember: This feeling is temporary..."
  
  // Metadata
  createdAtISO: string;
  updatedAtISO: string;
  lastUsedISO?: string;
  usageCount: number;
  active: boolean;
  
  // Optional: Time Triggers
  timeTriggers?: {
    dayOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    timeRange?: { start: string; end: string }; // "20:00" - "23:00" (24-hour format)
  };
  
  // Optional: Location Trigger (future, opt-in)
  locationTrigger?: {
    lat: number;
    lng: number;
    radiusM: number; // meters
    label: string; // "Home", "Work", "Dealer's area"
  };
}

export interface SceneAction {
  id: string;
  type: "call" | "text" | "tool" | "reminder" | "custom" | "meeting";
  label: string; // "Call Sarah", "Do breathing exercise", "Go to meeting"
  data: string; // phone number, tool name, custom text, meeting ID
  contactId?: string; // If type is "call" or "text", reference FellowshipContact
  order: number; // Display order (1, 2, 3)
}

export interface SceneUsage {
  id: string;
  sceneId: string;
  activatedAtISO: string;
  activationType: "manual" | "time-trigger" | "location-trigger";
  actionsCompleted: string[]; // SceneAction IDs
  outcome?: "helped" | "partial" | "didnt-help";
  notes?: string;
}

// Add to AppState
export interface AppState {
  // ... existing fields
  recoveryScenes: Record<string, RecoveryScene>; // id -> scene
  sceneUsages: Record<string, SceneUsage>; // id -> usage
}
```

### A2. State Management

**File**: `client/src/store/useAppStore.ts`

**Add Actions:**
```typescript
// Scene CRUD
createRecoveryScene: (scene: Omit<RecoveryScene, 'id' | 'createdAtISO' | 'updatedAtISO' | 'usageCount'>) => string; // Returns scene ID
updateRecoveryScene: (sceneId: string, updates: Partial<RecoveryScene>) => void;
deleteRecoveryScene: (sceneId: string) => void;
getRecoveryScene: (sceneId: string) => RecoveryScene | undefined;
getAllRecoveryScenes: () => RecoveryScene[];
getActiveRecoveryScenes: () => RecoveryScene[];

// Scene Usage
activateScene: (sceneId: string, activationType: SceneUsage['activationType']) => void;
completeSceneAction: (sceneId: string, actionId: string) => void;
recordSceneOutcome: (usageId: string, outcome: SceneUsage['outcome'], notes?: string) => void;

// Scene Suggestions
getScenesForTime: (date: Date) => RecoveryScene[]; // Scenes with time triggers matching current time
getScenesForContext: (mood?: number, craving?: number, context?: string[]) => RecoveryScene[]; // AI-suggested scenes
```

### A3. UI Components

#### A3.1 Scene List Component

**File**: `client/src/components/recovery-scenes/SceneList.tsx`

**Features:**
- List all scenes (active first)
- Filter by active/inactive
- Search scenes
- Quick actions: Create, Edit, Delete, Activate
- Show usage count, last used date

**UI Design:**
- Card-based layout
- Each card shows: Label, Description, Active status, Usage count
- Tap to view/edit
- Swipe to delete (with confirmation)

#### A3.2 Scene Editor Component

**File**: `client/src/components/recovery-scenes/SceneEditor.tsx`

**Wizard Steps:**
1. **Basic Info**: Label, Description
2. **Triggers**: Add triggers (thoughts, feelings, people, places)
3. **Early Warning Signs**: Add body cues, obsessive thinking
4. **Actions**: Add up to 3 actions (call friend, tool, meeting, custom)
5. **Message**: Write message from "sober me"
6. **Triggers**: Optional time triggers, location trigger

**UI Design:**
- Multi-step wizard
- Progress indicator
- Save draft at each step
- Validation before proceeding

#### A3.3 Scene Playbook Component

**File**: `client/src/components/recovery-scenes/ScenePlaybook.tsx`

**Features:**
- Display scene when activated
- Show triggers and early warning signs
- List actions (large buttons, 44px+)
- Show message from "sober me"
- Track which actions completed
- Record outcome after use

**UI Design:**
- Full-screen modal
- Large, clear actions
- Can dismiss but shows reminder
- "Did this help?" prompt after use

#### A3.4 Scene Quick Access

**File**: `client/src/components/recovery-scenes/SceneQuickAccess.tsx`

**Features:**
- Floating action button: "I'm in a scene"
- Shows list of scenes (quick select)
- Can activate scene directly
- Shows suggested scenes based on time/context

**UI Design:**
- Bottom sheet or modal
- Quick selection interface
- Shows "Suggested for right now" if time triggers match

### A4. Integration Points

#### A4.1 Home Screen Integration

**File**: `client/src/routes/Home.tsx`

**Changes:**
- Add "I'm in a scene" button (floating action or card)
- Show active scenes count
- Show suggested scene if time trigger matches

#### A4.2 Emergency Screen Integration

**File**: `client/src/routes/Emergency.tsx`

**Changes:**
- Add "Open Recovery Scene" action
- If scene activated, show scene playbook instead of generic emergency

#### A4.3 Notification Integration

**File**: `client/src/service-worker.ts`

**Enhance:**
- Check time triggers for active scenes
- Send notification: "This is one of your risky times. Want to open your '[Scene Name]'?"
- User taps → opens scene playbook

**Settings:**
- Add to `NotificationSettings`:
  ```typescript
  sceneReminders: {
    enabled: boolean;
    respectQuietHours: boolean;
  };
  ```

#### A4.4 Location Integration (Future)

**File**: `client/src/lib/location.ts` (NEW)

**Features:**
- Request geofencing permission (opt-in)
- Register background task for location monitoring
- Detect when user enters/exits scene location
- Trigger scene activation

**Privacy:**
- Clear opt-in flow
- Explain why location needed
- Can revoke anytime
- Local-only storage

### A5. AI Coach Integration

**File**: `client/src/lib/scene-coach.ts` (NEW)

**Features:**
- Analyze journal entries, cravings, daily cards
- Identify patterns: "You've logged high cravings 4 times in 'Home alone at night' situations"
- Suggest scene creation: "Would you like to create a scene for 'Home alone at night'?"
- Suggest scene improvements: "You've used this scene 3 times but didn't complete actions. Want to try different actions?"

**Integration:**
- Call from Recovery Copilot
- Show suggestions in Scene List
- Help refine scenes based on usage data

### A6. Testing

**Unit Tests:**
- `client/src/lib/__tests__/recovery-scenes.test.ts`
  - Test scene CRUD
  - Test time trigger matching
  - Test scene activation
  - Test usage tracking

**Integration Tests:**
- `client/src/components/__tests__/SceneEditor.test.tsx`
  - Test wizard flow
  - Test validation
  - Test save/load

**E2E Tests:**
- Create scene → Activate scene → Complete actions → Record outcome
- Time trigger → Notification → Open scene
- Location trigger → Background task → Scene activation

---

## D — Deliverables (What Must Exist)

### Code Deliverables
1. ✅ `RecoveryScene` and `SceneAction` types
2. ✅ Scene CRUD actions in Zustand store
3. ✅ `SceneList` component
4. ✅ `SceneEditor` component (wizard)
5. ✅ `ScenePlaybook` component
6. ✅ `SceneQuickAccess` component
7. ✅ Integration with Home screen
8. ✅ Integration with Emergency screen
9. ✅ Notification system for time triggers
10. ✅ Usage tracking and analytics

### UX Deliverables
1. ✅ Users can create scene in <2 minutes
2. ✅ Scene activation is <3 taps
3. ✅ Scene playbook is clear and actionable
4. ✅ All components accessible (keyboard, screen reader)
5. ✅ Mobile-responsive

### Data Deliverables
1. ✅ Scenes stored locally (Zustand)
2. ✅ Usage data tracked
3. ✅ Analytics events fire correctly

### Documentation Deliverables
1. ✅ README update: How Recovery Scenes work
2. ✅ User guide: How to create effective scenes
3. ✅ Developer notes: How to extend scene features

---

## Success Criteria

### Must Have (MVP)
- [ ] Users can create scenes (label, triggers, actions, message)
- [ ] Users can edit/delete scenes
- [ ] Users can manually activate scenes
- [ ] Scene playbook displays clearly
- [ ] Actions can be completed from playbook
- [ ] Usage tracked

### Should Have (Enhanced)
- [ ] Time triggers (day of week, time range)
- [ ] Time-based notifications
- [ ] Scene suggestions based on context
- [ ] AI coach helps create/refine scenes

### Nice to Have (Future)
- [ ] Location triggers (geofencing)
- [ ] Background location monitoring
- [ ] Scene templates
- [ ] Share scenes with sponsor

---

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: Type system + state management
- Day 3-4: Scene List + Scene Editor (basic)
- Day 5: Scene Playbook component

### Week 2: Integration
- Day 1-2: Quick Access + Home integration
- Day 3: Emergency integration
- Day 4: Usage tracking
- Day 5: Testing + polish

### Week 3: Enhancement
- Day 1-2: Time triggers
- Day 3: Notifications
- Day 4-5: AI coach integration

### Week 4: Future Features (Optional)
- Day 1-3: Location triggers (geofencing)
- Day 4-5: Background tasks

---

## Notes & Considerations

### Privacy
- All scenes stored locally
- Location data is opt-in only
- Can revoke location permission anytime
- No sharing without explicit user action

### Accessibility
- All components WCAG 2.2 AA compliant
- Keyboard navigation required
- Screen reader support required
- Large touch targets (44px+)

### Performance
- Scene list should load instantly
- Background tasks optimized for battery
- Geofencing uses efficient location APIs

### Edge Cases
- What if user creates 20 scenes? → Limit to 10 active, archive rest
- What if time trigger fires but user dismisses? → Don't spam, respect quiet hours
- What if location permission denied? → Time triggers still work, manual selection available

---

**Status**: Ready for Implementation
**Priority**: P0 (Highest Impact, Unique Differentiator)
**Estimated Effort**: 3-4 weeks (MVP: 2 weeks)
**Dependencies**: None (can build standalone)

