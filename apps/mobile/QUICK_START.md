# Mobile App Quick Start

## Fastest Way to Get Running

```bash
# 1. Install dependencies
pnpm install
cd apps/mobile
pnpm add @react-native-community/datetimepicker

# 2. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start the app
pnpm start

# 4. Press 'i' for iOS or 'a' for Android
```

## Required Environment Variables

Minimum required in `apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:5000
```

## Common Commands

```bash
# Start development server
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android

# Clear cache and restart
pnpm start --clear

# Fix dependency issues
pnpm install:fix
```

## First Run Checklist

- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Supabase project configured
- [ ] Database migrations run
- [ ] App launches successfully
- [ ] Can sign in/create account
- [ ] Can create daily entry
- [ ] Can view steps
- [ ] Notifications work (test on device)

