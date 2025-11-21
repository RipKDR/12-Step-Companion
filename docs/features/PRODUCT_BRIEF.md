# Recovery Companion 2.0 - Product Brief

## Executive Summary
Transform the Recovery Companion from a useful tool into an indispensable daily habit for fellowship members through behavioral psychology, community features, and frictionless UX.

---

## 🎯 North Star Metrics

### Primary Metric: Daily Active Users (DAU)
**Target**: 60% of installed base using app daily within 90 days

### Secondary Metrics:
- **Day 1 Retention**: 70% (currently unknown, likely ~40%)
- **Day 7 Retention**: 50% (currently unknown, likely ~25%)
- **Day 30 Retention**: 35% (currently unknown, likely ~15%)
- **Average Session Time**: 3-5 minutes
- **Sessions per Day**: 2-3 (morning + evening)
- **Feature Adoption**: 80% use at least 3 core features

### Recovery Impact Metrics:
- **Meeting Frequency**: Average 3+ meetings logged per week
- **Journal Engagement**: 4+ entries per week
- **Step Work Progress**: 2+ questions answered per week
- **Crisis Tool Usage**: Decreasing over time = stability

---

## 🧠 User Psychology Analysis

### Current User Journey (Problematic):
1. **Day 1**: Download → Quick onboarding → "What now?" → Close app
2. **Day 2-3**: Forget app exists (no notifications)
3. **Day 7**: Remember app → Use once → Forget again
4. **Day 30**: Abandoned

### Target User Journey (Optimized):
1. **Day 1**: Download → Powerful onboarding → Immediate value → Set up notifications → First win
2. **Day 2**: Morning notification → Quick action (30s) → Dopamine hit → Close
3. **Day 3**: Evening reminder → Quick reflection → See streak → Motivated
4. **Day 7**: Milestone celebration → Share achievement → Community connection
5. **Day 30**: Habit formed → Daily ritual → Can't imagine recovery without it

---

## 🎨 BMAD Framework Application

### BUILD
**Phase 1 (Weeks 1-2)**: Foundation for Retention
- Push notifications system
- Streak tracking & visualization
- Quick actions on home
- Improved onboarding with immediate value

**Phase 2 (Weeks 3-4)**: Habit Formation
- Daily challenges
- Achievement system
- Voice-to-text journaling
- Milestone celebrations

**Phase 3 (Weeks 5-6)**: Community & Growth
- Anonymous milestone sharing
- Accountability partner system
- Smart prompts & suggestions
- Widget support

### MEASURE
**Analytics Events to Track**:
```typescript
// User engagement
- app_opened
- feature_used (which feature, duration)
- quick_action_completed
- notification_received
- notification_tapped

// Retention indicators
- onboarding_completed
- first_journal_entry
- first_step_answer
- first_meeting_logged
- notification_permission_granted

// Habit formation
- streak_milestone (3, 7, 14, 30, 90 days)
- daily_challenge_completed
- achievement_unlocked

// Recovery metrics
- sobriety_milestone (1, 7, 30, 60, 90, 180, 365 days)
- crisis_mode_activated
- emergency_contact_used
- meeting_logged

// Drop-off signals
- 24hr_inactive
- 72hr_inactive
- 7day_inactive
- feature_abandoned (started but didn't complete)
```

### ANALYZE
**Weekly Review Questions**:
1. What % of users who complete onboarding return Day 2?
2. Which notification time has highest tap-through rate?
3. Which quick action is used most frequently?
4. What's the correlation between streaks and retention?
5. Where do users drop off in onboarding?
6. Which achievements are unlocked most/least?
7. What's the average time to first value?

### DEPLOY
**Deployment Strategy**:
- Feature flags for controlled rollout
- A/B testing framework for key features
- Progressive enhancement (works without notifications if denied)
- Backwards compatibility with existing user data
- Gradual rollout: 10% → 25% → 50% → 100%

---

## 🎯 Feature Prioritization Matrix

### Impact vs. Effort Analysis

