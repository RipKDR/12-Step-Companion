/**
 * PostHog Analytics Client (Opt-in)
 * 
 * Anonymous analytics tracking - user must opt in
 */

import posthog from "posthog-js";

let initialized = false;

/**
 * Initialize PostHog (only if user has opted in)
 */
export function initPostHog(userId?: string) {
  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

  if (!apiKey) {
    console.warn("PostHog API key not set");
    return;
  }

  // Check if user has opted in (from localStorage)
  const optedIn = localStorage.getItem("analytics_opt_in") === "true";
  if (!optedIn) {
    return;
  }

  if (initialized) {
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        posthog.debug();
      }
    },
    // Never capture PII
    capture_pageview: true,
    capture_pageleave: true,
    // Disable autocapture to prevent accidental PII capture
    autocapture: false,
  });

  if (userId) {
    posthog.identify(userId, {
      // No PII - only anonymous ID
    });
  }

  initialized = true;
}

/**
 * Track event (only if opted in)
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!initialized) {
    return;
  }

  // Sanitize properties - remove any potential PII
  const sanitized = properties ? sanitizeProperties(properties) : {};

  posthog.capture(eventName, sanitized);
}

/**
 * Sanitize properties to remove PII
 */
function sanitizeProperties(properties: Record<string, unknown>): Record<string, unknown> {
  const piiKeys = ["email", "phone", "name", "address", "ssn", "creditCard"];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (piiKeys.some((pii) => key.toLowerCase().includes(pii))) {
      continue; // Skip PII
    }
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Set user opt-in status
 */
export function setOptIn(optedIn: boolean) {
  localStorage.setItem("analytics_opt_in", String(optedIn));
  if (optedIn) {
    initPostHog();
  } else {
    posthog.reset();
    initialized = false;
  }
}

/**
 * Check if user has opted in
 */
export function hasOptedIn(): boolean {
  return localStorage.getItem("analytics_opt_in") === "true";
}

