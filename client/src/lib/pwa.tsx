import { Workbox } from 'workbox-window';
import type {
  BeforeInstallPromptEvent,
  WindowWithInstallPrompt,
  NavigatorWithStandalone,
} from './pwa-types';
import { logger } from './logger';
import { toast } from '@/hooks/use-toast';

let wb: Workbox | null = null;

/**
 * Register service worker and set up update notifications
 */
export function registerServiceWorker(onUpdate?: () => void): void {
  if ('serviceWorker' in navigator) {
    wb = new Workbox('/sw.js');

    wb.addEventListener('waiting', () => {
      logger.info('New service worker waiting');
      if (onUpdate) {
        onUpdate();
      }
    });

    wb.addEventListener('activated', (event) => {
      if (!event.isUpdate) {
        logger.info('Service worker activated for first time');
      } else {
        logger.info('Service worker updated successfully');
      }
    });

    wb.register().catch((error) => {
      logger.error('Service worker registration failed', error);
      
      // Show user-facing error notification
      // Note: Users can retry by refreshing the page
      toast({
        title: 'Service Worker Error',
        description: 'Failed to register service worker. Some features may not work offline. Please refresh the page to retry.',
        variant: 'destructive',
      });
    });
  }
}

/**
 * Skip waiting and activate new service worker
 */
export function skipWaiting(): void {
  if (wb) {
    wb.messageSkipWaiting();
  }
}

/**
 * Check if app is running in standalone mode (installed as PWA)
 */
export function isStandalone(): boolean {
  const nav = window.navigator as NavigatorWithStandalone;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  );
}

/**
 * Prompt user to install PWA (only works on certain browsers/contexts)
 */
export function promptInstall(): Promise<boolean> {
  return new Promise((resolve) => {
    const win = window as WindowWithInstallPrompt;
    const deferredPrompt = win.deferredPrompt;
    
    if (!deferredPrompt) {
      logger.info('Install prompt not available');
      resolve(false);
      return;
    }

    deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        logger.info('User accepted install prompt');
        resolve(true);
      } else {
        logger.info('User dismissed install prompt');
        resolve(false);
      }
      
      win.deferredPrompt = undefined;
    });
  });
}

// Store the install prompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  const win = window as WindowWithInstallPrompt;
  win.deferredPrompt = e as BeforeInstallPromptEvent;
  logger.info('Install prompt captured');
});