| Feature | Impact | Effort | Priority | Reasoning |
|---------|--------|--------|----------|-----------|
| Push Notifications | CRITICAL | Medium | P0 | Without this, users forget app exists. 3-5x retention boost expected. |
| Streak Counters | CRITICAL | Low | P0 | Duolingo's secret sauce. Habit formation psychology. |
| Quick Actions | CRITICAL | Low | P0 | Reduces friction from 5 taps to 1. Removes abandonment points. |
| Improved Onboarding | CRITICAL | Medium | P0 | First impression = everything. 70% of retention decided in first session. |
| Milestone Celebrations | HIGH | Low | P1 | Emotional connection + dopamine = retention. Easy win. |
| Daily Challenges | HIGH | Medium | P1 | Creates daily ritual. Gives users a "reason" to open app. |
| Achievement System | MEDIUM | Medium | P1 | Gamification that respects recovery. Progress visibility. |
| Voice Journaling | HIGH | Low | P1 | Removes #1 barrier to journaling: typing. Accessibility win. |
| Anonymous Sharing | HIGH | High | P2 | Community = recovery. But complex privacy considerations. |
| Accountability Partners | MEDIUM | High | P2 | Powerful but requires E2E encryption, careful design. |
| Smart Prompts | MEDIUM | Medium | P2 | Personalization increases engagement but needs data. |
| Widget Support | MEDIUM | High | P3 | Platform-specific, high effort. Great for power users. |

---

## 🧪 Hypotheses to Test

### Hypothesis 1: Notifications Drive Daily Habit
**Test**: A/B test notification frequency
- **Group A**: 2x daily (morning + evening)
- **Group B**: 1x daily (user-chosen time)
- **Group C**: No notifications (control)
- **Measure**: Day 7 retention, DAU
- **Expected**: Group A has 2x retention vs. Group C

### Hypothesis 2: Streaks Motivate Consistency
**Test**: Show streak counter vs. hide it
- **Group A**: Prominent streak display
- **Group B**: No streak counter
- **Measure**: Journal frequency, return rate
- **Expected**: Group A journals 3x more frequently

### Hypothesis 3: Quick Actions Reduce Abandonment
**Test**: Quick action modal vs. full navigation
- **Group A**: Modal-based quick actions
- **Group B**: Navigate to full page
- **Measure**: Completion rate, session time
- **Expected**: Group A has 40% higher completion rate

### Hypothesis 4: Immediate Onboarding Value Improves Retention
**Test**:
- **Group A**: New onboarding with immediate gratitude entry
- **Group B**: Current minimal onboarding
- **Measure**: Day 1 retention, time to first value
- **Expected**: Group A has 50% better Day 1 retention

---

## 🎨 Design Principles

### 1. **Respect Recovery Energy**
Users may have limited mental/emotional energy. Every interaction should be:
- **Optional**: Never force actions
- **Quick**: 30-second default, deep dives available
- **Forgiving**: Can skip, can return, no judgment
- **Encouraging**: Positive reinforcement only

### 2. **Privacy First, Always**
- Local-first architecture maintained
- Opt-in for any sharing
- Anonymous by default
- Clear data control

### 3. **Build Trust Through Reliability**
- Crisis features must be bulletproof
- Notifications must be accurate
- Data must never be lost
- App must work offline

### 4. **Create Emotional Connection**
- Celebrate wins authentically
- Support struggles compassionately
- Use recovery language (fellowship, clean time, etc.)
- Feel like it was built BY someone in recovery FOR recovery

### 5. **Reduce Cognitive Load**
- Smart defaults
- Progressive disclosure
- Familiar patterns
- Clear hierarchy

---

## 🚦 Success Criteria (90-Day Goals)

### Quantitative:
- ✅ 10,000 active users
- ✅ 60% DAU rate
- ✅ 50% Day 7 retention
- ✅ 35% Day 30 retention
- ✅ 4.5+ star rating (App Store/Play Store)
- ✅ <5% crash rate
- ✅ 80% notification opt-in rate

