# Just-in-Time Recovery Engine (JITAI) - BMAD Build Plan

## B — Background (Context, Constraints, Guardrails)

### Context
The JITAI (Just-in-Time Adaptive Intervention) Engine provides proactive support by detecting risk patterns and delivering timely interventions. Research shows JITAIs significantly improve outcomes for addictive behaviors by learning when and how to nudge users.

### Current State
- ✅ Basic notification system exists (`client/src/service-worker.ts`)
- ✅ Daily cards track mood/cravings
- ✅ Journal entries track triggers
- ✅ Streak tracking exists
- ❌ No risk detection
- ❌ No adaptive interventions
- ❌ No explainable AI suggestions

### Hard Constraints
- **Privacy-First**: All risk scoring runs client-side (no cloud processing)
- **Explainable**: Every suggestion must show reasoning ("I suggested this because...")
- **User-Defined**: Users control risk rules (not black-box predictions)
- **Offline-First**: Risk detection works offline
- **No Creepy Predictions**: Never say "you will relapse" - frame as "you told me these patterns mean you might be struggling"

### Principles
- **BMAD**: Operate in Background → Mission → Actions → Deliverables cycles
- **Challenge Assumptions**: Why would users trust AI suggestions? Answer: Transparency, user-defined rules, explainable reasoning
- **Ship Small**: Start with rule-based, add learning later

### Risks & Mitigations
1. **Risk**: Feels creepy/predictive → **Mitigation**: Frame as "you told me", show reasoning, user-defined rules
2. **Risk**: Too many notifications → **Mitigation**: Respect quiet hours, limit frequency, opt-in
3. **Risk**: False positives → **Mitigation**: Conservative thresholds, user feedback loop
4. **Risk**: Privacy concerns → **Mitigation**: All processing client-side, no cloud

---

## M — Mission (What to Build)

### Core Features

#### 1. Risk Signal Detection
- **Pattern Recognition**: Analyze daily cards, journal entries, cravings
- **Risk Scoring**: Calculate risk score (0-100) based on patterns
- **Signal Types**: High cravings, low mood, skipped meetings, isolation, trigger scenes
- **Threshold Detection**: Trigger when risk exceeds user-defined threshold

#### 2. Adaptive Interventions
- **Just-in-Time Suggestions**: Show suggestions at the right moment
- **Personalized Actions**: Learn what works for each user
- **Context-Aware**: Different suggestions for different situations
- **Explainable**: Show why each suggestion was made

#### 3. Learning System
- **Feedback Loop**: Track if suggestions helped
- **Personal Playbook**: Learn user's effective strategies
- **A/B Testing**: Test different interventions per user
- **Continuous Improvement**: Refine suggestions over time

#### 4. User-Defined Rules
- **Custom Thresholds**: Users set their own risk thresholds
- **Rule Builder**: Visual interface to create rules
- **Default Rules**: Sensible defaults that users can modify
- **Rule Testing**: Test rules before activating

### Success Metrics
- **Risk Detection Accuracy**: 70%+ of high-risk periods detected
- **Intervention Effectiveness**: 60%+ of users find suggestions helpful
- **Retention Impact**: 2-3x higher retention for users with JITAI
- **False Positive Rate**: <20% false positives

---

## A — Actions (Step-by-Step Implementation)

### A0. Sanity & Risk Pass
**Challenge Thinking:**
- Why would users trust AI suggestions? → Answer: Transparency, user-defined rules, explainable reasoning
- What if suggestions are wrong? → Answer: User feedback loop, conservative thresholds, can dismiss
- What about privacy? → Answer: All processing client-side, no cloud

**Top Risks:**
1. Feels creepy → Mitigation: Frame as "you told me", show reasoning, user-defined rules
2. Too many notifications → Mitigation: Respect quiet hours, limit frequency, opt-in
3. False positives → Mitigation: Conservative thresholds, user feedback
4. Privacy concerns → Mitigation: All processing client-side

### A1. Type System

**File**: `client/src/types.ts`

```typescript
export interface RiskSignal {
  id: string;
  type: "high-cravings" | "low-mood" | "skipped-meetings" | "isolation" | "trigger-scene" | "custom";
  severity: number; // 0-100
  detectedAtISO: string;
  inputs: Record<string, any>; // What triggered this signal
  suggestedActions: string[]; // Action IDs or tool names
  dismissedAtISO?: string;
  actedUponAtISO?: string;
  outcome?: "helped" | "partial" | "didnt-help";
}

export interface JITAIRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: {
    type: "craving-threshold" | "mood-trend" | "meeting-gap" | "scene-usage" | "custom";
    threshold: number;
    windowDays: number; // Look back window
    operator: "greater-than" | "less-than" | "equals" | "trending-down" | "trending-up";
  };
  action: {
    type: "show-safety-plan" | "suggest-meeting" | "open-scene" | "suggest-tool" | "send-message" | "custom";
    data: string; // Scene ID, tool name, message text, etc.
    priority: number; // 1-5, higher = more urgent
  };
  explanation: string; // Shown to user: "I suggested this because..."
  createdAtISO: string;
  lastTriggeredAtISO?: string;
  triggerCount: number;
  effectivenessScore?: number; // Based on user feedback
}

export interface InterventionFeedback {
  id: string;
  signalId: string;
  ruleId: string;
  interventionType: string;
  helpful: boolean;
  notes?: string;
  timestampISO: string;
}

// Add to AppState
export interface AppState {
  // ... existing fields
  riskSignals: Record<string, RiskSignal>; // id -> signal
  jitaiRules: Record<string, JITAIRule>; // id -> rule
  interventionFeedback: Record<string, InterventionFeedback>; // id -> feedback
}
```

