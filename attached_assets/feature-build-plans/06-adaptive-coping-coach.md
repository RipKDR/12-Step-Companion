# Adaptive Coping Coach Feature - BMAD Build Plan

## B — Background (Context, Constraints, Guardrails)

### Context
The Adaptive Coping Coach learns what coping tools actually work for each user by tracking tool usage and outcomes. Research shows personalized behavior change based on past response outperforms static interventions. This feature personalizes the Tools screen based on what helps each user most.

### Current State
- ✅ Emergency/Tools screen exists (`client/src/routes/Emergency.tsx`)
- ✅ Tools exist (breathing, TIPP, grounding, urge surfing, etc.)
- ✅ Tool usage can be tracked (implicitly)
- ❌ No outcome tracking
- ❌ No effectiveness calculation
- ❌ No personalized suggestions

### Hard Constraints
- **Privacy-First**: All effectiveness data stored locally
- **User Control**: Users control what data is tracked
- **Offline-First**: Effectiveness calculation works offline
- **Accessibility**: WCAG 2.2 AA compliance
- **No Medical Claims**: Tools are suggestions, not medical advice

### Principles
- **BMAD**: Operate in Background → Mission → Actions → Deliverables cycles
- **Challenge Assumptions**: Why track outcomes? Answer: Learn what works for each user, personalize suggestions
- **Ship Small**: Start with basic tracking, add learning later

### Risks & Mitigations
1. **Risk**: Feels like surveillance → **Mitigation**: Opt-in tracking, clear why, user controls
2. **Risk**: False correlations → **Mitigation**: Require multiple data points, conservative suggestions
3. **Risk**: Too complex → **Mitigation**: Simple UI, automatic tracking where possible
4. **Risk**: Privacy concerns → **Mitigation**: All data local, no cloud sync

---

## M — Mission (What to Build)

### Core Features

#### 1. Tool Usage Tracking
- **Automatic Tracking**: Track when tools are used
- **Context Capture**: Capture mood, craving, scene when tool used
- **Outcome Tracking**: Ask "Did this help?" after tool use
- **Timeline**: Track tool usage over time

#### 2. Effectiveness Calculation
- **Personal Effectiveness Score**: Calculate what works for each user
- **Context-Specific**: Learn what works in different situations
- **Trend Analysis**: Track effectiveness over time
- **Confidence Score**: Require multiple data points before suggesting

#### 3. Personalized Suggestions
- **Recommended Tools**: Show tools that work best for user
- **Context-Aware**: Suggest different tools for different situations
- **Personal Playbook**: "When cravings are 7+ at night, you do best with TIPP + walk"
- **Experiment Suggestions**: Propose weekly experiments to test new tools

#### 4. Insights & Analytics
- **Effectiveness Dashboard**: Show what works best
- **Pattern Recognition**: "You tend to do better with movement before grounding"
- **Trends**: Show effectiveness trends over time
- **Recommendations**: Suggest trying new tools or combinations

### Success Metrics
- **Tracking Rate**: 60%+ of tool uses tracked
- **Outcome Rate**: 50%+ of tracked uses have outcome feedback
- **Effectiveness Accuracy**: 70%+ of suggestions are helpful
- **Retention Impact**: 1.5x higher retention for users who use personalized suggestions

---

## A — Actions (Step-by-Step Implementation)

### A0. Sanity & Risk Pass
**Challenge Thinking:**
- Why track outcomes? → Answer: Learn what works for each user, personalize suggestions
- What if users don't want to track? → Answer: Opt-in, can disable, still show tools
- What about privacy? → Answer: All data local, no cloud sync

**Top Risks:**
1. Feels like surveillance → Mitigation: Opt-in, clear why, user controls
2. False correlations → Mitigation: Require multiple data points, conservative
3. Too complex → Mitigation: Simple UI, automatic tracking
4. Privacy concerns → Mitigation: All data local

### A1. Type System

**File**: `client/src/types.ts`

```typescript
export interface CopingToolUsage {
  id: string;
  toolName: string; // "breathing", "TIPP", "urge-surfing", "grounding", "walk", "call", etc.
  usedAtISO: string;
  context: {
    mood?: number; // 1-5 or 0-10
    craving?: number; // 0-10
    sceneId?: string; // If used in a Recovery Scene
    triggerType?: string; // "stress", "loneliness", "boredom", etc.
  };
  outcome?: {
    checkedAtISO: string; // When user checked outcome (10-15 min later)
    result: "better" | "same" | "worse";
    notes?: string;
    cravingChange?: number; // Change in craving (e.g., 8 -> 4 = -4)
    moodChange?: number; // Change in mood (e.g., 2 -> 4 = +2)
  };
}

export interface CopingToolEffectiveness {
  toolName: string;
  totalUses: number;
  betterCount: number;
  sameCount: number;
  worseCount: number;
  effectivenessScore: number; // Calculated: (better * 2 + same * 1) / totalUses, 0-2 scale
  averageCravingChange?: number; // Average change in craving
  averageMoodChange?: number; // Average change in mood
  bestContext: {
    mood?: number[]; // Mood ranges where tool works best
    craving?: number[]; // Craving ranges where tool works best
    scenes?: string[]; // Scenes where tool works best
    triggerTypes?: string[]; // Trigger types where tool works best
  };
  confidenceScore: number; // 0-1, based on sample size
  lastUpdatedISO: string;
}

export interface CopingToolRecommendation {
  toolName: string;
  reason: string; // "This has helped you before when cravings are 7+ at night"
  confidence: "high" | "medium" | "low";
  contextMatch: boolean; // Does current context match tool's best context?
}

// Add to AppState
export interface AppState {
  // ... existing fields
  copingToolUsage: Record<string, CopingToolUsage>; // id -> usage
  copingToolEffectiveness: Record<string, CopingToolEffectiveness>; // toolName -> effectiveness
}
```

