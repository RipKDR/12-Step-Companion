import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';
import { useAppStore } from '@/store/useAppStore';

/**
 * Initialize Web Vitals performance monitoring
 */
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  const trackEvent = useAppStore.getState().trackAnalyticsEvent;
  const analyticsEnabled = useAppStore.getState().settings.analytics.enabled;

  if (!analyticsEnabled) return;

  const reportMetric = (metric: Metric) => {
    trackEvent('performance_metric', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      delta: metric.delta,
      id: metric.id,
    });
  };

  onCLS(reportMetric);
  onFID(reportMetric);
  onLCP(reportMetric);
  onFCP(reportMetric);
  onTTFB(reportMetric);
};

