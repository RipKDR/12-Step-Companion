# pnpm Setup Guide

## Issue Fixed

pnpm was installed but not accessible because the npm global bin directory wasn't in your PATH.

## Solution Applied

Added `C:\Users\H\.npm-global` to PATH for the current session.

## Make PATH Change Permanent

To make pnpm available in all PowerShell sessions, add it to your user PATH:

### Option 1: Via PowerShell (Run as Administrator)
```powershell
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Users\H\.npm-global",
    "User"
)
```

### Option 2: Via Windows Settings
1. Press `Win + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "User variables", select "Path" and click "Edit"
5. Click "New" and add: `C:\Users\H\.npm-global`
6. Click "OK" on all dialogs
7. **Restart your terminal/PowerShell** for changes to take effect

### Option 3: Use npx (Temporary Workaround)
You can use `npx pnpm` instead of `pnpm` in all commands. This works but is slower.

## Verify Installation

After updating PATH (or restarting terminal), verify:

```bash
pnpm --version
# Should show: 10.22.0 (or similar)
```

## About .npmrc Warnings

You may see warnings when running npm commands:
```
npm warn Unknown project config "shamefully-hoist"
npm warn Unknown project config "strict-peer-dependencies"
npm warn Unknown project config "auto-install-peers"
```

**These are harmless** - they're pnpm-specific settings that npm doesn't understand. They won't affect npm functionality, and pnpm will use them correctly.

## Test pnpm with Project

Once pnpm is in your PATH, test it:

```bash
# Install dependencies
pnpm install

# Run type check
pnpm run type-check

# Run lint
pnpm run lint

# Build web app
pnpm --filter web build

# Start mobile app
pnpm --filter mobile start
```

## Current Status

✅ pnpm 10.22.0 is installed  
✅ pnpm works when PATH includes `C:\Users\H\.npm-global`  
⚠️ PATH needs to be updated permanently (see above)

---

**Last Updated**: 2025-01-27

