# Build & Run Checklist

Use this checklist to ensure everything is set up correctly before building.

## Pre-Build Checklist

### Dependencies ✅
- [ ] `pnpm install` completed successfully
- [ ] `@react-native-community/datetimepicker` installed in mobile app
- [ ] All Expo dependencies compatible (run `npx expo install --fix`)

### Environment Variables ✅
- [ ] Root `.env` file created and configured
- [ ] `apps/mobile/.env` file created with `EXPO_PUBLIC_*` variables
- [ ] Supabase URL and keys are correct
- [ ] API URL points to correct backend

### Database ✅
- [ ] Supabase project created and active
- [ ] All migrations applied:
  - [ ] 0001_supabase_schema.sql
  - [ ] 0002_rls_policies.sql
  - [ ] 0003_daily_challenges.sql
  - [ ] 0004_notification_settings.sql
- [ ] RLS policies enabled on all tables
- [ ] Seed data loaded (optional)

### Configuration Files ✅
- [ ] `apps/mobile/app.json` configured
- [ ] `apps/mobile/babel.config.js` exists
- [ ] `apps/mobile/tsconfig.json` exists
- [ ] Assets present:
  - [ ] icon.png
  - [ ] splash.png
  - [ ] adaptive-icon.png
  - [ ] notification-icon.png
  - [ ] favicon.png

### Code Verification ✅
- [ ] TypeScript compiles: `pnpm run type-check:all`
- [ ] No linting errors: `pnpm run lint`
- [ ] All imports resolve correctly
- [ ] All components exist:
  - [ ] Modal.tsx
  - [ ] Toast.tsx
  - [ ] Button.tsx
  - [ ] Input.tsx
  - [ ] Badge.tsx
  - [ ] Slider.tsx
- [ ] All hooks exist:
  - [ ] useSmartNotifications
  - [ ] useChallenges
  - [ ] useMilestones
  - [ ] usePatterns
- [ ] All lib files exist:
  - [ ] smart-notifications.ts
  - [ ] speech-recognition.ts
  - [ ] secure-store.ts
  - [ ] sqlite.ts
  - [ ] trpc.ts
  - [ ] trpc-provider.tsx

## Build Steps

### 1. Development Build
```bash
# Terminal 1: Start backend
pnpm run dev

# Terminal 2: Start mobile app
cd apps/mobile
pnpm start
```

### 2. Test Build
```bash
cd apps/mobile
pnpm android  # or pnpm ios
```

### 3. Production Build (EAS)
```bash
cd apps/mobile
eas build --platform ios
eas build --platform android
```

## Post-Build Verification

### Runtime Checks ✅
- [ ] App launches without crashes
- [ ] Authentication flow works
- [ ] Database queries succeed
- [ ] Offline mode works (SQLite)
- [ ] Notifications can be scheduled
- [ ] All screens render correctly
- [ ] Navigation works
- [ ] API calls succeed
- [ ] Error handling works

### Feature Checks ✅
- [ ] Daily entries can be created
- [ ] Step work can be saved
- [ ] Challenges can be completed
- [ ] Milestones trigger correctly
- [ ] Notifications respect quiet hours
- [ ] Voice input works (or fails gracefully)
- [ ] Pattern analysis runs
- [ ] Sponsor connection works
- [ ] Data export works

## Known Limitations

### Speech Recognition
- ⚠️ Currently a placeholder - needs native module implementation
- ✅ Falls back gracefully to manual typing
- 📝 To implement: Use `@react-native-voice/voice` or create native module

### Notifications
- ⚠️ Test on physical device (simulators have limited support)
- ✅ Quiet hours work correctly
- ✅ Category toggles work

### Offline Sync
- ✅ SQLite cache works
- ✅ Mutation queue works
- ⚠️ Conflict resolution needs testing

## Error Resolution

### If Build Fails
1. Clear cache: `pnpm start --clear`
2. Reinstall: `rm -rf node_modules && pnpm install`
3. Fix dependencies: `cd apps/mobile && pnpm install:fix`
4. Check TypeScript: `pnpm run type-check:all`

### If Runtime Errors
1. Check environment variables
2. Verify Supabase connection
3. Check database migrations applied
4. Review error logs
5. Test on physical device

### If Features Don't Work
1. Check feature flags
2. Verify permissions (notifications, location)
3. Check RLS policies
4. Verify API endpoints
5. Check network connectivity

## Success Criteria

✅ App builds without errors
✅ App runs without crashes
✅ All core features work
✅ Offline mode functional
✅ Notifications work
✅ Data persists correctly
✅ No console errors in production mode

