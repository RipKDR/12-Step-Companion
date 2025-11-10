import { useAppStore } from '@/store/useAppStore';

/**
 * Track page views for user journey analysis
 */
export const trackPageView = (page: string, previousPage?: string) => {
  const trackAnalyticsEvent = useAppStore.getState().trackAnalyticsEvent;
  const analyticsEnabled = useAppStore.getState().settings.analytics.enabled;

  if (!analyticsEnabled) return;

  trackAnalyticsEvent('page_view', {
    page,
    previousPage,
    timestamp: Date.now(),
  });
};

/**
 * Track feature discovery (only tracks once per feature)
 */
export const trackFeatureDiscovery = (feature: string) => {
  const trackAnalyticsEvent = useAppStore.getState().trackAnalyticsEvent;
  const analyticsEnabled = useAppStore.getState().settings.analytics.enabled;

  if (!analyticsEnabled) return;

  try {
    const discovered = localStorage.getItem('discovered_features') || '[]';
    const features = JSON.parse(discovered) as string[];
    
    if (!features.includes(feature)) {
      features.push(feature);
      localStorage.setItem('discovered_features', JSON.stringify(features));
      trackAnalyticsEvent('feature_discovered', { feature });
    }
  } catch (error) {
    console.error('[UserJourney] Failed to track feature discovery:', error);
  }
};

/**
 * Track empty state views
 */
export const trackEmptyStateView = (page: string, stateType: string) => {
  const trackAnalyticsEvent = useAppStore.getState().trackAnalyticsEvent;
  const analyticsEnabled = useAppStore.getState().settings.analytics.enabled;

  if (!analyticsEnabled) return;

  trackAnalyticsEvent('empty_state_viewed', {
    page,
    stateType,
  });
};

/**
 * Track skeleton loader shown
 */
export const trackSkeletonLoaderShown = (component: string) => {
  const trackAnalyticsEvent = useAppStore.getState().trackAnalyticsEvent;
  const analyticsEnabled = useAppStore.getState().settings.analytics.enabled;

  if (!analyticsEnabled) return;

  trackAnalyticsEvent('skeleton_loader_shown', {
    component,
  });
};

/**
 * Track toast notification shown
 */
export const trackToastShown = (type: string, title?: string) => {
  const trackAnalyticsEvent = useAppStore.getState().trackAnalyticsEvent;
  const analyticsEnabled = useAppStore.getState().settings.analytics.enabled;

  if (!analyticsEnabled) return;

  trackAnalyticsEvent('toast_shown', {
    type,
    title,
  });
};

