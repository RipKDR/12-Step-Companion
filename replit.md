# Recovery Companion PWA

## Overview

This is a privacy-first Twelve-Step Recovery Companion built as an installable Progressive Web Application (PWA). The application helps members track clean time, complete step work, maintain a journal, and access emergency support tools. All user data is stored locally by default with optional encrypted backup/export capabilities.

**Core Purpose:** Provide a safe, offline-capable tool for individuals in recovery to track their progress, reflect on their journey, and access support during critical moments.

**Key Features:**
- Live sobriety counter with timezone support
- Step work tracker with 12 steps and customizable questions
- Daily intention and reflection cards
- Personal journal with mood tracking and tags
- Interactive worksheets (HALT check-in, triggers tracker)
- Emergency help floating action button with configurable crisis actions
- Encrypted backup/export system using WebCrypto
- Full offline capability with service worker caching

## User Preferences

Preferred communication style: Simple, everyday language.

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