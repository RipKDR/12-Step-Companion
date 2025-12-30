# 12-Step Recovery Companion - Architecture Documentation

**Last Updated**: 2025-01-27  
**Status**: Active Development

---

## Overview

This project uses a **monorepo structure** with multiple applications and shared packages. The codebase is currently in a **transitional state** with both legacy and modern structures coexisting.

---

## Current Structure

### Active Applications

#### 1. **Web Application** (`apps/web/`)
- **Framework**: Next.js 16 (App Router)
- **Purpose**: Sponsor/admin portal and web interface
- **Status**: ✅ **ACTIVE** - Production-ready
- **Tech Stack**:
  - Next.js 16.0.3
  - React 19.0.0
  - tRPC for type-safe APIs
  - NextAuth for authentication
  - Tailwind CSS + shadcn/ui

**Key Files**:
- `apps/web/src/app/` - Next.js App Router pages
- `apps/web/src/components/` - React components
- `apps/web/src/lib/` - Utilities (tRPC client, Supabase client)

**Build Commands**:
```bash
cd apps/web
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
```

---

#### 2. **Mobile Application** (`apps/mobile/`)
- **Framework**: Expo (React Native)
- **Purpose**: Native mobile app for iOS/Android
- **Status**: ✅ **ACTIVE** - In development
- **Tech Stack**:
  - Expo SDK 52
  - React Native 1.74.0
  - Expo Router for navigation
  - Expo Location, Notifications, Secure Store
  - SQLite for offline storage

**Key Files**:
- `apps/mobile/src/app/` - Expo Router pages
- `apps/mobile/src/components/` - React Native components

**Build Commands**:
```bash
cd apps/mobile
npm start        # Expo dev server
npm run android  # Run on Android
npm run ios      # Run on iOS
```

---

#### 3. **Legacy Client** (`client/`)
- **Framework**: React 19 + Vite
- **Purpose**: Original PWA/web application
- **Status**: ⚠️ **LEGACY** - Still functional but being phased out
- **Tech Stack**:
  - React 19.0.0
  - Vite 5.4.21
  - Wouter for routing
  - Zustand for state management
  - PWA with service worker

**Key Files**:
- `client/src/routes/` - Page components
- `client/src/components/` - React components
- `client/src/lib/` - Utilities
- `client/src/store/` - Zustand stores

**Build Commands**:
```bash
cd client
npm run dev      # Vite dev server
npm run build    # Production build
```

**Note**: This structure is maintained for backward compatibility and may be deprecated in favor of `apps/web` in the future.

---

### Shared Packages

#### 1. **API Package** (`packages/api/`)
- **Purpose**: tRPC routers and API logic
- **Status**: ✅ **ACTIVE**
- **Exports**: tRPC routers, API utilities
- **Used By**: `apps/web`, `apps/mobile`

**Key Files**:
- `packages/api/src/routers/` - tRPC routers
- `packages/api/src/lib/` - API utilities

---

#### 2. **Types Package** (`packages/types/`)
- **Purpose**: Shared TypeScript types
- **Status**: ✅ **ACTIVE**
- **Exports**: TypeScript types, Zod schemas
- **Used By**: All applications

**Key Files**:
- `packages/types/src/` - Type definitions

---

#### 3. **UI Package** (`packages/ui/`)
- **Purpose**: Shared UI components
- **Status**: ⚠️ **PLANNED** - Currently minimal
- **Future**: Will contain shared components between web and mobile

---

### Backend Services

#### 1. **Express Server** (`server/`)
- **Framework**: Express.js
- **Purpose**: API server, migrations, utilities
- **Status**: ✅ **ACTIVE** - Used by legacy client
- **Tech Stack**:
  - Express 4.21.2
  - Drizzle ORM
  - PostgreSQL (Supabase)

**Key Files**:
- `server/index.ts` - Server entry point
- `server/routes.ts` - API routes
- `server/migrations/` - Database migrations
- `server/scripts/` - Utility scripts

**Note**: The modern stack uses tRPC (`packages/api`) instead of Express routes. Express server is maintained for legacy client compatibility.

---

#### 2. **Supabase** (External)
- **Purpose**: Database, Auth, Storage
- **Status**: ✅ **ACTIVE** - Primary backend
- **Services Used**:
  - PostgreSQL database
  - Row Level Security (RLS)
  - Authentication
  - Storage (optional)

**Migrations**:
- `server/migrations/0001_supabase_schema.sql` - Database schema
- `server/migrations/0002_rls_policies.sql` - Security policies

---

## Directory Structure

```
12-Step-Companion/
├── apps/
│   ├── web/              # ✅ ACTIVE - Next.js web app
│   │   ├── src/
│   │   │   ├── app/      # Next.js App Router
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── package.json
│   └── mobile/           # ✅ ACTIVE - Expo mobile app
│       ├── src/
│       │   └── app/      # Expo Router
│       └── package.json
│
├── packages/
│   ├── api/              # ✅ ACTIVE - tRPC routers
│   │   └── src/
│   ├── types/            # ✅ ACTIVE - Shared types
│   │   └── src/
│   └── ui/               # ⚠️ PLANNED - Shared UI
│
├── client/               # ⚠️ LEGACY - React/Vite PWA
│   ├── src/
│   │   ├── routes/
│   │   ├── components/
│   │   └── lib/
│   └── public/
│
├── server/               # ✅ ACTIVE - Express backend
│   ├── index.ts
│   ├── routes.ts
│   ├── migrations/
│   └── scripts/
│
├── shared/               # ✅ ACTIVE - Shared schemas
│   └── schema.ts
│
├── scripts/              # ✅ ACTIVE - Utility scripts
│   ├── verify-setup.ts
│   └── validate-build.ts
│
└── package.json          # Root package.json (monorepo)
```

