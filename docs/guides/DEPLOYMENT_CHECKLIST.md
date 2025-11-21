# Deployment Readiness Checklist

**Last Updated**: November 21, 2025  
**Overall Status**: 🟡 **READY WITH CRITICAL FIXES REQUIRED**

---

## CRITICAL ISSUES - MUST FIX BEFORE ANY DEPLOYMENT

### 1. Resolve Merge Conflict in `vercel.json`
- **File**: `/vercel.json` (lines 3-7)
- **Status**: 🚨 UNRESOLVED MERGE CONFLICT
- **Action**: Edit the file and choose ONE of these options:
  ```json
  // OPTION A (RECOMMENDED - Better for monorepo)
  {
    "version": 2,
    "buildCommand": "pnpm --filter './apps/web' build",
    "outputDirectory": "apps/web/.next",
    "installCommand": "pnpm install --frozen-lockfile",
    ...
  }
  
  // OPTION B (Simpler - May work for simple setups)
  {
    "version": 2,
    "buildCommand": "cd apps/web && pnpm run build",
    "outputDirectory": "apps/web/.next",
    "installCommand": "pnpm install --no-frozen-lockfile",
    ...
  }
  ```
- **Recommendation**: Use OPTION A for better monorepo support

---

### 2. Fix Missing Client Directory References
- **Files Affected**:
  - `vite.config.ts` (line 49)
  - `vitest.config.ts`
  - `components.json`
- **Problem**: These files reference `/client` directory that doesn't exist
- **Solution**: Delete these files OR create the `client/` directory
  ```bash
  # Option 1: Remove the files (RECOMMENDED - they appear to be legacy)
  rm vite.config.ts
  rm vitest.config.ts
  
  # Option 2: Create the directory if you need these tools
  mkdir -p client/src
  ```

---

### 3. Remove NPM Lock Files
- **Files Found**:
  - `/apps/mobile/package-lock.json`
  - One other location
- **Action**: Delete all `package-lock.json` files and use only `pnpm-lock.yaml`
  ```bash
  find . -name "package-lock.json" -delete
  pnpm install  # Regenerate lock file
  ```

---

## HIGH PRIORITY - FIX BEFORE PRODUCTION

### 4. Create Next.js Public Directory
- **Missing**: `/apps/web/public/`
- **Action**: Create and add static assets
  ```bash
  mkdir -p apps/web/public
  # Copy favicon, robots.txt, etc. here
  ```

---

### 5. Choose One API Pattern
- **Current State**: Both Express (`/server/`) and tRPC (`/packages/api/`) in use
- **Decision Needed**: Migrate fully to tRPC (modern) or consolidate Express
- **Recommendation**: Migrate Express routes to tRPC for consistency
  - Remove `/server/routes.ts` 
  - Keep `/packages/api/` as single source of truth
  - Deprecate Express server or keep for legacy support only

---

### 6. Set Environment Variables
- **Deployment Targets**:
  - [ ] Vercel: Set all NEXT_PUBLIC_* and NEXTAUTH_* variables
  - [ ] Railway/Docker: Set all variables in `.env`
  - [ ] EAS Build: Configure via `eas.json` and EAS dashboard
- **Required Variables**:
  - `DATABASE_URL` (PostgreSQL connection)
  - `SUPABASE_URL` and `SUPABASE_ANON_KEY`
  - `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
  - `NEXTAUTH_URL` (https://yourdomain.com)

---

## PLATFORM-SPECIFIC DEPLOYMENT

### Web Platform (Next.js on Vercel)
```
Pre-deployment Checklist:
- [ ] vercel.json merge conflict resolved
- [ ] NEXT_PUBLIC_* environment variables set
- [ ] DATABASE_URL configured
- [ ] NEXTAUTH_SECRET generated and set
- [ ] NEXTAUTH_URL points to correct domain
- [ ] apps/web/public/ directory exists
```

**Deploy Command**:
```bash
pnpm --filter web build  # Test locally first
# Then deploy to Vercel via GitHub/CLI
```

---

### Mobile Platform (Expo/EAS Build)
```
Pre-deployment Checklist:
- [ ] EXPO_PUBLIC_SUPABASE_URL set
- [ ] EXPO_PUBLIC_SUPABASE_ANON_KEY set
- [ ] EAS account configured
- [ ] App signing certificates prepared (iOS/Android)
- [ ] Bundle IDs/Package names correct
```

**Build Command**:
```bash
eas build --platform ios --build-type production
eas build --platform android --build-type production

