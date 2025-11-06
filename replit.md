# Recovery Companion PWA

## Overview

This is a privacy-first Twelve-Step Recovery Companion built as an installable Progressive Web Application (PWA). The application helps members track clean time, complete step work, maintain a journal, and access emergency support tools. All user data is stored locally by default with optional encrypted backup/export capabilities.

**Core Purpose:** Provide a safe, offline-capable tool for individuals in recovery to track their progress, reflect on their journey, and access support during critical moments.

**Current Status:** ✅ **PRODUCTION-READY** - All BMAD features completed and tested

**Key Features:**

**BASIC (Must-haves):**
- ✅ Live sobriety counter with timezone support (Australia/Melbourne default with DST awareness)
- ✅ Complete Step work tracker with JSON-loaded NA Step Working Guide content
  - **ALL 12 STEPS fully populated** with authentic recovery questions
    - Step 1: 67 questions, Step 2: 47 questions, Step 3: 39 questions
    - Step 4: 25 questions (moral inventory), Step 5: 15 questions (sharing)
    - Step 6: 15 questions (willingness), Step 7: 15 questions (humility)
    - Step 8: 20 questions (amends list), Step 9: 22 questions (making amends)
    - Step 10: 22 questions (daily inventory), Step 11: 25 questions (prayer/meditation)
    - Step 12: 28 questions (service and spiritual awakening)
  - One-question-at-a-time interface with Previous/Next navigation
  - Smart resume at first unanswered question
  - Section headers and question organization
  - Accurate progress tracking based on answered questions
- ✅ Comprehensive Emergency Help page with:
  - 24/7 crisis hotlines (Lifeline, Alcohol & Drug Support, Beyond Blue, Suicide Call Back Service)
  - Interactive box breathing exercise with visual guidance
  - 3 grounding technique guides (5-4-3-2-1, Physical, Mental)
  - 10 coping strategies for cravings
  - 5-minute timer with supportive messaging
- ✅ Real-time progress tracking (home dashboard + steps grid)
- ✅ Auto-save functionality for all step work answers
- ✅ Daily intention and reflection cards with date-based storage
- ✅ Personal journal with mood tracking (0-10 scale) and tag support
- ✅ Data export (JSON + encrypted backup with AES-GCM encryption)
- ✅ Data import with merge strategy
- ✅ Onboarding flow with profile creation
- ✅ WCAG 2.2 AA accessibility features (skip links, ARIA, semantic HTML)

**MID-TIER (Enhancements):**
- ✅ Interactive worksheets system with:
  - Multi-response append-only design (each completion creates timestamped entry)
  - 6 worksheet templates: HALT Check-In, Triggers & Cravings, Resentment Inventory, Gratitude List, Daily Tenth Step, Demo templates
  - Form validation and field types (text, textarea, select, number)
  - Real-time response count tracking
- ✅ Meeting tracker with:
  - Log attendance by name, type (NA/AA/CA/SMART/Other), location, date, notes
  - Statistics dashboard (total meetings, last 30 days)
  - Meeting history with color-coded badges
- ✅ Milestone celebration system with:
  - 9 sobriety milestones (24 hours → 3+ years)
  - Progress tracking and next milestone countdown
  - Achievement badges and encouraging messages
- ✅ Full offline PWA capability with:
  - Service worker registration and caching
  - Update notification system
  - Install prompt support
  - Standalone mode detection

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 6, 2025)

**Implementation Complete:**
- ✅ Zustand store with localStorage persistence, migrations, and storage quota detection
- ✅ DST-safe time utilities for Australia/Melbourne timezone
- ✅ AES-GCM encryption for backup files with PBKDF2 key derivation (100k iterations)
- ✅ JSON-based content system: step questions load from `/client/public/content/steps/*.json`
- ✅ All routes connected to store with reactive updates (Home, Steps, Journal, Settings, Onboarding)
- ✅ Two-step onboarding flow with profile persistence
- ✅ Real-time progress tracking with accurate question counts from JSON
- ✅ Journal entries with mood slider, tags, and search functionality
- ✅ Export/Import system with JSON and encrypted backup support
- ✅ **NA Step Working Guide integration for Steps 1-3** (67, 47, and 39 questions respectively)
- ✅ **One-question-at-a-time interface** with Previous/Next navigation
- ✅ **Smart resume functionality** - automatically resumes at first unanswered question
- ✅ **Accurate progress tracking** based on answered questions, not just viewing position

**Bugs Fixed:**
- Fixed JSON file serving (moved from `/public/` to `/client/public/`)
- Fixed step progress reactivity (added stepAnswersState to useMemo dependencies)
- Fixed Home dashboard to use real JSON question counts (was hardcoded to 10)
- Fixed nested anchor tag warnings in navigation
- Fixed progress tracking to show actual completion vs. current position