### A2. State Management

**File**: `client/src/store/useAppStore.ts`

**Add Actions:**
```typescript
// Risk Detection
detectRiskSignals: () => RiskSignal[]; // Analyze current state, return new signals
dismissRiskSignal: (signalId: string) => void;
actOnRiskSignal: (signalId: string, actionId: string) => void;
recordInterventionFeedback: (signalId: string, helpful: boolean, notes?: string) => void;

// Rule Management
createJITAIRule: (rule: Omit<JITAIRule, 'id' | 'createdAtISO' | 'triggerCount'>) => string;
updateJITAIRule: (ruleId: string, updates: Partial<JITAIRule>) => void;
deleteJITAIRule: (ruleId: string) => void;
getActiveJITAIRules: () => JITAIRule[];

// Learning
updateRuleEffectiveness: (ruleId: string) => void; // Recalculate based on feedback
getPersonalizedSuggestions: (context: { mood?: number; craving?: number; scene?: string }) => string[]; // Get suggestions for context
```

### A3. Risk Detection Engine

**File**: `client/src/lib/jitai-engine.ts` (NEW)

**Features:**
- Analyze daily cards for patterns (high cravings, low mood)
- Analyze journal entries for triggers
- Analyze meeting attendance (skipped meetings)
- Analyze scene usage (frequent scene activations)
- Calculate risk scores
- Match against JITAI rules
- Generate explainable suggestions

**Implementation:**
```typescript
export function detectRiskSignals(
  dailyCards: Record<string, DailyCard>,
  journalEntries: Record<string, JournalEntry>,
  meetings: Meeting[],
  scenes: Record<string, RecoveryScene>,
  rules: Record<string, JITAIRule>
): RiskSignal[] {
  // Analyze patterns
  // Match against rules
  // Generate signals with explanations
  // Return new signals
}

export function calculateRiskScore(
  recentCravings: number[],
  recentMood: number[],
  meetingGap: number,
  sceneUsage: number
): number {
  // Weighted risk calculation
  // Return 0-100 score
}
```

### A4. UI Components

#### A4.1 Risk Signal Card Component

**File**: `client/src/components/jitai/RiskSignalCard.tsx`

**Features:**
- Display risk signal
- Show explanation ("I noticed...")
- Show suggested actions
- Dismiss or act on signal
- Record feedback