# Or for internal testing:
eas build --platform android --build-type apk
```

---

### Docker/Railway Deployment
```
Pre-deployment Checklist:
- [ ] Dockerfile builds successfully locally
- [ ] DATABASE_URL configured
- [ ] All environment variables set
- [ ] Port 3000 exposed correctly
```

**Build & Deploy**:
```bash
docker build -t 12-step-companion .
docker run -p 3000:3000 -e DATABASE_URL=... 12-step-companion
```

---

## DEPLOYMENT TARGETS STATUS

| Platform | Status | Notes |
|----------|--------|-------|
| **Vercel (Web)** | 🟡 Ready | Fix vercel.json conflict first |
| **EAS (Mobile)** | 🟢 Ready | No critical issues |
| **Railway/Docker** | 🟢 Ready | Dockerfile is working |
| **Local Dev** | 🟡 Ready | Remove Vite/Vitest configs first |

---

## PRE-FLIGHT CHECKLIST

```bash
# 1. Resolve conflicts
# Edit vercel.json - choose one option

# 2. Clean up legacy files
rm vite.config.ts vitest.config.ts
rm -f package-lock.json

# 3. Create missing directories
mkdir -p apps/web/public

# 4. Test builds
pnpm install
pnpm lint
pnpm type-check
pnpm build:web
pnpm build:turbo

# 5. If all pass, you're ready to deploy!
```

---

## DEPLOYMENT QUICK START

### Deploy Web to Vercel
```bash
# 1. Fix vercel.json (if not done)
# 2. Push to main branch
# 3. Vercel auto-deploys on push
# 4. Set environment variables in Vercel dashboard

# Or use CLI:
npm install -g vercel
vercel --prod
```

### Deploy Mobile to App Stores
```bash
# iOS (TestFlight/App Store)
eas build --platform ios --build-type production
eas submit --platform ios --latest

# Android (Play Store)
eas build --platform android --build-type app-bundle
eas submit --platform android --latest
```

### Deploy Backend to Railway
```bash
# 1. Create Railway account & project
# 2. Connect GitHub repository
# 3. Railway auto-deploys on push
# 4. Add environment variables in Railway dashboard
# 5. Monitor deployment logs
```

---

## CRITICAL PATHS & TIMING

**Shortest Path to Deployment** (assuming quick fixes):
1. Fix vercel.json (5 minutes)
2. Delete broken config files (2 minutes)
3. Set environment variables (5-10 minutes)
4. Run `pnpm install && pnpm build:web` (5 minutes)
5. Deploy to Vercel (1 minute via git push)

**Total**: ~20 minutes for web deployment

---

## POST-DEPLOYMENT VALIDATION

After deployment, verify:
```bash
# Web
[ ] https://yourdomain.com loads
[ ] Login works with NextAuth
[ ] API routes respond (e.g., /api/trpc/...)
[ ] Database connections work
[ ] Static assets load (CSS, JS, images)

# Mobile
[ ] App builds and installs
[ ] Can authenticate
[ ] Can access API endpoints
[ ] Offline functionality works (SQLite)

# General
[ ] No console errors
[ ] No unhandled API errors
[ ] Response times acceptable
[ ] Database queries performant
```

---

## ROLLBACK PLAN

If deployment fails:
1. Check Vercel/Railway logs for error messages
2. Verify environment variables are set correctly
3. Check database connectivity
4. Verify Node.js version (20.x)
5. Check pnpm lock file integrity

**Rollback**:
```bash
# Vercel: Click "Rollback" in deployment history
# Railway: Redeploy previous version
# Manual: Re-deploy previous working commit
```

---

## SUPPORT CONTACTS

- **Vercel Issues**: https://vercel.com/support
- **EAS/Expo Issues**: https://expo.dev/support
- **Railway Issues**: https://railway.app/support
- **Supabase Issues**: https://supabase.com/support

---

**Status**: This checklist is ready for action. Fix the critical issues above and deployment should proceed smoothly.