### A2. State Management

**File**: `client/src/store/useAppStore.ts`

**Add Actions:**
```typescript
// Tool Usage Tracking
recordToolUsage: (toolName: string, context: CopingToolUsage['context']) => string; // Returns usage ID
recordToolOutcome: (usageId: string, outcome: CopingToolUsage['outcome']) => void;
getToolUsage: (toolName: string) => CopingToolUsage[];
getRecentToolUsage: (limit?: number) => CopingToolUsage[];

// Effectiveness Calculation
calculateToolEffectiveness: (toolName: string) => CopingToolEffectiveness;
updateAllEffectiveness: () => void; // Recalculate all tools

// Recommendations
getRecommendedTools: (context: { mood?: number; craving?: number; sceneId?: string }) => CopingToolRecommendation[];
getPersonalPlaybook: () => Record<string, string>; // "When X, try Y" format
```

### A3. Effectiveness Calculation Engine

**File**: `client/src/lib/coping-coach.ts` (NEW)

**Features:**
- Calculate effectiveness scores per tool
- Learn best contexts for each tool
- Generate personalized recommendations
- Build personal playbook

**Implementation:**
```typescript
export function calculateEffectiveness(
  usages: CopingToolUsage[]
): CopingToolEffectiveness {
  // Filter usages with outcomes
  // Calculate better/same/worse counts
  // Calculate effectiveness score
  // Identify best contexts
  // Calculate confidence score
  // Return effectiveness object
}

export function getRecommendations(
  context: Context,
  effectiveness: Record<string, CopingToolEffectiveness>
): CopingToolRecommendation[] {
  // Match context to tool's best contexts
  // Rank by effectiveness score
  // Filter by confidence (require min sample size)
  // Return recommendations
}

export function buildPersonalPlaybook(
  effectiveness: Record<string, CopingToolEffectiveness>
): Record<string, string> {
  // Extract patterns: "When X, tool Y works best"
  // Format as readable playbook
  // Return playbook object
}
```

### A4. UI Components

#### A4.1 Tool Outcome Prompt Component

**File**: `client/src/components/coping-coach/ToolOutcomePrompt.tsx`

**Features:**
- Show after tool use (10-15 min delay or manual)
- Ask "Did this help?"
- Capture outcome (better/same/worse)
- Optional: Capture craving/mood change
- Optional: Notes