### Qualitative:
- ✅ "I use this every day" feedback
- ✅ "I can't imagine recovery without it" testimonials
- ✅ Sponsors recommending to sponsees
- ✅ Mentioned in meetings organically
- ✅ Featured in fellowship publications

### Recovery Impact:
- ✅ Average user clean time increasing (app helps retention)
- ✅ Crisis mode usage decreasing over time (users stabilizing)
- ✅ Meeting attendance logged consistently
- ✅ Step work completion rates improving

---

## 🎭 User Personas

### Persona 1: "Fresh Start Sarah" (0-30 days clean)
**Needs**:
- Crisis support (high priority)
- Daily encouragement
- Structure and routine
- Connection to fellowship

**Behaviors**:
- App usage: High frequency, short sessions
- Emotional state: Fragile, hopeful, anxious
- Tech comfort: Medium
- Primary features: Emergency tools, daily cards, meeting tracker

**Design for Sarah**:
- Onboarding emphasizes crisis tools first
- Gentle notifications (not overwhelming)
- Simple UI (reduce overwhelm)
- Quick wins (gratitude, intentions)

---

### Persona 2: "Steady Eddie" (90-365 days clean)
**Needs**:
- Habit maintenance
- Step work support
- Community connection
- Progress tracking

**Behaviors**:
- App usage: Medium frequency, varied sessions
- Emotional state: Stable, committed, growing
- Tech comfort: Medium-High
- Primary features: Step work, journal, meetings, achievements

**Design for Eddie**:
- Notifications focus on consistency (streaks)
- Daily challenges to prevent complacency
- Achievement system for motivation
- Step work guidance

---

### Persona 3: "Veteran Victor" (1+ years clean)
**Needs**:
- Giving back (sponsorship)
- Advanced step work
- Community leadership
- Long-term tracking

**Behaviors**:
- App usage: Low frequency, purposeful sessions
- Emotional state: Grounded, service-oriented
- Tech comfort: High
- Primary features: Advanced worksheets, accountability partners, analytics

**Design for Victor**:
- "Mentor mode" features
- Tools to support sponsees
- Deep analytics and insights
- Share wisdom with community

---

## 📊 Competitive Analysis

### Existing Recovery Apps:

**I Am Sober** (4.8★, 100K+ downloads):
- ✅ Excellent streak visualization
- ✅ Community pledges
- ✅ Simple, clean UI
- ❌ Limited step work support
- ❌ No crisis tools
- ❌ Requires account/cloud storage

**Sober Time** (4.6★, 500K+ downloads):
- ✅ Sobriety calculator with milestones
- ✅ Daily motivations
- ✅ Token system (visual rewards)
- ❌ Very basic features
- ❌ Ads in free version
- ❌ No journaling or step work

**Nomo** (4.7★, 50K+ downloads):
- ✅ Multiple "clocks" for different addictions
- ✅ Clean design
- ✅ Forums/community
- ❌ Paywall for most features
- ❌ No 12-step integration
- ❌ Limited crisis support

### Our Competitive Advantages:
1. **Comprehensive**: Only app with step work + journal + meetings + crisis all-in-one
2. **Privacy**: Truly local-first, no account required
3. **Fellowship-focused**: Built for 12-step programs specifically
4. **Free & Open Source**: No paywalls, no ads
5. **Crisis Support**: Best-in-class emergency features

### Gaps We Need to Fill:
1. **Notifications**: Competitors have better reminder systems
2. **Streaks**: Need visual parity with I Am Sober
3. **Community**: We're too isolated, need safe sharing
4. **Gamification**: Achievement systems drive engagement

---

## 🎬 Go-to-Market Strategy

### Phase 1: Soft Launch (Weeks 1-4)
- **Target**: 1,000 beta users from local meetings
- **Channel**: QR codes at meetings, sponsor referrals
- **Goal**: Validate retention improvements, gather feedback

