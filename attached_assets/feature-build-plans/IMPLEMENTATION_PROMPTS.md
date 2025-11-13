# Implementation Prompts - Copy-Paste Ready

Use these prompts to start implementing each feature. Each prompt follows BMAD methodology and references the detailed build plan.

---

## Feature 1: Recovery Rhythm

```
I'm implementing the Recovery Rhythm feature for the 12-Step Recovery Companion app. This feature creates three daily micro-interactions (morning, midday, night) totaling <3 minutes to transform the app into a daily habit.

📋 **Full Build Plan**: See `attached_assets/feature-build-plans/01-recovery-rhythm.md`

**B — Background**:
- Current state: Morning/evening cards exist in `DailyCard` type, `RoutinePanel` component displays them, streak tracking exists
- Missing: Midday pulse check, structured morning intention, structured evening inventory
- Constraints: Each interaction <2 minutes, offline-first, WCAG 2.2 AA, backward compatible

**M — Mission**:
Build three micro-interactions:
1. Morning "Set the Tone" (30s): Pick intention from 3 options + optional reminder
2. Midday "Pulse Check" (10-20s): Mood + craving sliders + context tag
3. Night "Tiny Inventory" (1-2min): Stayed clean? Stayed connected? Gratitude/improvement

**A — Actions** (Start Here):
1. **A0. Sanity & Risk Pass**: Review risks in build plan, confirm approach
2. **A1. Type System**: Enhance `DailyCard` in `client/src/types.ts` with new fields (morningIntention, middayPulseCheck, eveningStayedClean, etc.)
3. **A2. State Management**: Add actions to `client/src/store/useAppStore.ts` (setMorningIntention, setMiddayPulseCheck, setEveningInventory)
4. **A3. UI Components**: Create `MorningIntentionCard`, `MiddayPulseCheck`, `EveningInventoryCard` in `client/src/components/recovery-rhythm/`
5. **A4. Integration**: Enhance `RoutinePanel` and `Home.tsx` to show all 3 check-ins

**D — Deliverables**:
- Enhanced DailyCard type with Recovery Rhythm fields
- Three new components (morning, midday, evening)
- Updated RoutinePanel showing all check-ins
- Streak tracking for complete rhythm
- Migration script for existing data

**Key Files to Modify**:
- `client/src/types.ts` (enhance DailyCard)
- `client/src/store/useAppStore.ts` (add actions)
- `client/src/store/migrations.ts` (add migration)
- `client/src/components/recovery-rhythm/` (new components)
- `client/src/routes/Home.tsx` (integration)
- `client/src/components/home-panels/RoutinePanel.tsx` (enhancement)

**Success Criteria**: Morning intention <30s, midday <20s, evening <2min, all accessible, streak tracks complete rhythm.

Start with A0 (Sanity & Risk Pass), then proceed through A1-A4 step by step. Reference the full build plan for detailed implementation guidance.
```

---

## Feature 2: Recovery Scenes

```
I'm implementing the Recovery Scenes feature for the 12-Step Recovery Companion app. This feature creates situation-specific playbooks (e.g., "Home alone after 10pm", "Day after payday") that help users navigate high-risk moments proactively.

📋 **Full Build Plan**: See `attached_assets/feature-build-plans/02-recovery-scenes.md`

**B — Background**:
- Current state: Emergency screen exists, FellowshipContact type exists, Tools exist
- Missing: Situation-specific plans, scene management, time/location triggers
- Constraints: Privacy-first (geofencing opt-in), offline-first, WCAG 2.2 AA

**M — Mission**:
Build scene management system:
1. Create/edit/delete scenes (label, triggers, early warning signs, actions, message)
2. Manual activation ("I'm in a scene" button)
3. Time-based triggers (day of week, time range)
4. Usage tracking (when used, which actions completed, outcomes)

**A — Actions** (Start Here):
1. **A0. Sanity & Risk Pass**: Review risks, confirm privacy approach
2. **A1. Type System**: Add `RecoveryScene`, `SceneAction`, `SceneUsage` types to `client/src/types.ts`
3. **A2. State Management**: Add CRUD actions to `client/src/store/useAppStore.ts` (createRecoveryScene, activateScene, etc.)
4. **A3. UI Components**: Create `SceneList`, `SceneEditor` (wizard), `ScenePlaybook`, `SceneQuickAccess` in `client/src/components/recovery-scenes/`
5. **A4. Integration**: Add "I'm in a scene" button to Home, integrate with Emergency screen

**D — Deliverables**:
- RecoveryScene and SceneAction types
- Scene CRUD actions in Zustand store
- Four new components (list, editor, playbook, quick access)
- Integration with Home and Emergency screens
- Notification system for time triggers

**Key Files to Create/Modify**:
- `client/src/types.ts` (add RecoveryScene types)
- `client/src/store/useAppStore.ts` (add scene actions)
- `client/src/components/recovery-scenes/` (new directory with 4 components)
- `client/src/routes/Home.tsx` (add quick access)
- `client/src/routes/Emergency.tsx` (integrate scenes)
- `client/src/service-worker.ts` (time trigger notifications)

**Success Criteria**: Users can create scene <2 minutes, activate <3 taps, playbook is clear and actionable, all accessible.

Start with A0, then A1-A4. Reference full build plan for wizard flow, action types, and integration details.
```

