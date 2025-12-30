/**
 * Sentry Server Setup
 * 
 * Error tracking for server-side code
 */

import * as Sentry from "@sentry/node";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn("SENTRY_DSN not set, Sentry error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // Remove sensitive data
      if (event.request) {
        delete event.request.headers?.authorization;
        delete event.request.cookies;
      }
      return event;
    },
  });
}

