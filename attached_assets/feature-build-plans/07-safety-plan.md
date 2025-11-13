# Recovery Safety Plan Feature - BMAD Build Plan

## B — Background (Context, Constraints, Guardrails)

### Context
The Recovery Safety Plan is a crisis support tool that users build when stable, then the app surfaces at the right time. Research shows safety plans significantly reduce crisis escalation and build trust during vulnerable moments. This feature transforms crisis support from reactive to proactive.

### Current State
- ✅ Emergency screen exists (`client/src/routes/Emergency.tsx`)
- ✅ Emergency actions configurable
- ✅ Crisis hotlines available
- ✅ Breathing exercises exist
- ❌ No structured safety plan
- ❌ No proactive surfacing
- ❌ No personal crisis protocol

### Hard Constraints
- **Privacy-First**: Safety plan stored locally
- **Always Accessible**: Must be accessible even offline
- **Crisis-Ready**: Must load instantly (<100ms)
- **Accessibility**: WCAG 2.2 AA compliance, works when user is distressed
- **No Medical Claims**: Safety plan is a tool, not medical advice

### Principles
- **BMAD**: Operate in Background → Mission → Actions → Deliverables cycles
- **Challenge Assumptions**: Why not just use emergency screen? Answer: Personalized, proactive, built when stable
- **Ship Small**: Start with basic plan, add proactive surfacing later

### Risks & Mitigations
1. **Risk**: Users don't create plan → **Mitigation**: Onboarding prompts, example plans, make it easy
2. **Risk**: Plan not surfaced when needed → **Mitigation**: JITAI integration, manual trigger always available
3. **Risk**: Plan feels clinical → **Mitigation**: Personal language, user's own words, recovery-focused
4. **Risk**: Privacy concerns → **Mitigation**: All data local, no sharing without explicit action

---

## M — Mission (What to Build)

### Core Features

#### 1. Safety Plan Builder
- **People to Contact**: 3 people user can call/text (sponsor, recovery friends, crisis line)
- **Reasons Not to Use**: 3 reasons user doesn't want to use (personal, recovery-focused)
- **Actions Before Using**: 3 actions to take before picking up (walk, shower, meeting, prayer, etc.)
- **Personal Message**: Message from "sober me" to "struggling me"
- **Crisis Resources**: Regional crisis hotlines, warmlines, resources

#### 2. Plan Surfacing
- **Manual Trigger**: Always accessible via SOS button
- **Proactive Trigger**: JITAI detects high risk → surfaces plan
- **Scene Integration**: Can be triggered from Recovery Scenes
- **Quick Access**: One-tap access from anywhere in app

#### 3. Plan Display
- **Crisis Mode**: Full-screen, minimal UI, large buttons
- **Clear Actions**: 3-4 giant options (call, text, action, resource)
- **Personal Message**: Prominent display of user's message
- **No Cognitive Load**: Simple, clear, actionable

#### 4. Plan Updates
- **Edit Anytime**: Can update plan when stable
- **Version History**: Track plan changes
- **Effectiveness Tracking**: Track if plan helped when used
- **Refinement**: Help refine plan based on usage

### Success Metrics
- **Plan Creation**: 70%+ of users create safety plan
- **Plan Usage**: 40%+ of users use plan during crisis
- **Effectiveness**: 80%+ of users find plan helpful
- **Retention Impact**: Higher retention for users with plans

---

## A — Actions (Step-by-Step Implementation)

### A0. Sanity & Risk Pass
**Challenge Thinking:**
- Why not just use emergency screen? → Answer: Personalized, proactive, built when stable
- What if user doesn't create plan? → Answer: Onboarding prompts, example plans, make it easy
- What if plan not surfaced? → Answer: JITAI integration, manual trigger always available

**Top Risks:**
1. Users don't create → Mitigation: Onboarding prompts, examples, easy builder
2. Not surfaced when needed → Mitigation: JITAI, manual trigger, always accessible
3. Feels clinical → Mitigation: Personal language, user's words, recovery-focused
4. Privacy concerns → Mitigation: All data local, no sharing

### A1. Type System

**File**: `client/src/types.ts`