---

## Feature 3: Sponsor Connection

```
I'm implementing the Sponsor Connection feature for the 12-Step Recovery Companion app. This feature enables real-time, privacy-first sharing between sponsees and sponsors with per-item granularity.

📋 **Full Build Plan**: See `attached_assets/feature-build-plans/03-sponsor-connection.md`

**B — Background**:
- Current state: FellowshipContact type exists, encryption utilities exist (`crypto.ts`), data export/import exists
- Missing: Real-time sharing, sponsor dashboard, per-item sharing controls, encrypted messaging
- Constraints: Privacy-first (per-item granularity), no service role keys on client, use existing crypto

**M — Mission**:
Build sponsor connection system:
1. Code-based connection (sponsor generates 6-digit code, sponsee enters)
2. Per-item sharing (step entries, daily cards, journal entries, scenes, safety plans)
3. Sponsor dashboard (read-only view of shared items, risk indicators)
4. Encrypted messaging (optional, two-way communication)

**A — Actions** (Start Here):
1. **A0. Sanity & Risk Pass**: Review privacy approach, encryption strategy
2. **A1. Type System**: Add `SponsorRelationship`, `SharedItem`, `SponsorMessage` types to `client/src/types.ts`
3. **A2. State Management**: Add connection/sharing actions to `client/src/store/useAppStore.ts` (generateSponsorCode, shareItem, etc.)
4. **A3. UI Components**: Create `ConnectionFlow`, `ShareBadge`, `SponsorDashboard`, `SponsorMessaging` in `client/src/components/sponsor-connection/`
5. **A4. Integration**: Add share badges to Step Work, Daily Cards, Journal entries

**D — Deliverables**:
- SponsorRelationship, SharedItem, SponsorMessage types
- Connection CRUD actions in Zustand store
- Four new components (connection flow, share badge, dashboard, messaging)
- Integration with Step Work, Daily Cards, Journal, Scenes
- Encryption utilities for messaging

**Key Files to Create/Modify**:
- `client/src/types.ts` (add sponsor types)
- `client/src/store/useAppStore.ts` (add sponsor actions)
- `client/src/lib/sponsor-crypto.ts` (new, encryption utilities)
- `client/src/components/sponsor-connection/` (new directory with 4 components)
- `client/src/routes/Steps.tsx` (add share badge)
- `client/src/routes/Home.tsx` (add share badge to daily cards)
- `client/src/routes/Journal.tsx` (add share badge)

**Success Criteria**: Connection <1 minute, sharing <2 taps per item, sponsor dashboard clear and actionable, all accessible.

Start with A0, then A1-A4. Reference full build plan for encryption implementation, RLS policies (if using Supabase), and web portal (optional).
```

---

## Feature 4: JITAI Engine

