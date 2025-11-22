# Quick Fix Summary - Run These Commands

## ✅ Fixes Already Applied

1. **TypeScript Error** - Fixed test file type annotation
2. **Package Versions** - Updated to Expo SDK 52 compatible versions
3. **Missing Dependency** - Added `react-native-web` to package.json
4. **App Config** - Updated web bundler config

## 🚀 Next Steps - Run These Commands

### Step 1: Set PATH and Navigate to Project

```powershell
$env:Path += ";C:\Program Files\nodejs;C:\Users\H\AppData\Roaming\npm;C:\Users\H\.npm-global"
cd C:\Users\H\12-Step-Companion
```

### Step 2: Install Updated Dependencies

```powershell
cd apps\mobile
pnpm install
cd ..\..
```

### Step 3: Create Mobile Assets (Choose One)

**Option A - If you have ImageMagick:**

```powershell
.\scripts\create-mobile-assets.ps1
```

**Option B - Manual (create placeholder PNGs):**

```powershell
# Create assets directory
New-Item -ItemType Directory -Path "apps\mobile\assets" -Force

# You'll need to create these files manually:
# - apps\mobile\assets\favicon.png (48x48px)
# - apps\mobile\assets\icon.png (1024x1024px)
# - apps\mobile\assets\splash.png (1242x2436px)
# - apps\mobile\assets\adaptive-icon.png (1024x1024px)
# - apps\mobile\assets\notification-icon.png (96x96px)
```

**Option C - Skip for now (development only):**
The app will work in Expo Go without these assets, but web builds will fail.
You can create minimal placeholders later.

### Step 4: Test Type Checking

```powershell
pnpm run type-check:all
```

### Step 5: Test Mobile App

```powershell
pnpm run mobile:dev
```

## 📋 What Was Fixed

### Package.json Changes (apps/mobile/package.json)

- ✅ Added `react-native-web: ^0.19.13`
- ✅ Updated `expo-notifications: ~0.29.14` (was ~0.32.0)
- ✅ Updated `expo-sqlite: ~15.1.4` (was ~15.0.0)
- ✅ Updated `react: 18.3.1` (was ^19.0.0)
- ✅ Updated `react-dom: 18.3.1` (was ^19.0.0)
- ✅ Updated `react-native: 0.76.9` (was 0.76.3)
- ✅ Updated `react-native-safe-area-context: 4.12.0` (was 5.6.2)
- ✅ Updated `react-native-screens: ~4.4.0` (was ~4.18.0)
- ✅ Updated `@types/react: ~18.3.12` (was ^19.0.0)
- ✅ Updated `@types/react-dom: ~18.3.1` (was ^19.0.0)

### Test File Fix (packages/api/src/routers/**tests**/sponsor-expiration.test.ts)

- ✅ Added explicit type annotation for `used_at: string | null`

### App Config Fix (apps/mobile/app.json)

- ✅ Added `"bundler": "metro"` to web config

## ⚠️ Important Notes

1. **React 19 → React 18**: Expo SDK 52 requires React 18, not React 19
2. **Assets Required**: For web builds, favicon.png is required. For production builds, all assets are needed.
3. **Node Version Warning**: You're using Node v24.11.0, but package.json specifies `>=20.0.0 <21.0.0`. This is just a warning and shouldn't break things, but consider using Node 20 for exact compatibility.

## 🐛 Remaining Issues After Fixes

After running the commands above, these should be resolved:

- ✅ TypeScript error in test file
- ✅ Missing react-native-web dependency
- ✅ Package version mismatches
- ⚠️ Missing favicon.png (needs manual creation or ImageMagick script)

## 📝 Full Command Sequence

Copy and paste this entire block:

```powershell
# Set PATH
$env:Path += ";C:\Program Files\nodejs;C:\Users\H\AppData\Roaming\npm;C:\Users\H\.npm-global"

# Navigate to project
cd C:\Users\H\12-Step-Companion

# Install mobile dependencies
cd apps\mobile
pnpm install
cd ..\..

# Test type checking
pnpm run type-check:all

# Test mobile app (will show QR code)
pnpm run mobile:dev
```
