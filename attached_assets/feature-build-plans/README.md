# Feature Build Plans - Index

This directory contains comprehensive BMAD (Background → Mission → Actions → Deliverables) build plans for 8 high-impact features that will transform the Recovery Companion into a top-tier recovery app.

## Features Overview

### Priority P0 (Critical for Retention)

1. **[Recovery Rhythm](01-recovery-rhythm.md)** - Daily micro-habits (morning, midday, night)
   - **Impact**: 5-10x higher retention for daily users
   - **Effort**: 2 weeks
   - **Status**: Ready for Implementation

2. **[Recovery Scenes](02-recovery-scenes.md)** - Situation-specific playbooks
   - **Impact**: Unique differentiator, addresses core relapse patterns
   - **Effort**: 3-4 weeks (MVP: 2 weeks)
   - **Status**: Ready for Implementation

3. **[Sponsor Connection](03-sponsor-connection.md)** - Real-time, privacy-first sharing
   - **Impact**: 37 days longer sobriety, 2-3x retention
   - **Effort**: 3-4 weeks (MVP: 2 weeks)
   - **Status**: Ready for Implementation

4. **[Safety Plan](07-safety-plan.md)** - Crisis support tool
   - **Impact**: Critical for crisis support, builds trust
   - **Effort**: 2 weeks (MVP: 1 week)
   - **Status**: Ready for Implementation

### Priority P1 (High Impact)

5. **[JITAI Engine](04-jitai-engine.md)** - Just-in-Time Adaptive Interventions
   - **Impact**: Proactive support, personalization
   - **Effort**: 3-4 weeks (MVP: 2 weeks)
   - **Status**: Ready for Implementation

6. **[Recovery Copilot](05-recovery-copilot.md)** - AI companion grounded in user data
   - **Impact**: Daily engagement, data processing
   - **Effort**: 3-4 weeks (MVP: 2 weeks)
   - **Status**: Ready for Implementation

7. **[Adaptive Coping Coach](06-adaptive-coping-coach.md)** - Personalized tool suggestions
   - **Impact**: Learn what works for each user
   - **Effort**: 3 weeks (MVP: 2 weeks)
   - **Status**: Ready for Implementation

### Priority P2 (Nice-to-Have)

8. **[Meeting Finder Integration](08-meeting-finder-integration.md)** - BMLT/AA meeting finder
   - **Impact**: Makes meetings easier to find and attend
   - **Effort**: 3-4 weeks (MVP: 2 weeks)
   - **Status**: Ready for Implementation

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- Recovery Rhythm (Week 1-2)
- Recovery Scenes MVP (Week 3-4)

### Phase 2: Connection (Weeks 5-8)
- Sponsor Connection MVP (Week 5-6)
- Safety Plan (Week 7-8)

### Phase 3: Intelligence (Weeks 9-12)
- JITAI Engine (Week 9-10)
- Recovery Copilot Enhancement (Week 11-12)

### Phase 4: Personalization (Weeks 13-16)
- Adaptive Coping Coach (Week 13-14)
- Meeting Finder Integration (Week 15-16)

## How to Use These Plans

Each plan follows the BMAD methodology:

- **B — Background**: Context, constraints, risks, current state
- **M — Mission**: What to build, success metrics
- **A — Actions**: Step-by-step implementation (A0-A7)
- **D — Deliverables**: What must exist when done

### Before Starting Implementation

1. Read the Background section to understand context
2. Review the Mission to understand goals
3. Study the Actions section for implementation details
4. Check Deliverables to know what to build
5. Review Success Criteria to know when done

### During Implementation

1. Follow the Actions section step-by-step
2. Reference existing codebase patterns
3. Test as you build (unit → integration → E2E)
4. Update documentation as you go

### After Implementation

1. Verify all Deliverables are complete
2. Check Success Criteria are met
3. Update README with new features
4. Document any deviations or learnings

## Key Principles

All features follow these principles:

- **Privacy-First**: Local-first storage, opt-in sharing, no service role keys on client
- **Recovery Respect**: Never quote copyrighted NA/AA text, use neutral prompts only
- **Accessibility**: WCAG 2.2 AA compliance, keyboard navigation, screen reader support
- **Offline-First**: Core features work without internet
- **Crisis-Ready**: Emergency features must be bulletproof and always accessible

## Dependencies

### External Dependencies
- **BMLT API**: User-provided API key (Meeting Finder)
- **Gemini API**: Optional, for AI features (Recovery Copilot)
- **Location Permission**: Opt-in only (Scenes, Meeting Finder)

### Internal Dependencies
- Existing DailyCard structure (Recovery Rhythm)
- Existing Emergency screen (Safety Plan)
- Existing Tools screen (Adaptive Coping Coach)
- Existing AI Sponsor chat (Recovery Copilot)
- Existing notification system (JITAI, Reminders)

## Success Metrics

### Overall App Metrics
- **Daily Active Users**: 60% of installed base within 90 days
- **Day 7 Retention**: 50% (vs. typical 25%)
- **Day 30 Retention**: 35% (vs. typical 15%)
- **Feature Adoption**: 80% use at least 3 core features

### Feature-Specific Metrics
Each plan includes success metrics. See individual plan documents for details.

## Questions or Issues?

If you encounter issues during implementation:

1. Review the Background section for context
2. Check the Risks & Mitigations section
3. Review existing codebase patterns
4. Test edge cases mentioned in Notes & Considerations

## Next Steps

1. **Choose a feature** to implement (recommend starting with Recovery Rhythm)
2. **Read the full plan** for that feature
3. **Set up development environment** if needed
4. **Start with A0** (Sanity & Risk Pass)
5. **Follow Actions** step-by-step
6. **Verify Deliverables** when complete

---

**Last Updated**: 2025-01-13
**Total Features**: 8
**Total Estimated Effort**: 16-20 weeks (can be parallelized)
**Status**: All plans ready for implementation