```
I'm implementing the Just-in-Time Recovery Engine (JITAI) feature for the 12-Step Recovery Companion app. This feature provides proactive support by detecting risk patterns and delivering timely, explainable interventions.

📋 **Full Build Plan**: See `attached_assets/feature-build-plans/04-jitai-engine.md`

**B — Background**:
- Current state: Basic notification system exists, daily cards track mood/cravings, journal tracks triggers, streak tracking exists
- Missing: Risk detection, adaptive interventions, explainable AI suggestions
- Constraints: Privacy-first (all processing client-side), explainable (show reasoning), user-defined rules (not black-box)

**M — Mission**:
Build JITAI system:
1. Risk signal detection (analyze patterns, calculate risk scores 0-100)
2. Adaptive interventions (just-in-time suggestions with explanations)
3. Learning system (track effectiveness, personalize suggestions)
4. User-defined rules (visual rule builder, custom thresholds)

**A — Actions** (Start Here):
1. **A0. Sanity & Risk Pass**: Review privacy approach, explainability requirements
2. **A1. Type System**: Add `RiskSignal`, `JITAIRule`, `InterventionFeedback` types to `client/src/types.ts`
3. **A2. State Management**: Add risk detection actions to `client/src/store/useAppStore.ts` (detectRiskSignals, createJITAIRule, etc.)
4. **A3. Risk Detection Engine**: Create `client/src/lib/jitai-engine.ts` (analyze patterns, match rules, generate signals)
5. **A4. UI Components**: Create `RiskSignalCard`, `RuleBuilder`, `InterventionSuggestions` in `client/src/components/jitai/`

**D — Deliverables**:
- RiskSignal, JITAIRule, InterventionFeedback types
- Risk detection engine (`jitai-engine.ts`)
- Learning system (`jitai-learning.ts`)
- Three new components (risk signal card, rule builder, intervention suggestions)
- Integration with Home, Daily Cards, Scenes

**Key Files to Create/Modify**:
- `client/src/types.ts` (add JITAI types)
- `client/src/store/useAppStore.ts` (add JITAI actions)
- `client/src/lib/jitai-engine.ts` (new, risk detection)
- `client/src/lib/jitai-learning.ts` (new, learning system)
- `client/src/components/jitai/` (new directory with 3 components)
- `client/src/routes/Home.tsx` (show risk signals)
- `client/src/service-worker.ts` (risk-based notifications)

**Success Criteria**: Risk signals detected, rules can be created, suggestions shown with explanations, all processing client-side.

Start with A0, then A1-A5. Reference full build plan for risk calculation algorithm, rule matching logic, and explainability patterns.
```

---

## Feature 5: Recovery Copilot

```
I'm implementing the Recovery Copilot feature enhancement for the 12-Step Recovery Companion app. This enhances the existing AI Sponsor chat to be grounded in user data and add agentic features.

📋 **Full Build Plan**: See `attached_assets/feature-build-plans/05-recovery-copilot.md`

**B — Background**:
- Current state: Basic AI Sponsor chat exists (`AISponsor.tsx`), Gemini API integration exists, `AISponsorChatState` type exists
- Missing: Grounding in user data, agentic features, personalized responses
- Constraints: Privacy-first (local summarization), opt-in sharing, never quote copyrighted NA/AA text

**M — Mission**:
Enhance AI chat with:
1. Context window (include step work, journals, scenes, daily check-ins)
2. Agentic features (weekly digest, pattern detection, meeting prep, sponsor summaries)
3. Proactive help (suggestions, reminders, insights)
4. Integration points (Step Work, Journal, Scenes, Daily Rhythm)

**A — Actions** (Start Here):
1. **A0. Sanity & Risk Pass**: Review privacy approach, prompt engineering strategy
2. **A1. Type System Updates**: Enhance `AISponsorChatState` in `client/src/types.ts` with contextWindow, weeklyDigest, settings
3. **A2. Context Gathering**: Create `client/src/lib/copilot-context.ts` (gather user data, summarize entries)
4. **A3. Prompt Engineering**: Create `client/src/lib/copilot-prompts.ts` (recovery-focused system prompts, context-aware prompts)
5. **A4. UI Components**: Enhance `AISponsor.tsx`, create `WeeklyDigest`, `MeetingPrep`, `PatternDetection` components

**D — Deliverables**:
- Enhanced AISponsorChatState with context window
- Context gathering utilities (`copilot-context.ts`)
- Prompt engineering (`copilot-prompts.ts`)
- Enhanced chat component
- Three new agentic components (digest, meeting prep, pattern detection)
- Integration with Step Work, Journal, Scenes, Daily Rhythm

**Key Files to Create/Modify**:
- `client/src/types.ts` (enhance AISponsorChatState)
- `client/src/lib/copilot-context.ts` (new, context gathering)
- `client/src/lib/copilot-prompts.ts` (new, prompt engineering)
- `client/src/lib/copilot-digest.ts` (new, weekly digest generator)
- `client/src/lib/copilot-patterns.ts` (new, pattern detection)
- `client/src/routes/AISponsor.tsx` (enhance existing)
- `client/src/components/recovery-copilot/` (new directory with 3 components)

**Success Criteria**: Chat grounded in user data, context is transparent, agentic features discoverable, all accessible.

Start with A0, then A1-A5. Reference full build plan for prompt templates, context summarization, and agentic feature implementations.
```

---

## Feature 6: Adaptive Coping Coach

