# 🔍 Vercel Deployment Debugging Report

**Deployment ID**: `dpl_8WTEX5Bd7Py422dzvmfEwnk94qKR`  
**Status**: ❌ ERROR  
**Date**: 2025-01-25  
**Commit**: `fc78735e5ac3d68e6d72336eff87ba9659961b9c`

---

## 📊 Executive Summary

The deployment failed during the dependency installation phase due to:
1. **Package Manager Mismatch**: `vercel.json` specified `npm install` but Vercel auto-detected `pnpm` (due to `pnpm-workspace.yaml` and `pnpm-lock.yaml`)
2. **Node.js Version Incompatibility**: Project uses Node 20 (per `.nvmrc`) but Vercel project was configured for Node 22.x
3. **pnpm Compatibility Issue**: The `ERR_INVALID_THIS` error indicates a pnpm version compatibility issue with Node.js 22

---

## 🔴 Root Cause Analysis

### Primary Issue: Package Manager Conflict

**Problem**: 
- `vercel.json` explicitly sets `installCommand: "npm install"`
- Vercel detected `pnpm-workspace.yaml` and `pnpm-lock.yaml` and attempted to use pnpm instead
- This caused Vercel to run `pnpm install --no-frozen-lockfile` (auto-detected behavior)

**Evidence from Logs**:
```
Running "install" command: `pnpm install --no-frozen-lockfile`...
```

### Secondary Issue: pnpm Registry Fetch Failures

**Problem**:
Multiple packages failed to fetch from npm registry with `ERR_INVALID_THIS`:
```
ERR_PNPM_META_FETCH_FAIL  GET https://registry.npmjs.org/@babel%2Fcore: 
Value of "this" must be of type URLSearchParams
```

**Affected Packages**:
- `@babel/core`
- `@types/react`, `@types/react-dom`
- `typescript`
- `expo`, `expo-router`, `expo-location`, `expo-notifications`
- `react`, `react-dom`
- And many more...

**Root Cause**: 
This error typically occurs when:
1. pnpm version is incompatible with Node.js version
2. Node.js 22.x has breaking changes that older pnpm versions don't handle
3. Network/proxy configuration issues (less likely in Vercel's environment)

### Tertiary Issue: Node.js Version Mismatch

**Problem**:
- `.nvmrc` specifies Node.js `20`
- Vercel project settings show `nodeVersion: "22.x"`
- Node 22.x introduced breaking changes that may affect pnpm's internal URL handling

---

## 📋 Detailed Error Analysis

### Error Sequence

1. **Build Started**: ✅ Successfully cloned repository
2. **Install Command Detected**: ⚠️ Vercel auto-detected pnpm despite `vercel.json` specifying npm
3. **pnpm Install Started**: ⚠️ Running with `--no-frozen-lockfile` flag
4. **Registry Fetch Failures**: ❌ Multiple `ERR_INVALID_THIS` errors
5. **Build Failed**: ❌ `Error: Command "pnpm install --no-frozen-lockfile" exited with 1`

### Error Pattern

All errors follow this pattern:
```
WARN  GET https://registry.npmjs.org/[package] error (ERR_INVALID_THIS). 
Will retry in 10 seconds. 2 retries left.
```

After retries exhausted:
```
ERR_PNPM_META_FETCH_FAIL  GET https://registry.npmjs.org/[package]: 
Value of "this" must be of type URLSearchParams
```

---

## ✅ Solutions Implemented

### Fix 1: Update `vercel.json` for pnpm

**Changes Made**:
```json
{
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm --filter './apps/web' build"
}
```

**Rationale**:
- Explicitly use pnpm to match project structure
- Use `--frozen-lockfile` for reproducible builds
- Use pnpm workspace filter for monorepo builds

### Fix 2: Node.js Version Alignment

**Action Required**: Update Vercel project settings to use Node.js 20.x

**Steps**:
1. Go to Vercel Dashboard → Project Settings → General
2. Set Node.js Version to `20.x` (matches `.nvmrc`)
3. Save changes

**Alternative**: Add `engines` field to `package.json`:
```json
{
  "engines": {
    "node": ">=20.0.0 <21.0.0"
  }
}
```

---

## 🔧 Additional Recommendations

### 1. Verify pnpm Version Compatibility

Ensure pnpm version is compatible with Node 20. Check `package.json` for `packageManager` field:

```json
{
  "packageManager": "pnpm@8.15.0"
}
```

### 2. Update Build Command for Monorepo

The build command should use pnpm workspace filters:

```json
{
  "buildCommand": "pnpm --filter './apps/web' build"
}
```

### 3. Add `.vercelignore` (Optional)

To exclude unnecessary files from deployment:

```
node_modules
.git
.env.local
dist
*.log
```

### 4. Environment Variables

Ensure all required environment variables are set in Vercel:
- `NODE_ENV=production`
- Database connection strings
- API keys
- Any other secrets from `.env.example`

---

## 🧪 Testing Recommendations

### Before Redeploying:

1. **Test Locally**:
   ```bash
   pnpm install --frozen-lockfile
   pnpm --filter './apps/web' build
   ```

2. **Verify Node Version**:
   ```bash
   node --version  # Should show v20.x.x
   ```

3. **Check pnpm Version**:
   ```bash
   pnpm --version  # Should be compatible with Node 20
   ```

### After Deployment:

1. Check build logs for any remaining errors
2. Verify environment variables are loaded
3. Test API routes and database connections
4. Monitor runtime logs for any issues

---

## 📈 Deployment Pattern Analysis

### Historical Failures

Reviewing recent deployments shows a pattern:
- **11 recent deployments**: All failed with ERROR status
- **Last successful deployment**: `dpl_B8bxUoiueWcaF2heaYiVdpjGVBpc` (from earlier)
- **Common failure point**: Dependency installation phase

### Trend

All recent failures appear to be related to:
1. Package manager configuration
2. Build command issues
3. Monorepo structure not properly configured

---

## 🎯 Action Items

### Immediate (Required for Fix)

- [x] Update `vercel.json` with correct pnpm commands
- [ ] Update Vercel project Node.js version to 20.x
- [ ] Verify `pnpm-lock.yaml` is committed and up-to-date
- [ ] Test build locally with same commands

### Short-term (Recommended)

- [ ] Add `packageManager` field to `package.json`
- [ ] Create `.vercelignore` file
- [ ] Document monorepo deployment process
- [ ] Set up build caching in Vercel

### Long-term (Best Practices)

- [ ] Consider using Vercel's monorepo support features
- [ ] Set up CI/CD pipeline for pre-deployment testing
- [ ] Implement deployment health checks
- [ ] Monitor deployment success rates

---

## 🔗 References

- [Vercel Monorepo Documentation](https://vercel.com/docs/monorepos)
- [pnpm Workspace Documentation](https://pnpm.io/workspaces)
- [Vercel Build Configuration](https://vercel.com/docs/build-step)
- [Node.js 22 Release Notes](https://nodejs.org/en/blog/release/v22.0.0)

---

## 📝 Notes

- The `ERR_INVALID_THIS` error is a known issue with certain pnpm versions and Node.js 22
- Using Node.js 20 (as specified in `.nvmrc`) should resolve this
- The project structure is a monorepo, so Vercel needs explicit configuration for workspace builds
- All fixes have been applied to `vercel.json` - redeploy after updating Node version in Vercel dashboard

---

**Report Generated**: 2025-01-25  
**Next Steps**: Update Vercel project Node version and redeploy
