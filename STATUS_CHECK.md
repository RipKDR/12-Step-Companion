# Status Check - What Needs to Be Done Next

## ✅ Completed Tasks

### 1. Bug Fixes (All Fixed)
- ✅ **Bug 1**: Fixed Android package name mismatch (`app.json` now matches `build.gradle`)
- ✅ **Bug 2**: Removed `expo` and `react-native` from root `package.json`
- ✅ **Bug 3**: Fixed JSX configuration in root `tsconfig.json` (removed mobile files)
- ✅ **Bug 4**: Fixed `validate-env.ts` to check if module is run directly

### 2. Cleanup (Partial)
- ✅ Removed 18 root-level markdown files (implementation summaries)
- ✅ Created cleanup scripts and documentation

## ⚠️ Remaining Tasks

### 1. Remove Nested Folder (HIGH PRIORITY)
**Status:** ❌ Still exists

**Path:** `12-Step-Companion/`

**Impact:** 
- Causing Git "dirty" submodule status
- Contains 243 outdated files
- Not used by any build scripts

**Action Required:**
```powershell
# Run from project root
Remove-Item -Path "12-Step-Companion" -Recurse -Force
```

### 2. Remove Archive Folder
**Status:** ❓ Need to verify

**Path:** `apps/docs/archive/`

**Action Required:**
```powershell
Remove-Item -Path "apps\docs\archive" -Recurse -Force
```

### 3. Remove Empty Prompts Folder
**Status:** ❌ Still exists

**Path:** `markdowns from prompts/`

**Action Required:**
```powershell
Remove-Item -Path "markdowns from prompts" -Recurse -Force
```

### 4. Package Name Verification
**Status:** ⚠️ Need to verify

**Issue:** Root `package.json` scripts reference:
- `12-step-companion-web` 
- `12-step-companion-mobile`

**Need to check:**
- Do `apps/web/package.json` and `apps/mobile/package.json` have matching `name` fields?
- If not, scripts won't work with `pnpm --filter`

### 5. Android Package Name Warning
**Status:** ⚠️ Minor warning

**Issue:** `app.json` has package name starting with number: `com.12steprecoverycompanion`

**Impact:** Linter warning (not a build error, but not ideal)

**Recommendation:** Consider changing to `com.twelvesteprecoverycompanion` in future

## 📋 Next Steps Priority Order

1. **Remove nested folder** - Fixes Git status issue
2. **Verify package names** - Ensures build scripts work
3. **Remove archive folder** - Cleanup
4. **Remove empty prompts folder** - Cleanup
5. **Test builds** - Verify everything works:
   ```bash
   pnpm run type-check:all
   pnpm run mobile:dev
   pnpm run dev:web
   ```

## 🔍 Verification Checklist

- [ ] Nested `12-Step-Companion/` folder removed
- [ ] Archive folder removed (if exists)
- [ ] Empty prompts folder removed
- [ ] Package names match in `apps/web/package.json` and `apps/mobile/package.json`
- [ ] Build scripts work (`pnpm --filter` commands)
- [ ] Type checking passes
- [ ] Mobile app builds
- [ ] Web app builds

