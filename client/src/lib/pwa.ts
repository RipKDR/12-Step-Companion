import { Workbox } from 'workbox-window';
import type {
  BeforeInstallPromptEvent,
  WindowWithInstallPrompt,
  NavigatorWithStandalone,
} from './pwa-types';

let wb: Workbox | null = null;

/**
 * Register service worker and set up update notifications
 */
export function registerServiceWorker(
  onUpdate?: (registration: ServiceWorkerRegistration) => void
): void {
  if ('serviceWorker' in navigator) {
    wb = new Workbox('/sw.js');

    wb.addEventListener('waiting', () => {
      console.log('New service worker waiting');
      if (onUpdate && wb) {
        wb.getSW().then((sw) => {
          if (sw) {
            onUpdate(sw);
          }
        });
      }
    });

    wb.addEventListener('activated', (event) => {
      if (!event.isUpdate) {
        console.log('Service worker activated for first time');
      } else {
        console.log('Service worker updated successfully');
      }
    });

    wb.register().catch((error) => {
      console.error('Service worker registration failed:', error);
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
      console.log('Install prompt not available');
      resolve(false);
      return;
    }

    deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted install prompt');
        resolve(true);
      } else {
        console.log('User dismissed install prompt');
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
  console.log('Install prompt captured');
});