### Phase 2: Fellowship Launch (Weeks 5-12)
- **Target**: 10,000 users across multiple cities
- **Channel**: Fellowship website listings, treatment center partnerships
- **Goal**: Achieve 50% Day 7 retention, build testimonials

### Phase 3: Viral Growth (Weeks 13-26)
- **Target**: 50,000 users nationally
- **Channel**: App store optimization, word-of-mouth, anonymous sharing
- **Goal**: Organic growth through network effects

### Phase 4: Scale (Weeks 27-52)
- **Target**: 250,000 users, international expansion
- **Channel**: Press coverage, fellowship endorsements, clinic partnerships
- **Goal**: Become the default recovery app

---

## 🔧 Technical Debt to Address

Before adding features, we should fix:

1. **Missing tests**: Need test coverage before rapid iteration
2. **Console.log statements**: Replace with proper logging
3. **Error handling**: More specific error messages
4. **Environment validation**: Zod schema for env vars
5. **ID generation**: Use crypto.randomUUID()

**Decision**: Address critical debt in parallel with feature development, not before. Ship fast, maintain quality.

---

## 💬 Open Questions for User

Before I proceed with detailed design and implementation:

### Strategic Questions:
1. **Privacy vs. Community**: How far should we push community features while maintaining local-first architecture?
   - Option A: Pure P2P (WebRTC, no server)
   - Option B: Optional anonymous server-based sharing
   - Option C: Hybrid approach

2. **Gamification Philosophy**: Should achievements be recovery-focused only, or can we add "fun" elements?
   - Option A: Serious only (milestones, step completion)
   - Option B: Balanced (mix of serious + light achievements)
   - Option C: Full gamification (points, levels, leaderboards)

3. **Notification Strategy**: How aggressive should we be?
   - Option A: Conservative (1-2 per day, easy to disable)
   - Option B: Moderate (2-4 per day, smart timing)
   - Option C: Aggressive (5+ per day, persistent)

4. **Target Platform Priority**:
   - Option A: Mobile-first (iOS + Android native features)
   - Option B: PWA-first (universal, simpler)
   - Option C: Balanced (PWA + native wrappers)

### Technical Questions:
5. **Analytics Approach**:
   - Option A: Fully local (privacy-first, limited insights)
   - Option B: Optional anonymous telemetry (better product decisions)
   - Option C: Required anonymous analytics (best insights)

6. **Testing Strategy**:
   - Option A: Unit tests only (fast, good coverage)
   - Option B: Unit + Integration (comprehensive)
   - Option C: Unit + Integration + E2E (slowest, most thorough)

---

**My Recommendations**:
1. Privacy: **Option C (Hybrid)** - Local-first, optional anonymous sharing via server
2. Gamification: **Option B (Balanced)** - Respectful but engaging
3. Notifications: **Option B (Moderate)** - Smart, personalized, not annoying
4. Platform: **Option B (PWA-first)** - You've built excellent PWA, leverage it
5. Analytics: **Option B (Optional telemetry)** - Privacy-respecting, insightful
6. Testing: **Option B (Unit + Integration)** - Practical, thorough enough

**Why these choices?**
- **Hybrid privacy**: Enables community without compromising core privacy promise
- **Balanced gamification**: Engages without trivializing recovery
- **Moderate notifications**: Effective without being pushy (can always scale up)
- **PWA-first**: Leverage existing investment, avoid platform fragmentation
- **Optional analytics**: Make data-driven decisions while respecting privacy
- **Unit + Integration**: Catches most bugs without slowing development

---

## Next Steps

Once you approve the strategic direction, I'll:

1. **🎨 Role: UX Designer** - Create detailed wireframes and design system updates
2. **🏗️ Role: Technical Architect** - Design database schemas, state management, API contracts
3. **👨‍💻 Role: Engineer** - Implement Phase 1 features with tests
4. **📊 Role: Data Analyst** - Set up analytics and measurement framework

**Ready to proceed?** Let me know if you want me to adjust any strategic decisions, then I'll dive deep into design and implementation.
