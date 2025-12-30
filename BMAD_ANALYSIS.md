# BMAD Analysis: Complete Build & Run Checklist

## BUILD Phase - Critical Missing Items

### 1. Missing Dependencies

#### Mobile App (`apps/mobile/package.json`)
- ❌ `@react-native-community/datetimepicker` - Used in notifications settings
- ❌ `@react-native-voice/voice` - For speech recognition (or alternative)
- ✅ All other dependencies present

**Action Required:**
```bash
cd apps/mobile
pnpm add @react-native-community/datetimepicker
pnpm add @react-native-voice/voice
```

### 2. Missing Database Migration

#### Notification Settings Table
- ❌ `notification_settings` table missing from migrations
- ✅ Referenced in code (`packages/api/src/routers/notifications.ts`)
- ✅ Used in `apps/mobile/src/lib/smart-notifications.ts`

**Action Required:** Create migration `server/migrations/0004_notification_settings.sql`

### 3. Missing Assets

#### Required Assets (Check if present):
- ✅ `apps/mobile/assets/icon.png` - App icon
- ✅ `apps/mobile/assets/splash.png` - Splash screen
- ✅ `apps/mobile/assets/adaptive-icon.png` - Android adaptive icon
- ✅ `apps/mobile/assets/notification-icon.png` - Notification icon
- ✅ `apps/mobile/assets/favicon.png` - Web favicon

**Status:** All assets present ✅

### 4. Missing Configuration Files

#### Expo Config
- ✅ `apps/mobile/app.json` - Present and configured
- ✅ `apps/mobile/babel.config.js` - Present
- ✅ `apps/mobile/tsconfig.json` - Present

#### Environment Variables
- ✅ `apps/mobile/.env.example` - Present
- ⚠️ Need to verify all required variables documented

### 5. Missing Type Definitions

#### Check Required:
- ✅ TypeScript types for all components
- ✅ tRPC router types exported
- ⚠️ Need to verify `AppRouter` type is properly exported

### 6. Missing UI Components

#### Check Components:
- ✅ `Modal` - Present in `apps/mobile/src/components/ui/Modal.tsx`
- ✅ `Toast` - Present in `apps/mobile/src/components/ui/Toast.tsx`
- ✅ `Button`, `Input`, `Badge`, `Slider` - Need to verify all exist

## MEASURE Phase - Testing & Validation

### 1. Missing Test Files
- ❌ Unit tests for hooks
- ❌ Integration tests for API routes
- ❌ E2E tests for critical flows

### 2. Missing Error Tracking Setup
- ✅ Sentry configured in dependencies
- ⚠️ Need to verify Sentry initialization in app

### 3. Missing Analytics Setup
- ✅ PostHog in dependencies
- ⚠️ Need to verify PostHog initialization

## ANALYZE Phase - Monitoring & Logging

### 1. Missing Logging Configuration
- ⚠️ Need structured logging setup
- ⚠️ Need error boundary components

### 2. Missing Performance Monitoring
- ⚠️ Need performance tracking setup

## DEPLOY Phase - Build & Deployment

### 1. Missing Build Scripts
- ✅ Build scripts present in `package.json`
- ⚠️ Need to verify EAS build configuration

### 2. Missing CI/CD Configuration
- ❌ GitHub Actions workflow
- ❌ EAS build configuration

### 3. Missing Environment Validation
- ⚠️ Need runtime environment variable validation

## Critical Path Items (Must Fix for Build)

### Priority 1: Blocking Build
1. ✅ Add `@react-native-community/datetimepicker` dependency
2. ✅ Create `notification_settings` migration
3. ✅ Verify all UI components exist
4. ✅ Verify tRPC client configuration

### Priority 2: Blocking Runtime
1. ✅ Implement speech recognition (or provide fallback)
2. ✅ Verify all screens/routes exist
3. ✅ Verify SQLite initialization
4. ✅ Verify SecureStore implementation

### Priority 3: Quality & Testing
1. Add error boundaries
2. Add loading states everywhere
3. Add error handling everywhere
4. Add test files

## Files to Create/Fix

1. `server/migrations/0004_notification_settings.sql` - NEW
2. Update `apps/mobile/package.json` - Add missing dependencies
3. `apps/mobile/eas.json` - EAS build config (optional but recommended)
4. `.github/workflows/build.yml` - CI/CD (optional)

## Verification Checklist

- [ ] All dependencies installed
- [ ] All migrations run successfully
- [ ] All environment variables set
- [ ] App builds without errors
- [ ] App runs without crashes
- [ ] All screens accessible
- [ ] All API endpoints working
- [ ] Offline mode works
- [ ] Notifications work
- [ ] Voice input works (or gracefully fails)

