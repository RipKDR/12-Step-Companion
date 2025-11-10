import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAppStore } from '@/store/useAppStore';

interface KeyboardShortcutsConfig {
  enabled?: boolean;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig = { enabled: true }) => {
  const [, setLocation] = useLocation();
  const trackAnalyticsEvent = useAppStore((state) => state.trackAnalyticsEvent);
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    if (!config.enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }

      // Don't trigger if modifier keys are pressed (except for ? which needs Shift)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Handle shortcuts
      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          setLocation('/journal');
          trackAnalyticsEvent('keyboard_shortcut_used', { shortcut: 'j', target: 'journal' });
          break;
        case 's':
          e.preventDefault();
          setLocation('/steps');
          trackAnalyticsEvent('keyboard_shortcut_used', { shortcut: 's', target: 'steps' });
          break;
        case 'h':
          e.preventDefault();
          setLocation('/');
          trackAnalyticsEvent('keyboard_shortcut_used', { shortcut: 'h', target: 'home' });
          break;
        case 'm':
          e.preventDefault();
          setLocation('/more');
          trackAnalyticsEvent('keyboard_shortcut_used', { shortcut: 'm', target: 'more' });
          break;
        case 'e':
          e.preventDefault();
          setLocation('/emergency');
          trackAnalyticsEvent('keyboard_shortcut_used', { shortcut: 'e', target: 'emergency' });
          break;
        case 'escape':
          e.preventDefault();
          // Close any open modals/dialogs
          const dialogs = document.querySelectorAll('[role="dialog"]');
          dialogs.forEach((dialog) => {
            const closeButton = dialog.querySelector('[aria-label="Close"], button[data-dismiss]');
            if (closeButton instanceof HTMLElement) {
              closeButton.click();
            }
          });
          trackAnalyticsEvent('keyboard_shortcut_used', { shortcut: 'escape', target: 'close_modal' });
          break;
        case '?':
          if (e.shiftKey) {
            e.preventDefault();
            // Show keyboard shortcuts help modal
            // This would need a modal component - for now just track
            trackAnalyticsEvent('keyboard_shortcut_used', { shortcut: '?', target: 'help' });
            // TODO: Show help modal
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [config.enabled, setLocation, trackAnalyticsEvent]);
};

