# Complete Setup Guide - 12-Step Recovery Companion Mobile App

## Prerequisites

- Node.js >= 20.0.0 < 21.0.0
- pnpm >= 8.0.0
- Expo CLI (installed globally or via npx)
- Supabase account (for backend)
- iOS Simulator (Mac) or Android Emulator (for testing)

## Step 1: Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install all dependencies
pnpm install

# Install mobile-specific dependencies
cd apps/mobile
pnpm add @react-native-community/datetimepicker
cd ../..
```

## Step 2: Environment Configuration

### Root `.env` file
Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration (from Supabase Dashboard → Settings → API)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Google Gemini API Key for AI Sponsor Chat
GEMINI_API_KEY=your_key_here

# Database URL (if using cloud database)
DATABASE_URL=postgresql://user:password@host/database

# Session secret for authentication
SESSION_SECRET=generate_with_openssl_rand_base64_32
```

### Mobile `.env` file
Copy `apps/mobile/.env.example` to `apps/mobile/.env`:

```env
# Expo Public Variables (REQUIRED)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_API_URL=http://localhost:5000
```

**Important:** Variables must start with `EXPO_PUBLIC_` to be accessible in the mobile app.

## Step 3: Database Setup

### Run Migrations

```bash
# Apply all migrations to Supabase
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Manual SQL execution
# Copy contents of each migration file and run in Supabase SQL Editor:
# - server/migrations/0001_supabase_schema.sql
# - server/migrations/0002_rls_policies.sql
# - server/migrations/0003_daily_challenges.sql
# - server/migrations/0004_notification_settings.sql
```

### Verify Tables Created

Check Supabase Dashboard → Table Editor to verify:
- ✅ profiles
- ✅ steps
- ✅ step_entries
- ✅ daily_entries
- ✅ daily_challenges
- ✅ challenge_completions
- ✅ challenge_streaks
- ✅ notification_settings
- ✅ action_plans
- ✅ routines
- ✅ sponsor_relationships
- ✅ trigger_locations
- ✅ notification_tokens
- ✅ risk_signals
- ✅ audit_log

## Step 4: Seed Data (Optional)

```bash
# Seed step definitions
pnpm run seed:steps

# Seed sample data for testing
pnpm run seed:sample
```

## Step 5: Start Development Server

### Terminal 1: Backend Server
```bash
pnpm run dev
```

### Terminal 2: Mobile App
```bash
cd apps/mobile
pnpm start
```

Or from root:
```bash
pnpm run mobile:dev
```

## Step 6: Run on Device/Simulator

### iOS
```bash
cd apps/mobile
pnpm ios
```

### Android
```bash
cd apps/mobile
pnpm android
```

## Step 7: Verify Installation

### Check Build
```bash
# Type check all projects
pnpm run type-check:all

# Lint code
pnpm run lint
```

### Test Critical Features
1. ✅ App launches without errors
2. ✅ Authentication works
3. ✅ Database connection works
4. ✅ Notifications can be scheduled
5. ✅ Offline mode works (SQLite)
6. ✅ All screens accessible
7. ✅ tRPC API calls work

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Errors
```bash
cd apps/mobile
pnpm start --clear
```

#### 2. Dependency Conflicts
```bash
cd apps/mobile
pnpm install:fix
```

#### 3. TypeScript Errors
```bash
# Clean and rebuild
rm -rf node_modules
rm -rf apps/mobile/node_modules
pnpm install
```

#### 4. Expo SDK Version Mismatch
```bash
cd apps/mobile
npx expo install --fix
```

#### 5. Missing Native Modules
```bash
cd apps/mobile
npx expo prebuild --clean
```

#### 6. Database Connection Issues
- Verify Supabase URL and keys in `.env`
- Check Supabase project is active
- Verify RLS policies are enabled

#### 7. Notification Permissions
- iOS: Check Info.plist permissions
- Android: Check AndroidManifest.xml permissions
- Test on physical device (simulators have limited notification support)

## Production Build

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure build
cd apps/mobile
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Local Build
```bash
cd apps/mobile
pnpm android  # or pnpm ios
```

## Environment Variables for Production

Set these in EAS Secrets or your CI/CD:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-anon-key
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.yourdomain.com
```

## Next Steps

1. ✅ Complete setup
2. ✅ Test all features
3. ✅ Configure error tracking (Sentry)
4. ✅ Set up analytics (PostHog)
5. ✅ Configure push notifications
6. ✅ Test on physical devices
7. ✅ Prepare for App Store/Play Store submission

## Support

For issues:
1. Check `BMAD_ANALYSIS.md` for known issues
2. Review error logs
3. Check Supabase logs
4. Verify environment variables
5. Check Expo documentation

