# Deployment Guide - Replit

## Pre-Deployment Setup

### 1. Set Environment Variables in Replit Secrets

Go to your Replit project → **Secrets** tab (lock icon) and add:

```
SESSION_SECRET=16419804d4787b076da41387a89ff1e229a8b321149a78f4a56bc39abb00b1ff
```

**Note:** `DATABASE_URL`, `REPL_ID`, `NODE_ENV`, and `PORT` are automatically set by Replit.

### 2. Verify .replit Configuration

Your `.replit` file should have:
- ✅ `modules = ["nodejs-20", "web", "postgresql-16"]` (line 1)
- ✅ `PORT = "5000"` (line 46)
- ✅ Deployment build command: `["npm", "run", "build"]` (line 10)
- ✅ Deployment run command: `["npm", "run", "start"]` (line 11)

## Deployment Steps

### Step 1: Deploy to Replit

1. Click **Deploy** button in Replit
2. Choose **Autoscale Deployment** (configured in .replit)
3. Wait for build to complete (2-3 minutes)

### Step 2: Initialize Database

After first deployment, open the Shell and run:

```bash
npm run db:push
```

This creates the required database tables:
- `sessions` - for authentication session storage
- `users` - for user profile storage

### Step 3: Verify Database Tables

```bash
psql $DATABASE_URL -c "\dt"
```

You should see:
```
 Schema |   Name   | Type  | Owner
--------+----------+-------+-------
 public | sessions | table | ...
 public | users    | table | ...
```

### Step 4: Test the Deployment

1. Visit your deployed URL
2. Test the onboarding flow (should work without login)
3. Try `/api/login` to test Replit Auth
4. Check that PWA features work (install prompt, offline mode)

## Post-Deployment Verification

### Check Service Worker

1. Open DevTools → Application → Service Workers
2. Verify service worker is registered
3. Status should show "activated and running"

### Test PWA Installation

1. Look for install prompt in browser
2. Desktop: Browser should show install icon in address bar
3. Mobile: "Add to Home Screen" prompt should appear

### Test Authentication

1. Click login or go to `/api/login`
2. Should redirect to Replit OAuth
3. After login, should redirect back to app
4. Check `/api/auth/user` returns your profile

### Test Core Features

- ✅ Sobriety counter displays correctly
- ✅ Step work loads and saves
- ✅ Journal entries persist
- ✅ Daily challenges work
- ✅ Achievements unlock
- ✅ Voice recording works (Chrome/Edge/Safari)
- ✅ Offline mode works (disconnect internet)
- ✅ Data export/import functions

## Troubleshooting

### "Unauthorized" Error

**Cause:** SESSION_SECRET not set or database tables missing

**Fix:**
1. Verify SESSION_SECRET in Replit Secrets
2. Run `npm run db:push`
3. Restart the deployment

### Service Worker Not Registering

**Cause:** Not using HTTPS

**Fix:** Replit provides HTTPS by default. Ensure you're accessing via the Replit domain, not a custom domain without SSL.

### Voice Features Not Working

**Cause:** Browser doesn't support Web Speech API

**Expected:** Firefox doesn't support speech-to-text (this is normal)
- Chrome/Edge/Safari: Full support
- Firefox: Audio recording only (no speech-to-text)

### Database Connection Errors

**Cause:** DATABASE_URL not set

**Fix:**
1. Check PostgreSQL module is enabled in `.replit`
2. Restart the Repl to provision database
3. Verify `DATABASE_URL` appears in Secrets

### Build Fails

**Common causes:**
- TypeScript errors: Run `npm run check` locally first
- Missing dependencies: Run `npm install`
- Out of memory: Replit builds have limits, may need to optimize

## Environment Variable Reference

| Variable | Required | Source | Value |
|----------|----------|--------|-------|
| `SESSION_SECRET` | ✅ YES | **Manual** | `16419804d4787b076da41387a89ff1e229a8b321149a78f4a56bc39abb00b1ff` |
| `DATABASE_URL` | ✅ YES | Auto | Provided by Replit |
| `REPL_ID` | ✅ YES | Auto | Provided by Replit |
| `ISSUER_URL` | No | Auto | `https://replit.com/oidc` |
| `NODE_ENV` | ✅ YES | Auto | `production` |
| `PORT` | ✅ YES | Auto | `5000` |

## Security Notes

### Session Secret

- ✅ 64-character random hex string (256 bits of entropy)
- ✅ Never commit to git (.env files are gitignored)
- ✅ Unique to this deployment
- ✅ Used for signing session cookies

### Data Privacy

- User recovery data stays in browser (LocalStorage/IndexedDB)
- Server only stores authentication profiles
- No user data transmitted to server by default
- Analytics are local-only (opt-in)

## Performance Optimization

### Initial Load Time

- Large dependency tree (86 packages)
- Consider code splitting for admin/settings pages
- Service worker caches assets after first load

### Bundle Size

Current production dependencies that could be optimized:
- `canvas-confetti` (unused after redesign - can remove)
- `framer-motion` (partially unused - can remove celebrations usage)

### Monitoring

Monitor these metrics post-deployment:
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Lighthouse PWA score
- Service worker hit rate

## Rollback Plan

If issues occur after deployment:

1. Revert to previous commit:
```bash
git reset --hard 20e9ba0  # Last known good commit
git push -f origin main
```

2. Redeploy from Replit dashboard

3. Database should remain intact (no schema changes)

## Support

If you encounter issues:
1. Check this deployment guide
2. Review `REPLIT_COMPATIBILITY_REVIEW.md`
3. Check Replit logs in the deployment dashboard
4. Open an issue on GitHub with logs

## Success Criteria

Deployment is successful when:
- ✅ App loads at deployed URL
- ✅ Service worker registers successfully
- ✅ PWA install prompt appears
- ✅ Authentication flow works
- ✅ All features work as expected
- ✅ Offline mode functions
- ✅ No console errors in browser DevTools

---

**Deployment Date:** Ready to deploy
**SESSION_SECRET:** Configured
**Database:** Ready (run `npm run db:push` after deploy)
**Status:** ✅ READY FOR PRODUCTION
