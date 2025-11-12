/**
 * Type definitions for PWA install prompt
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export interface WindowWithInstallPrompt extends Window {
  deferredPrompt?: BeforeInstallPromptEvent;
}

export interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