**UI Design:**
- Non-intrusive notification or modal
- Simple buttons: "Better" / "Same" / "Worse"
- Optional: Sliders for craving/mood change
- Optional: Text input for notes
- Can dismiss (don't force)

#### A4.2 Recommended Tools Component

**File**: `client/src/components/coping-coach/RecommendedTools.tsx`

**Features:**
- Show recommended tools at top of Tools screen
- Explain why recommended ("This has helped you before...")
- Show effectiveness score
- Quick access buttons

**UI Design:**
- Card at top of Tools screen
- "Recommended for right now" section
- Large buttons for recommended tools
- Show reasoning below each tool
- Can collapse/expand

#### A4.3 Effectiveness Dashboard Component

**File**: `client/src/components/coping-coach/EffectivenessDashboard.tsx`

**Features:**
- Show effectiveness scores for all tools
- Show best contexts for each tool
- Show trends over time
- Show personal playbook

**UI Design:**
- List or grid of tools
- Effectiveness score (visual indicator)
- Best contexts listed
- Trends chart (optional)
- Personal playbook section

#### A4.4 Experiment Suggestion Component

**File**: `client/src/components/coping-coach/ExperimentSuggestion.tsx`

**Features:**
- Suggest weekly experiments
- "This week, when cravings are 6+ at night, try Tool A vs Tool B"
- Track experiment results
- Show which worked better

**UI Design:**
- Card with experiment proposal
- "Start Experiment" button
- Progress tracking during experiment
- Results summary at end

### A5. Integration Points

#### A5.1 Emergency/Tools Screen Integration

**File**: `client/src/routes/Emergency.tsx`

**Changes:**
- Add "Recommended Tools" section at top
- Track tool usage automatically
- Show outcome prompt after tool use
- Reorder tools by effectiveness (optional)

#### A5.2 Recovery Scenes Integration

**File**: `client/src/components/recovery-scenes/ScenePlaybook.tsx`

**Changes:**
- Track tool usage from scenes
- Suggest tools based on scene effectiveness
- Update scene actions based on what works

#### A5.3 Daily Rhythm Integration

**File**: `client/src/components/recovery-rhythm/MiddayPulseCheck.tsx`

**Changes:**
- If high craving detected, show recommended tools
- Suggest tools based on current context
- Track which tools suggested and used

#### A5.4 JITAI Integration

**File**: `client/src/lib/jitai-engine.ts`

**Changes:**
- Use coping coach recommendations in JITAI suggestions
- Learn which JITAI suggestions lead to tool use
- Improve JITAI based on tool effectiveness

### A6. Analytics & Insights

**File**: `client/src/lib/analytics.ts`

**Track Events:**
```typescript
// Coping Coach events
"tool_used" // toolName, context
"tool_outcome_recorded" // toolName, outcome
"tool_recommendation_shown" // toolName, reason
"tool_recommendation_used" // toolName
"experiment_started" // toolA, toolB, context
"experiment_completed" // winner, results
```

**Insights to Show:**
- "You've used [tool] X times, and it helped Y% of the time"
- "Your most effective tool is [tool] when [context]"
- "You tend to do better with [tool combination]"

### A7. Testing

**Unit Tests:**
- `client/src/lib/__tests__/coping-coach.test.ts`
  - Test effectiveness calculation
  - Test recommendation generation
  - Test playbook building
  - Test context matching

**Integration Tests:**
- `client/src/components/__tests__/ToolOutcomePrompt.test.tsx`
  - Test outcome recording
  - Test effectiveness update
  - Test recommendation update

**E2E Tests:**
- Use tool → Record outcome → See recommendation update
- Start experiment → Complete experiment → See results

---

## D — Deliverables (What Must Exist)

### Code Deliverables
1. ✅ `CopingToolUsage`, `CopingToolEffectiveness`, `CopingToolRecommendation` types
2. ✅ Effectiveness calculation engine (`coping-coach.ts`)
3. ✅ `ToolOutcomePrompt` component
4. ✅ `RecommendedTools` component
5. ✅ `EffectivenessDashboard` component
6. ✅ `ExperimentSuggestion` component
7. ✅ Integration with Emergency/Tools screen
8. ✅ Integration with Scenes, Daily Rhythm, JITAI
9. ✅ Analytics events for tool usage

### UX Deliverables
1. ✅ Tool usage tracked automatically (where possible)
2. ✅ Outcome prompt is non-intrusive (can dismiss)
3. ✅ Recommendations are clear and actionable
4. ✅ All components accessible (keyboard, screen reader)
5. ✅ Mobile-responsive

### Data Deliverables
1. ✅ Tool usage stored locally (Zustand)
2. ✅ Effectiveness calculated correctly
3. ✅ Recommendations generated accurately
4. ✅ Analytics events fire correctly

### Documentation Deliverables
1. ✅ README update: How Adaptive Coping Coach works
2. ✅ User guide: How to track tool effectiveness
3. ✅ Developer notes: Effectiveness algorithm

---

## Success Criteria

### Must Have (MVP)
- [ ] Tool usage tracked (automatic or manual)
- [ ] Outcome can be recorded (better/same/worse)
- [ ] Effectiveness calculated per tool
- [ ] Recommendations shown based on effectiveness
- [ ] All data stored locally

### Should Have (Enhanced)
- [ ] Context-specific recommendations
- [ ] Personal playbook generation
- [ ] Experiment suggestions
- [ ] Effectiveness dashboard

### Nice to Have (Future)
- [ ] Tool combination effectiveness
- [ ] Time-based recommendations (morning vs evening)
- [ ] Integration with wearables (heart rate, etc.)
- [ ] Share playbook with sponsor

---

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: Type system + effectiveness calculation engine
- Day 3-4: Tool usage tracking
- Day 5: Outcome prompt component

### Week 2: Recommendations
- Day 1-2: Recommendation generation
- Day 3: Recommended tools component
- Day 4: Integration with Tools screen
- Day 5: Testing + polish

### Week 3: Enhancement
- Day 1-2: Personal playbook
- Day 3: Experiment suggestions
- Day 4: Effectiveness dashboard
- Day 5: Integration with other features

### Week 4: Polish (Optional)
- Day 1-3: Advanced features
- Day 4-5: Optimization

---

## Notes & Considerations

### Privacy
- All data stored locally (no cloud sync)
- Opt-in tracking (can disable)
- User controls what's tracked
- No sharing without explicit action

### Accessibility
- All components WCAG 2.2 AA compliant
- Keyboard navigation required
- Screen reader support required
- Clear language (not technical)

### Performance
- Effectiveness calculation should be <100ms
- Recommendations should be instant
- No blocking operations

### Edge Cases
- What if no tool usage tracked? → Show all tools, no recommendations
- What if low sample size? → Require min 3 uses before recommending
- What if all tools ineffective? → Suggest trying new tools
- What if user disables tracking? → Still show tools, no recommendations

---

**Status**: Ready for Implementation
**Priority**: P1 (High Impact, Builds on Existing Tools)
**Estimated Effort**: 3 weeks (MVP: 2 weeks)
**Dependencies**: Emergency/Tools screen, Recovery Scenes, Daily Rhythm