**E2E Testing:**
- ✅ Onboarding → Home → Steps → Journal → Settings flow verified
- ✅ Step work autosave and progress tracking validated
- ✅ Data persistence across page refreshes confirmed
- ✅ One-question-at-a-time navigation with Previous/Next buttons verified
- ✅ Progress calculation based on answered questions confirmed
- ✅ Auto-resume at first unanswered question validated
- ✅ All test scenarios passing

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and dev server
- **Wouter** for lightweight client-side routing
- **Zustand** for state management with persistent storage
- **TanStack Query** for server state management (prepared for future API integration)

**UI Component System:**
- **Shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for styling with custom design system
- Design inspired by Apple Health and Google Material with therapeutic, calm aesthetics
- Extensive use of CSS variables for theming (light/dark mode support)

**State Management Strategy:**
- Zustand store with persistence middleware for all app state
- Local-first architecture - all data stored in browser storage
- State migration system for future schema updates
- Feature flags system for gradual rollout capabilities

**PWA Capabilities:**
- Service worker registration via Workbox
- Offline-first design with app shell caching
- Installable with web manifest
- Update notification system for new service worker versions

### Backend Architecture

**Server Framework:**
- **Express.js** server with TypeScript
- Vite integration for HMR in development
- Session-based authentication ready for Replit Auth

**Authentication:**
- Replit Auth (OpenID Connect) integration prepared
- Passport.js strategy implementation
- Session storage using PostgreSQL via connect-pg-simple
- User profile storage with Drizzle ORM

**API Design:**
- RESTful endpoints under `/api` prefix
- Protected routes using `isAuthenticated` middleware
- JSON request/response format
- Centralized error handling

**Data Layer:**
- Prepared for optional cloud sync (currently stub/disabled)
- User data model supports firstName, lastName, email, profile image
- Extensible storage interface pattern for future backend features

### Data Storage Solutions

**Client-Side Storage:**
- **Primary:** LocalStorage for app state persistence via Zustand
- **Fallback:** IndexedDB adapter prepared for larger datasets
- Storage abstraction layer allows switching between adapters
- All user data (profile, steps, journal, worksheets) stored locally

**Server-Side Storage (Prepared):**
- **PostgreSQL** via Neon serverless driver
- **Drizzle ORM** for type-safe database queries
- Schema includes:
  - `users` table for Replit Auth user profiles
  - `sessions` table for Express session storage
- Migration system ready via drizzle-kit

**Data Models:**
- Profile: name, clean date, timezone, passcode flag
- Step answers: per-question responses with tags and timestamps
- Daily cards: morning intent and evening reflection
- Journal entries: content, mood (0-10 scale), tags, timestamps
- Worksheet responses: field-level answers for structured templates
- Emergency actions: configurable crisis support actions

### Authentication and Authorization

**Current State:**
- Replit Auth blueprint implemented but app functions fully offline
- No authentication required for MVP - all features work locally
- Session management infrastructure ready for future cloud sync

**Authentication Flow (Prepared):**
1. User clicks login → redirects to Replit OIDC
2. Callback validates tokens and creates session
3. User profile stored in PostgreSQL
4. Session cookie enables protected API access
5. Frontend checks `/api/auth/user` for current user

**Authorization Strategy:**
- Currently all features available without login (local-only mode)
- Protected API routes use `isAuthenticated` middleware
- Future: User can enable cloud sync which requires authentication

### External Dependencies

**Third-Party Services:**
- **Neon Database**: Serverless PostgreSQL for cloud storage (prepared, not required)
- **Replit Auth**: OpenID Connect authentication provider (optional)

**Key NPM Packages:**
- `@neondatabase/serverless`: PostgreSQL driver with WebSocket support
- `drizzle-orm` + `drizzle-kit`: Type-safe ORM and migrations
- `@radix-ui/*`: Headless accessible UI primitives (18+ packages)
- `@tanstack/react-query`: Server state management
- `zustand`: Client state management
- `wouter`: Lightweight routing
- `date-fns`: Date manipulation and formatting
- `nanoid`: Unique ID generation
- `workbox-window`: Service worker lifecycle management
- `idb-keyval`: IndexedDB wrapper for key-value storage
- `passport` + `openid-client`: Authentication strategy
- `express-session` + `connect-pg-simple`: Session management

**Content Loading System:**
- Step questions loaded from `/content/steps/[1-12].json`
- Worksheet templates loaded from `/content/worksheets/*.json`
- Content cached in memory after first load
- Extensible for user-provided content imports

**Encryption:**
- WebCrypto API for AES-GCM encryption
- PBKDF2 key derivation (100,000 iterations)
- Used for encrypted backup export (.enc files)
- No external crypto libraries required

**Design System:**
- Tailwind CSS with custom configuration
- CSS variables for theming (47+ custom properties)
- "New York" shadcn style variant
- Neutral base color palette
- Responsive breakpoints (mobile-first)
- High contrast mode support prepared