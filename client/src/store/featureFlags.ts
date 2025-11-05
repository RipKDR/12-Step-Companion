export interface FeatureFlags {
  cloudSync: boolean;
  analytics: boolean;
  pushNotifications: boolean;
  advancedWorksheets: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  cloudSync: false, // Stub - not implemented in MVP
  analytics: false, // Privacy-first - no analytics
  pushNotifications: false, // Future feature
  advancedWorksheets: false, // Future feature
};