```
I'm implementing the Adaptive Coping Coach feature for the 12-Step Recovery Companion app. This feature learns what coping tools actually work for each user by tracking usage and outcomes, then personalizes suggestions.

📋 **Full Build Plan**: See `attached_assets/feature-build-plans/06-adaptive-coping-coach.md`

**B — Background**:
- Current state: Emergency/Tools screen exists, tools exist (breathing, TIPP, grounding, etc.), tool usage can be tracked implicitly
- Missing: Outcome tracking, effectiveness calculation, personalized suggestions
- Constraints: Privacy-first (all data local), user control (opt-in tracking), offline-first

**M — Mission**:
Build adaptive coaching system:
1. Tool usage tracking (automatic where possible, capture context)
2. Outcome tracking ("Did this help?" prompt after tool use)
3. Effectiveness calculation (personal score per tool, context-specific)
4. Personalized suggestions (recommend tools that work best for user)

**A — Actions** (Start Here):
1. **A0. Sanity & Risk Pass**: Review privacy approach, tracking opt-in strategy
2. **A1. Type System**: Add `CopingToolUsage`, `CopingToolEffectiveness`, `CopingToolRecommendation` types to `client/src/types.ts`
3. **A2. State Management**: Add tracking actions to `client/src/store/useAppStore.ts` (recordToolUsage, recordToolOutcome, getRecommendedTools)
4. **A3. Effectiveness Engine**: Create `client/src/lib/coping-coach.ts` (calculate effectiveness, generate recommendations, build playbook)
5. **A4. UI Components**: Create `ToolOutcomePrompt`, `RecommendedTools`, `EffectivenessDashboard`, `ExperimentSuggestion` in `client/src/components/coping-coach/`

**D — Deliverables**:
- CopingToolUsage, CopingToolEffectiveness, CopingToolRecommendation types
- Effectiveness calculation engine (`coping-coach.ts`)
- Four new components (outcome prompt, recommended tools, dashboard, experiment)
- Integration with Emergency/Tools screen, Scenes, Daily Rhythm, JITAI

**Key Files to Create/Modify**:
- `client/src/types.ts` (add coping coach types)
- `client/src/store/useAppStore.ts` (add tracking actions)
- `client/src/lib/coping-coach.ts` (new, effectiveness engine)
- `client/src/components/coping-coach/` (new directory with 4 components)
- `client/src/routes/Emergency.tsx` (add recommended tools, outcome prompt)
- `client/src/components/recovery-scenes/ScenePlaybook.tsx` (track tool usage)

**Success Criteria**: Tool usage tracked, outcome can be recorded, effectiveness calculated, recommendations shown, all data local.

Start with A0, then A1-A5. Reference full build plan for effectiveness algorithm, recommendation logic, and personal playbook generation.
```

---

## Feature 7: Safety Plan

```
I'm implementing the Recovery Safety Plan feature for the 12-Step Recovery Companion app. This feature helps users build a crisis support plan when stable, then surfaces it proactively when needed.

📋 **Full Build Plan**: See `attached_assets/feature-build-plans/07-safety-plan.md`

**B — Background**:
- Current state: Emergency screen exists, emergency actions configurable, crisis hotlines available, breathing exercises exist
- Missing: Structured safety plan, proactive surfacing, personal crisis protocol
- Constraints: Privacy-first (local storage), always accessible (offline), crisis-ready (<100ms load), WCAG 2.2 AA

**M — Mission**:
Build safety plan system:
1. Safety plan builder (people to contact, reasons not to use, actions before using, personal message, crisis resources)
2. Plan surfacing (manual trigger via SOS, proactive via JITAI, scene integration)
3. Plan display (crisis mode: full-screen, minimal UI, large buttons)
4. Plan updates (edit anytime, version history, effectiveness tracking)

**A — Actions** (Start Here):
1. **A0. Sanity & Risk Pass**: Review crisis-ready requirements, accessibility needs
2. **A1. Type System**: Add `SafetyPlan`, `SafetyPlanContact`, `SafetyPlanAction`, `CrisisResource` types to `client/src/types.ts`
3. **A2. State Management**: Add plan CRUD actions to `client/src/store/useAppStore.ts` (createSafetyPlan, activateSafetyPlan, etc.)
4. **A3. UI Components**: Create `SafetyPlanBuilder` (wizard), `SafetyPlanDisplay` (crisis mode), `SafetyPlanQuickAccess` in `client/src/components/safety-plan/`
5. **A4. Integration**: Integrate with Emergency screen, JITAI, Scenes, Onboarding

**D — Deliverables**:
- SafetyPlan, SafetyPlanContact, SafetyPlanAction, CrisisResource types
- Safety plan CRUD actions in Zustand store
- Three new components (builder wizard, crisis display, quick access)
- Regional crisis resources (`crisis-resources.ts`)
- Integration with Emergency, JITAI, Scenes

**Key Files to Create/Modify**:
- `client/src/types.ts` (add safety plan types)
- `client/src/store/useAppStore.ts` (add plan actions)
- `client/src/lib/crisis-resources.ts` (new, regional resources)
- `client/src/components/safety-plan/` (new directory with 3 components)
- `client/src/routes/Emergency.tsx` (integrate plan)
- `client/src/lib/jitai-engine.ts` (proactive surfacing)
- `client/src/routes/Onboarding.tsx` (plan creation step)

**Success Criteria**: Plan can be created <5 minutes, loads instantly (<100ms), displays clearly in crisis mode, always accessible.

Start with A0, then A1-A5. Reference full build plan for crisis mode UI patterns, regional resources, and integration points.
```