```typescript
export interface SafetyPlan {
  id: string;
  version: number;
  
  // People to Contact
  contacts: SafetyPlanContact[]; // Up to 3
  crisisHotline?: string; // Regional crisis hotline
  
  // Reasons Not to Use
  reasonsNotToUse: string[]; // Up to 3, user's own words
  
  // Actions Before Using
  actionsBeforeUsing: SafetyPlanAction[]; // Up to 3
  
  // Personal Message
  messageFromSoberMe: string; // User's message to struggling self
  
  // Crisis Resources
  crisisResources: CrisisResource[]; // Regional resources
  
  // Metadata
  createdAtISO: string;
  updatedAtISO: string;
  lastUsedISO?: string;
  usageCount: number;
  active: boolean;
}

export interface SafetyPlanContact {
  id: string;
  name: string;
  phone?: string;
  relationship: "sponsor" | "recovery-friend" | "family" | "crisis-line" | "other";
  order: number; // Display order (1, 2, 3)
}

export interface SafetyPlanAction {
  id: string;
  label: string; // "Go for a walk", "Take a shower", "Go to a meeting"
  type: "call" | "text" | "tool" | "meeting" | "custom";
  data?: string; // Phone number, tool name, meeting finder, custom text
  order: number; // Display order (1, 2, 3)
}

export interface CrisisResource {
  id: string;
  name: string; // "Crisis Text Line", "988 Suicide & Crisis Lifeline"
  phone?: string;
  text?: string; // Text line number
  website?: string;
  description?: string;
  region?: string; // "US", "AU", "UK", etc.
}

export interface SafetyPlanUsage {
  id: string;
  planId: string;
  activatedAtISO: string;
  activationType: "manual" | "jitai" | "scene";
  actionsCompleted: string[]; // Action IDs completed
  contactedPerson?: string; // Contact ID if contacted someone
  outcome?: "helped" | "partial" | "didnt-help";
  notes?: string;
}

// Add to AppState
export interface AppState {
  // ... existing fields
  safetyPlan?: SafetyPlan;
  safetyPlanUsages: Record<string, SafetyPlanUsage>; // id -> usage
}
```

### A2. State Management

**File**: `client/src/store/useAppStore.ts`

**Add Actions:**
```typescript
// Safety Plan CRUD
createSafetyPlan: (plan: Omit<SafetyPlan, 'id' | 'version' | 'createdAtISO' | 'updatedAtISO' | 'usageCount'>) => void;
updateSafetyPlan: (updates: Partial<SafetyPlan>) => void;
getSafetyPlan: () => SafetyPlan | undefined;
deleteSafetyPlan: () => void;

// Safety Plan Usage
activateSafetyPlan: (activationType: SafetyPlanUsage['activationType']) => void;
completeSafetyPlanAction: (actionId: string) => void;
contactSafetyPlanPerson: (contactId: string) => void;
recordSafetyPlanOutcome: (usageId: string, outcome: SafetyPlanUsage['outcome'], notes?: string) => void;
```

### A3. UI Components

#### A3.1 Safety Plan Builder Component

**File**: `client/src/components/safety-plan/SafetyPlanBuilder.tsx`

