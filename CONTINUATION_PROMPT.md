# Continuation Prompt - UX Improvements BMAD Cycle

## Context Summary

We're implementing UX improvements from `ux-improvements-bmad-cycle.plan.md`. 

**Completed:**
- ✅ Greeting component with time-of-day logic
- ✅ Home page refactor (removed duplicates, smart feed prioritization)
- ✅ Toast notification system integration
- ✅ Skeleton loaders for async content
- ✅ Enhanced empty states (Journal, Steps, Meetings)
- ✅ Keyboard shortcuts hook (J, S, H, M, E, Esc, ?)
- ✅ Enhanced analytics event types
- ✅ Web Vitals performance monitoring
- ✅ User journey tracking helpers
- ✅ Feature flags system
- ✅ Testing checklist and deployment docs
- ✅ Fixed bugs: featureFlags in AppSettings, promise error handling

**Remaining TODOs:**
1. **Optimistic UI Updates** - Implement optimistic updates for daily cards, journal entries, and streak updates
2. **Enhanced UsageInsights Dashboard** - Add performance metrics chart, feature usage heatmap, and user journey funnel
3. **UserJourneyFunnel Component** - Create visualization component for onboarding and feature adoption funnel

## Key Files & Structure

**Analytics System:**
- `client/src/lib/analytics.ts` - AnalyticsManager with new event types
- `client/src/lib/performance.ts` - Web Vitals monitoring
- `client/src/lib/userJourney.ts` - Page view and feature discovery tracking
- `client/src/types.ts` - AnalyticsEventType includes: toast_shown, skeleton_loader_shown, empty_state_viewed, keyboard_shortcut_used, performance_metric, page_view, feature_discovered

**Charting:**
- Uses Recharts library (already installed)
- Chart wrapper: `client/src/components/ui/chart.tsx` (ChartContainer, ChartTooltip, ChartLegend)
- Example usage: `client/src/routes/Analytics.tsx` shows LineChart, BarChart, PieChart patterns

**Store:**
- `client/src/store/useAppStore.ts` - Zustand store with featureFlags in settings
- `client/src/store/featureFlags.ts` - Feature flag definitions

**Components Created:**
- `client/src/components/Greeting.tsx`
- `client/src/components/EmptyState.tsx`
- `client/src/components/SkeletonLoader.tsx`
- `client/src/lib/toastHelpers.ts`
- `client/src/hooks/useKeyboardShortcuts.ts`

## Next Steps

1. **Optimistic UI Updates:**
   - Update daily card handlers to show immediate UI changes
   - Add rollback on error
   - Update journal entry creation to be optimistic
   - Update streak calculations optimistically

2. **Enhanced UsageInsights:**
   - Add performance metrics chart (LCP, FID, CLS over time)
   - Enhance feature usage heatmap (already has basic 30-day activity)
   - Add user journey funnel visualization

3. **UserJourneyFunnel Component:**
   - Create component showing: Onboarding → First Journal → First Step → First Meeting → etc.
   - Use BarChart or custom visualization
   - Show conversion rates between steps

## Implementation Notes

- All analytics respects `settings.analytics.enabled`
- Feature flags can be toggled in Settings
- Charts should use ChartContainer wrapper for theming
- Optimistic updates should have error handling and rollback
- All changes maintain privacy-first approach (local storage only)