---

## Which Structure Should I Use?

### For New Web Development
✅ **Use `apps/web/`** (Next.js 16)
- Modern App Router architecture
- Server-side rendering
- Type-safe APIs with tRPC
- Production-ready

### For New Mobile Development
✅ **Use `apps/mobile/`** (Expo)
- Native iOS/Android support
- Offline-first with SQLite
- Location and notification support

### For Legacy Maintenance
⚠️ **Use `client/`** (React/Vite)
- Only if maintaining existing features
- Consider migrating to `apps/web/` for new features

---

## Migration Path

### From Legacy Client to Modern Web App

**Current State**:
- `client/` - Legacy React/Vite PWA
- `apps/web/` - Modern Next.js app (sponsor portal)

**Future State**:
- `apps/web/` - Unified web application (PWA + sponsor portal)
- `client/` - Deprecated (remove after migration)

**Migration Steps**:
1. ✅ Next.js app created (`apps/web/`)
2. ✅ tRPC API layer established (`packages/api/`)
3. ⏳ Migrate features from `client/` to `apps/web/`
4. ⏳ Update build scripts
5. ⏳ Remove `client/` directory

**Timeline**: TBD - No immediate plans to deprecate `client/`

---

## Build System

### Monorepo Management

**Package Manager**: pnpm (workspace-aware)
- `pnpm-workspace.yaml` - Defines workspace packages
- `turbo.json` - Build orchestration (optional)

**Build Tools**:
- **Turbo**: Optional build orchestration
- **pnpm**: Primary package manager
- **npm**: Fallback (works but not optimized)

### Build Commands

**Root Level**:
```bash
npm run dev          # Legacy client + server
npm run build        # Legacy build
npm run build:web    # Build Next.js app
npm run build:client # Build legacy client
npm run type-check   # TypeScript check
```

**Application Level**:
```bash
# Next.js app
cd apps/web && npm run dev

# Mobile app
cd apps/mobile && npm start

# Legacy client
cd client && npm run dev
```

---

## Data Flow

### Modern Stack (apps/web, apps/mobile)

```
User → Next.js/Expo App
  ↓
tRPC Client (packages/api)
  ↓
tRPC Server (packages/api)
  ↓
Supabase (Database/Auth)
```

### Legacy Stack (client/)

```
User → React/Vite App
  ↓
Express API (server/routes.ts)
  ↓
Supabase (Database)
```

---

## Environment Variables

### Required for All Apps

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # Server-side only
```

### Next.js Specific (`apps/web/`)

```bash
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

### Mobile Specific (`apps/mobile/`)

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### Legacy Client (`client/`)

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## Testing Strategy

### Current State
- ⚠️ Limited test coverage
- Unit tests: `apps/mobile/src/__tests__/`
- Integration tests: `packages/api/src/__tests__/`

### Recommended Structure
```
apps/web/src/__tests__/        # Next.js tests
apps/mobile/src/__tests__/     # Expo tests
packages/api/src/__tests__/    # API tests
server/utils/__tests__/        # Server utilities
```

---

## Deployment

### Web Application (`apps/web/`)
- **Platform**: Vercel (recommended) or Railway
- **Build**: `cd apps/web && npm run build`
- **Config**: `vercel.json`

### Mobile Application (`apps/mobile/`)
- **Platform**: EAS Build (Expo)
- **Build**: `eas build --platform ios/android`
- **Config**: `apps/mobile/eas.json`

### Legacy Client (`client/`)
- **Platform**: Railway, Render, or Fly.io
- **Build**: `npm run build`
- **Config**: `railway.json`

---

## Key Decisions

### Why Dual Structure?

1. **Gradual Migration**: Migrating from legacy to modern stack incrementally
2. **Different Use Cases**: 
   - `client/` - Original PWA
   - `apps/web/` - Sponsor portal (needs SSR)
   - `apps/mobile/` - Native mobile features
3. **Backward Compatibility**: Maintain existing functionality during transition

### Why Monorepo?

1. **Code Sharing**: Shared types and API logic
2. **Type Safety**: Single source of truth for types
3. **Consistency**: Same dependencies across apps
4. **Developer Experience**: Single repo, unified tooling

---

## Future Roadmap

### Short Term
- ✅ Complete Next.js app setup
- ✅ Establish tRPC API layer
- ⏳ Migrate critical features from `client/` to `apps/web/`

### Medium Term
- ⏳ Deprecate `client/` directory
- ⏳ Expand `packages/ui/` with shared components
- ⏳ Improve test coverage

### Long Term
- ⏳ Unified web application (`apps/web/`)
- ⏳ Full mobile app (`apps/mobile/`)
- ⏳ Shared component library (`packages/ui/`)

---

## Questions?

If you're unsure which structure to use:

1. **New web feature?** → Use `apps/web/`
2. **New mobile feature?** → Use `apps/mobile/`
3. **Bug fix in legacy?** → Use `client/`
4. **Shared logic?** → Use `packages/api/` or `packages/types/`

---

**Last Updated**: 2025-01-27  
**Maintained By**: Development Team