**Features:**
- Multi-step wizard to build plan
- Step 1: People to contact (add from contacts or new)
- Step 2: Reasons not to use (text inputs, user's words)
- Step 3: Actions before using (select from tools or custom)
- Step 4: Personal message (text area, user's words)
- Step 5: Crisis resources (pre-populated by region, can add)
- Save and activate plan

**UI Design:**
- Wizard flow with progress indicator
- Large, clear inputs
- Helpful prompts ("What are 3 reasons you don't want to use?")
- Example plans available
- Can save draft and continue later

#### A3.2 Safety Plan Display Component

**File**: `client/src/components/safety-plan/SafetyPlanDisplay.tsx`

**Features:**
- Display plan in crisis mode (full-screen, minimal UI)
- Show personal message prominently
- List contacts (large buttons, one-tap call/text)
- List actions (large buttons, one-tap execute)
- Show crisis resources
- Track usage

**UI Design:**
- Full-screen modal
- Large buttons (44px+ touch targets)
- Minimal text, maximum clarity
- Personal message at top (large, readable)
- Actions below (clear, actionable)
- Can dismiss but shows reminder

#### A3.3 Safety Plan Quick Access

**File**: `client/src/components/safety-plan/SafetyPlanQuickAccess.tsx`

**Features:**
- Floating action button: "I Need Help"
- One-tap access to safety plan
- Always accessible from anywhere
- Can be triggered from SOS button

**UI Design:**
- Floating action button (bottom right or center)
- Large, visible, always accessible
- Taps → opens safety plan display
- Can be customized (color, position)

### A4. Integration Points

#### A4.1 Emergency Screen Integration

**File**: `client/src/routes/Emergency.tsx`

**Changes:**
- Add "Open Safety Plan" as primary action
- If plan exists, show plan instead of generic emergency
- If no plan, show plan builder prompt

#### A4.2 JITAI Integration

**File**: `client/src/lib/jitai-engine.ts`

**Changes:**
- When high risk detected, suggest safety plan
- "You told me these patterns mean you might be struggling. Want to open your Safety Plan?"
- One-tap to open plan

#### A4.3 Recovery Scenes Integration

**File**: `client/src/components/recovery-scenes/ScenePlaybook.tsx`

**Changes:**
- Add "Open Safety Plan" as action option
- Can trigger plan from scene
- Track which scenes lead to plan usage

#### A4.4 Onboarding Integration

**File**: `client/src/routes/Onboarding.tsx`

**Changes:**
- Add safety plan creation step (optional but recommended)
- Show example plan
- Make it easy to create
- Can skip but prompt later

### A5. Regional Crisis Resources

**File**: `client/src/lib/crisis-resources.ts` (NEW)

**Features:**
- Pre-populate crisis resources by region
- US: 988 Suicide & Crisis Lifeline, Crisis Text Line
- AU: Lifeline, Beyond Blue, etc.
- UK: Samaritans, etc.
- Can add custom resources

**Implementation:**
```typescript
export const CRISIS_RESOURCES: Record<string, CrisisResource[]> = {
  US: [
    { id: "988", name: "988 Suicide & Crisis Lifeline", phone: "988", text: "988", description: "Free, confidential support" },
    { id: "crisis-text", name: "Crisis Text Line", text: "741741", description: "Text HOME to 741741" },
    // ... more
  ],
  AU: [
    { id: "lifeline", name: "Lifeline", phone: "131114", description: "24/7 crisis support" },
    { id: "beyond-blue", name: "Beyond Blue", phone: "1300224636", description: "Mental health support" },
    // ... more
  ],
  // ... more regions
};

export function getCrisisResourcesForRegion(region: string): CrisisResource[] {
  return CRISIS_RESOURCES[region] || CRISIS_RESOURCES["US"]; // Default to US
}
```

### A6. Testing

**Unit Tests:**
- `client/src/lib/__tests__/safety-plan.test.ts`
  - Test plan creation
  - Test plan updates
  - Test plan activation
  - Test usage tracking

**Integration Tests:**
- `client/src/components/__tests__/SafetyPlanBuilder.test.tsx`
  - Test wizard flow
  - Test validation
  - Test save/load

**E2E Tests:**
- Create plan → Activate plan → Complete actions → Record outcome
- JITAI detects risk → Suggests plan → User opens plan → Completes actions

---

## D — Deliverables (What Must Exist)

### Code Deliverables
1. ✅ `SafetyPlan`, `SafetyPlanContact`, `SafetyPlanAction`, `CrisisResource` types
2. ✅ Safety plan CRUD actions in Zustand store
3. ✅ `SafetyPlanBuilder` component
4. ✅ `SafetyPlanDisplay` component
5. ✅ `SafetyPlanQuickAccess` component
6. ✅ Integration with Emergency screen
7. ✅ Integration with JITAI, Scenes
8. ✅ Regional crisis resources
9. ✅ Usage tracking and analytics

### UX Deliverables
1. ✅ Plan can be created in <5 minutes
2. ✅ Plan loads instantly (<100ms)
3. ✅ Plan display is clear and actionable (crisis mode)
4. ✅ All components accessible (keyboard, screen reader)
5. ✅ Mobile-responsive (large touch targets)

### Data Deliverables
1. ✅ Plan stored locally (Zustand)
2. ✅ Usage tracked
3. ✅ Analytics events fire correctly

### Documentation Deliverables
1. ✅ README update: How Safety Plan works
2. ✅ User guide: How to create effective safety plan
3. ✅ Developer notes: Crisis mode UI patterns

---

## Success Criteria

### Must Have (MVP)
- [ ] Users can create safety plan (contacts, reasons, actions, message)
- [ ] Plan can be activated manually (SOS button)
- [ ] Plan displays clearly (crisis mode)
- [ ] Actions can be completed (call, text, tool, meeting)
- [ ] Plan stored locally
- [ ] Always accessible

### Should Have (Enhanced)
- [ ] JITAI integration (proactive surfacing)
- [ ] Scene integration (trigger from scenes)
- [ ] Usage tracking (did plan help?)
- [ ] Plan refinement (update based on usage)

### Nice to Have (Future)
- [ ] Share plan with sponsor
- [ ] Multiple plans (different situations)
- [ ] Plan templates
- [ ] Integration with emergency services

---

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: Type system + state management
- Day 3-4: Safety plan builder component
- Day 5: Safety plan display component

### Week 2: Integration
- Day 1-2: Quick access + Emergency integration
- Day 3: JITAI integration
- Day 4: Scene integration
- Day 5: Testing + polish

### Week 3: Enhancement (Optional)
- Day 1-2: Usage tracking
- Day 3-4: Plan refinement
- Day 5: Documentation

---

## Notes & Considerations

### Privacy
- All data stored locally (no cloud sync)
- No sharing without explicit action
- Can delete plan anytime
- Regional resources are public data

### Accessibility
- All components WCAG 2.2 AA compliant
- Keyboard navigation required
- Screen reader support required
- Large touch targets (44px+)
- High contrast mode

### Performance
- Plan must load instantly (<100ms)
- No blocking operations
- Optimized for crisis situations

### Edge Cases
- What if user doesn't create plan? → Show generic emergency, prompt to create
- What if plan incomplete? → Show what's available, prompt to complete
- What if contacts unavailable? → Show other actions, crisis resources
- What if offline? → Plan still works (all local)

---

**Status**: Ready for Implementation
**Priority**: P0 (Critical for Crisis Support)
**Estimated Effort**: 2 weeks (MVP: 1 week)
**Dependencies**: Emergency screen, JITAI (optional), Scenes (optional)

