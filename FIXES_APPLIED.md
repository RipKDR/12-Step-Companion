# Fixes Applied - Mobile App Issues

## Issues Fixed

### 1. TypeScript Error in Test File ✅
**File:** `packages/api/src/routers/__tests__/sponsor-expiration.test.ts`

**Issue:** Type 'string' is not assignable to type 'null'

**Fix:** Added explicit type annotation to allow `used_at` to be `string | null`

```typescript
const code: {
  code: string;
  used_at: string | null;
  expires_at: string;
} = { ... }
```

### 2. Missing react-native-web Dependency ✅
**File:** `apps/mobile/package.json`

**Issue:** Unable to resolve "react-native-web/dist/index" for web builds

**Fix:** Added `react-native-web` dependency:
```json
"react-native-web": "^0.19.13"
```

### 3. Package Version Mismatches ✅
**File:** `apps/mobile/package.json`

**Issue:** Packages not compatible with Expo SDK 52

**Fixes Applied:**
- `expo-notifications`: `~0.32.0` → `~0.29.14` (SDK 52 compatible)
- `expo-sqlite`: `~15.0.0` → `~15.1.4` (SDK 52 compatible)
- `react`: `^19.0.0` → `18.3.1` (Expo SDK 52 requirement)
- `react-dom`: `^19.0.0` → `18.3.1` (Expo SDK 52 requirement)
- `react-native`: `0.76.3` → `0.76.9` (SDK 52 compatible)
- `react-native-safe-area-context`: `5.6.2` → `4.12.0` (SDK 52 compatible)
- `react-native-screens`: `~4.18.0` → `~4.4.0` (SDK 52 compatible)
- `@types/react`: `^19.0.0` → `~18.3.12` (matches React 18)
- `@types/react-dom`: `^19.0.0` → `~18.3.1` (matches React 18)

### 4. Missing Favicon Asset ✅
**File:** `apps/mobile/app.json`

**Issue:** Error: ENOENT: no such file or directory, open 'favicon.png'

**Fix:** 
- Created asset creation script: `scripts/create-mobile-assets.ps1`
- Updated `app.json` to include `"bundler": "metro"` for web config
- Script will generate placeholder assets if ImageMagick is installed

## Next Steps

1. **Install Updated Dependencies:**
   ```bash
   cd apps/mobile
   pnpm install
   ```

2. **Create Assets (Choose one):**
   
   **Option A - Using ImageMagick (if installed):**
   ```powershell
   .\scripts\create-mobile-assets.ps1
   ```
   
   **Option B - Manual creation:**
   Create these files in `apps/mobile/assets/`:
   - `favicon.png` (48x48px minimum)
   - `icon.png` (1024x1024px)
   - `splash.png` (1242x2436px recommended)
   - `adaptive-icon.png` (1024x1024px)
   - `notification-icon.png` (96x96px)

3. **Test Type Checking:**
   ```bash
   pnpm run type-check:all
   ```

4. **Test Mobile App:**
   ```bash
   pnpm run mobile:dev
   ```

## Notes

- React 19 is not compatible with Expo SDK 52 - downgraded to React 18.3.1
- All package versions now match Expo SDK 52 requirements
- Assets can be placeholders for development, but need proper designs for production
- The `react-native-web` dependency is required for web builds in Expo

