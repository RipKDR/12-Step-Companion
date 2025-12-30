# 🚀 Vercel Deployment Fix - Quick Reference

## ✅ What Was Fixed

### 1. Updated `vercel.json`
- Changed `installCommand` from `npm install` to `pnpm install --frozen-lockfile`
- Updated `buildCommand` to use pnpm workspace filter: `pnpm --filter './apps/web' build`

### 2. Added Node.js Version Constraints
- Added `engines` field to `package.json` specifying Node 20.x
- Added `packageManager` field to pin pnpm version

## ⚠️ Action Required: Update Vercel Project Settings

**You must update the Node.js version in Vercel Dashboard:**

1. Go to: https://vercel.com/harrisonferraro99-4774s-projects/12-step-companion/settings/general
2. Scroll to **Node.js Version**
3. Change from `22.x` to `20.x`
4. Save changes

**Why?** The project uses Node 20 (per `.nvmrc`), but Vercel was using Node 22.x, which caused pnpm compatibility issues.

## 🔄 Next Steps

1. **Update Vercel Node version** (see above)
2. **Commit and push the changes**:
   ```bash
   git add vercel.json package.json DEPLOYMENT_DEBUG_REPORT.md VERCEL_DEPLOYMENT_FIX.md
   git commit -m "Fix Vercel deployment: Use pnpm and Node 20"
   git push
   ```
3. **Redeploy** - Vercel will automatically trigger a new deployment
4. **Monitor build logs** - The build should now succeed

## 🧪 Test Locally First (Recommended)

Before pushing, verify the build works locally:

```bash
# Ensure you're using Node 20
node --version  # Should show v20.x.x

# Install dependencies
pnpm install --frozen-lockfile

# Build the Next.js app
pnpm --filter './apps/web' build
```

## 📋 What Changed

### `vercel.json`
```diff
- "installCommand": "npm install",
+ "installCommand": "pnpm install --frozen-lockfile",

- "buildCommand": "cd apps/web && npm run build",
+ "buildCommand": "pnpm --filter './apps/web' build",
```

### `package.json`
```diff
+ "engines": {
+   "node": ">=20.0.0 <21.0.0",
+   "pnpm": ">=8.0.0"
+ },
+ "packageManager": "pnpm@8.15.0",
```

## 🔍 Root Cause Summary

The deployment failed because:
1. **Package manager mismatch**: `vercel.json` said `npm` but project uses `pnpm`
2. **Node version mismatch**: Vercel used Node 22.x but project needs Node 20.x
3. **pnpm compatibility**: Node 22.x caused `ERR_INVALID_THIS` errors in pnpm

All issues are now fixed in code. Just update the Node version in Vercel dashboard!

## 📚 Full Analysis

See `DEPLOYMENT_DEBUG_REPORT.md` for complete technical analysis.

