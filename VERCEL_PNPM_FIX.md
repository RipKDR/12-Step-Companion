# Vercel pnpm 8 Fix

## Problem
Vercel was using pnpm 6.35.1, but the project requires pnpm >= 8.0.0, causing `ERR_PNPM_UNSUPPORTED_ENGINE` errors.

## Solution Applied

### 1. Added `packageManager` field to `package.json`
```json
"packageManager": "pnpm@8.15.0"
```

### 2. Updated `vercel.json` installCommand
Changed from:
```json
"installCommand": "pnpm install --frozen-lockfile"
```

To:
```json
"installCommand": "corepack enable && corepack prepare pnpm@8.15.0 --activate && pnpm install --frozen-lockfile"
```

## How It Works

1. **Corepack Enable**: Enables Node.js's built-in Corepack tool
2. **Corepack Prepare**: Downloads and prepares pnpm 8.15.0
3. **Activate**: Activates the prepared pnpm version
4. **Install**: Runs pnpm install with frozen lockfile

## Alternative: Environment Variable

If the above doesn't work, you can also set this environment variable in Vercel Dashboard:
- **Name**: `ENABLE_EXPERIMENTAL_COREPACK`
- **Value**: `1`

Then the installCommand can be simplified back to:
```json
"installCommand": "pnpm install --frozen-lockfile"
```

## Verification

After deploying, check the build logs to confirm:
- ✅ Corepack is enabled
- ✅ pnpm 8.15.0 is being used
- ✅ No `ERR_PNPM_UNSUPPORTED_ENGINE` errors