---

## Feature 8: Meeting Finder Integration

```
I'm implementing the Meeting Finder Integration feature for the 12-Step Recovery Companion app. This feature integrates BMLT (NA) and Meeting Guide (AA) to make finding and attending meetings easier.

📋 **Full Build Plan**: See `attached_assets/feature-build-plans/08-meeting-finder-integration.md`

**B — Background**:
- Current state: Meeting tracker exists, can log attendance, meeting statistics tracked
- Missing: Meeting finder (BMLT/AA integration), meeting reminders, meeting details
- Constraints: BMLT API requires user-provided key, AA uses deep links, location opt-in only, offline caching

**M — Mission**:
Build meeting finder system:
1. NA Meeting Finder (BMLT Semantic API geosearch, filters, list/map view, "starts soon" filter)
2. AA Meeting Finder (deep link to Meeting Guide app, web fallback)
3. Meeting Integration (quick log, favorites, reminders, calendar export)
4. Meeting Reminders (smart reminders, geofenced reminders, customizable)

**A — Actions** (Start Here):
1. **A0. Sanity & Risk Pass**: Review API key handling, location privacy, caching strategy
2. **A1. Type System**: Enhance `Meeting` type in `client/src/types.ts` with BMLT/AA fields, add `MeetingSearchFilters`, `MeetingCache`
3. **A2. BMLT Integration**: Create `client/src/lib/bmlt-api.ts` (API integration, geosearch, caching)
4. **A3. AA Integration**: Create `client/src/lib/aa-meetings.ts` (deep links, web fallback, region detection)
5. **A4. UI Components**: Create `MeetingFinder`, `MeetingDetails`, `MeetingReminders` in `client/src/components/meeting-finder/`

**D — Deliverables**:
- Enhanced Meeting type with BMLT/AA fields
- BMLT API integration (`bmlt-api.ts`)
- AA integration (`aa-meetings.ts`)
- Three new components (finder, details, reminders)
- Calendar export (`calendar-export.ts`)
- Integration with Meetings screen, Home, Scenes, JITAI

**Key Files to Create/Modify**:
- `client/src/types.ts` (enhance Meeting type)
- `client/src/lib/bmlt-api.ts` (new, BMLT integration)
- `client/src/lib/aa-meetings.ts` (new, AA integration)
- `client/src/lib/calendar-export.ts` (new, ICS export)
- `client/src/components/meeting-finder/` (new directory with 3 components)
- `client/src/routes/Meetings.tsx` (add finder interface)
- `client/src/service-worker.ts` (meeting reminders)

**Success Criteria**: BMLT search works (with API key), meetings displayed clearly, can log attendance, reminders work, all accessible.

Start with A0, then A1-A5. Reference full build plan for BMLT API integration details, AA deep link patterns, and caching strategy.
```

---

## Usage Instructions

1. **Copy the prompt** for the feature you want to implement
2. **Paste it** as your first message to your AI assistant
3. **Reference the full build plan** (`attached_assets/feature-build-plans/XX-feature-name.md`) for detailed implementation guidance
4. **Follow the Actions** step-by-step (A0 → A1 → A2 → ...)
5. **Verify Deliverables** when complete

## Recommended Order

1. **Recovery Rhythm** (P0, 2 weeks) - Foundation for daily engagement
2. **Recovery Scenes** (P0, 2-3 weeks) - Unique differentiator
3. **Safety Plan** (P0, 1-2 weeks) - Crisis support
4. **Sponsor Connection** (P0, 2-3 weeks) - Network effects
5. **JITAI Engine** (P1, 2-3 weeks) - Proactive support
6. **Recovery Copilot** (P1, 2-3 weeks) - AI enhancement
7. **Adaptive Coping Coach** (P1, 2-3 weeks) - Personalization
8. **Meeting Finder** (P2, 2-3 weeks) - Nice-to-have

Each prompt is self-contained and ready to use. The AI assistant will reference the detailed build plan for implementation specifics.

