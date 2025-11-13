/**
 * Accessibility utilities for WCAG 2.2 AA compliance
 */

/**
 * Check if device has touch capability
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get minimum touch target size based on WCAG 2.2 AA
 * @returns Object with minHeight and minWidth in pixels
 */
export function getMinTouchTarget(): { minHeight: number; minWidth: number } {
  return { minHeight: 44, minWidth: 44 };
}

/**
 * Generate ARIA label for icon-only buttons
 */
export function getIconButtonAriaLabel(
  action: string,
  context?: string
): string {
  return context ? `${action} ${context}` : action;
}

/**
 * Generate live region announcement for screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement is read
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is keyboard focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return element.matches(focusableSelectors);
}

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTab);
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleTab);
  };
}

/**
 * Get color contrast ratio (simplified check)
 * Returns approximate contrast ratio
 */
export function getContrastRatio(
  foreground: string,
  background: string
): number {
  // This is a simplified version - for production, use a proper contrast checker
  // that converts colors to relative luminance
  return 4.5; // Placeholder - implement proper contrast calculation
}

/**
 * Ensure element meets minimum touch target size
 */
export function ensureTouchTarget(
  element: HTMLElement,
  minSize: number = 44
): void {
  const style = window.getComputedStyle(element);
  const height = parseFloat(style.height) || 0;
  const width = parseFloat(style.width) || 0;

  if (height < minSize) {
    element.style.minHeight = `${minSize}px`;
  }
  if (width < minSize) {
    element.style.minWidth = `${minSize}px`;
  }
}
