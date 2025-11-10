export interface FeatureFlags {
  cloudSync: boolean;
  analytics: boolean;
  pushNotifications: boolean;
  advancedWorksheets: boolean;
  enhancedHomePage: boolean;
  toastNotifications: boolean;
  skeletonLoaders: boolean;
  keyboardShortcuts: boolean;
  performanceMonitoring: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  cloudSync: false, // Stub - not implemented in MVP
  analytics: false, // Privacy-first - no analytics
  pushNotifications: false, // Future feature
  advancedWorksheets: false, // Future feature
  enhancedHomePage: true, // Enable by default
  toastNotifications: true, // Enable by default
  skeletonLoaders: true, // Enable by default
  keyboardShortcuts: true, // Enable by default
  performanceMonitoring: true, // Enable by default
};