**UI Design:**
- Card with risk level indicator (color-coded)
- Clear explanation: "I noticed you've logged high cravings 3 nights in a row"
- Suggested actions (large buttons)
- "Dismiss" or "This helped" buttons
- Non-intrusive (can dismiss, doesn't block app)

#### A4.2 Rule Builder Component

**File**: `client/src/components/jitai/RuleBuilder.tsx`

**Features:**
- Visual rule builder
- Condition builder (if X then Y)
- Action builder (what to suggest)
- Explanation builder (what to tell user)
- Test rule before saving

**UI Design:**
- Wizard flow: Condition → Action → Explanation → Test
- Visual condition builder (dropdowns, sliders)
- Action selector (safety plan, meeting, tool, etc.)
- Explanation text input
- Test button (shows what would trigger)

#### A4.3 Intervention Suggestions Component

**File**: `client/src/components/jitai/InterventionSuggestions.tsx`

**Features:**
- Show suggestions when risk detected
- Explain why each suggestion
- Quick actions (tap to act)
- Feedback prompt ("Did this help?")

**UI Design:**
- Bottom sheet or modal
- List of suggestions with explanations
- Large action buttons
- "Dismiss" option
- Feedback prompt after action

### A5. Integration Points

#### A5.1 Home Screen Integration

**File**: `client/src/routes/Home.tsx`

**Changes:**
- Check for risk signals on mount
- Show risk signal card if detected
- Show intervention suggestions
- Non-blocking (can dismiss)

#### A5.2 Notification Integration

**File**: `client/src/service-worker.ts`

**Enhance:**
- Check risk signals periodically
- Send notification if high-risk signal detected
- Include explanation in notification
- Respect quiet hours

**Settings:**
- Add to `NotificationSettings`:
  ```typescript
  jitaiNotifications: {
    enabled: boolean;
    respectQuietHours: boolean;
    maxPerDay: number; // Limit notifications
  };
  ```

#### A5.3 Daily Card Integration

**File**: `client/src/components/recovery-rhythm/MiddayPulseCheck.tsx`

**Changes:**
- After pulse check, check for risk signals
- If high risk detected, show suggestions immediately
- Explain why suggestions shown

#### A5.4 Recovery Scenes Integration

**File**: `client/src/components/recovery-scenes/ScenePlaybook.tsx`

**Changes:**
- Track scene usage
- If scene used frequently, suggest rule creation
- Show risk signal if scene used but actions not completed

### A6. Learning System

**File**: `client/src/lib/jitai-learning.ts` (NEW)

**Features:**
- Track intervention effectiveness
- Calculate effectiveness scores per rule
- Learn which actions work best for user
- Personalize suggestion order
- A/B test different interventions

**Implementation:**
```typescript
export function updateRuleEffectiveness(
  ruleId: string,
  feedback: InterventionFeedback[]
): number {
  // Calculate effectiveness score
  // Based on helpful/didn't help ratio
  // Return 0-100 score
}

export function personalizeSuggestions(
  context: Context,
  rules: JITAIRule[],
  feedback: InterventionFeedback[]
): string[] {
  // Order suggestions by effectiveness
  // Prioritize actions that worked before
  // Return ordered list
}
```

### A7. Testing

**Unit Tests:**
- `client/src/lib/__tests__/jitai-engine.test.ts`
  - Test risk detection
  - Test rule matching
  - Test suggestion generation
  - Test learning system

**Integration Tests:**
- `client/src/components/__tests__/RiskSignalCard.test.tsx`
  - Test signal display
  - Test action handling
  - Test feedback recording

**E2E Tests:**
- High cravings detected → Signal shown → User acts → Feedback recorded
- Rule created → Rule triggers → Suggestion shown → User feedback

---

## D — Deliverables (What Must Exist)

### Code Deliverables
1. ✅ `RiskSignal`, `JITAIRule`, `InterventionFeedback` types
2. ✅ Risk detection engine (`jitai-engine.ts`)
3. ✅ Learning system (`jitai-learning.ts`)
4. ✅ `RiskSignalCard` component
5. ✅ `RuleBuilder` component
6. ✅ `InterventionSuggestions` component
7. ✅ Integration with Home, Daily Cards, Scenes
8. ✅ Notification system for risk signals
9. ✅ Analytics events for interventions

### UX Deliverables
1. ✅ Risk signals are non-intrusive (can dismiss)
2. ✅ Explanations are clear ("I noticed...")
3. ✅ Suggestions are actionable (<2 taps)
4. ✅ All components accessible (keyboard, screen reader)
5. ✅ Mobile-responsive

### Data Deliverables
1. ✅ Risk signals stored locally (Zustand)
2. ✅ Rules stored locally
3. ✅ Feedback tracked
4. ✅ Learning improves over time

### Documentation Deliverables
1. ✅ README update: How JITAI works
2. ✅ User guide: How to create rules
3. ✅ Developer notes: Risk detection algorithm

---

## Success Criteria

### Must Have (MVP)
- [ ] Risk signals detected (high cravings, low mood, skipped meetings)
- [ ] Rules can be created (visual builder)
- [ ] Suggestions shown when risk detected
- [ ] Explanations shown ("I noticed...")
- [ ] Feedback can be recorded
- [ ] All processing client-side

### Should Have (Enhanced)
- [ ] Learning system (effectiveness tracking)
- [ ] Personalized suggestions (based on what works)
- [ ] A/B testing (test different interventions)
- [ ] Advanced rules (custom conditions)

### Nice to Have (Future)
- [ ] ML-based risk prediction (with user consent)
- [ ] Predictive interventions (before risk occurs)
- [ ] Sponsor notifications (if high risk)
- [ ] Integration with wearables (heart rate, sleep)

---

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: Type system + risk detection engine
- Day 3-4: Rule builder component
- Day 5: Basic risk signal detection

### Week 2: Integration
- Day 1-2: Risk signal card + intervention suggestions
- Day 3: Integration with Home, Daily Cards
- Day 4: Notification system
- Day 5: Testing + polish

### Week 3: Learning
- Day 1-2: Feedback system
- Day 3-4: Learning algorithm
- Day 5: Personalization

### Week 4: Enhancement (Optional)
- Day 1-3: Advanced rules
- Day 4-5: A/B testing

---

## Notes & Considerations

### Privacy
- All processing client-side (no cloud)
- No data sent to servers
- User controls all rules
- Can disable JITAI anytime

### Accessibility
- All components WCAG 2.2 AA compliant
- Keyboard navigation required
- Screen reader support required
- Clear explanations (not technical jargon)

### Performance
- Risk detection should be <100ms
- No blocking operations
- Background processing (don't block UI)

### Edge Cases
- What if no rules defined? → Use sensible defaults, prompt user to create
- What if all rules disabled? → Don't show signals, but still track data
- What if false positive? → User can dismiss, feedback improves accuracy
- What if too many signals? → Limit frequency, prioritize by severity

---

**Status**: Ready for Implementation
**Priority**: P1 (High Impact, Builds on Existing Features)
**Estimated Effort**: 3-4 weeks (MVP: 2 weeks)
**Dependencies**: Daily Cards, Journal, Meetings, Scenes

