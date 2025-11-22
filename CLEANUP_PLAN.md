# BMAD Cleanup Plan - Files Not Needed for iOS/Web/Android App

## BUILD - What's Essential

### Required for iOS/Android/Web:
- `apps/mobile/` - Expo React Native app (iOS + Android)
- `apps/web/` - Next.js web app
- `android/` - Native Android build configuration
- `packages/` - Shared code (api, types, ui)
- `server/` - Backend API and Supabase migrations
- `shared/` - Shared schemas
- Configuration: `package.json`, `tsconfig.json`, `app.json`, `pnpm-workspace.yaml`, `drizzle.config.ts`, etc.

## MEASURE - Current Structure

Found:
- 198+ markdown documentation files
- Nested Git submodule folder
- Archive folders
- Implementation summary files
- Legacy folders

## ANALYZE - Safe to Remove

### Category 1: Nested Submodule (HIGH PRIORITY)
- `12-Step-Companion/` - Old Git submodule, outdated code, causing "dirty" status

### Category 2: Archived Documentation (SAFE)
- `apps/docs/archive/` - Contains 39 archived markdown files, already archived

### Category 3: Empty/Unused Folders (SAFE)
- `markdowns from prompts/` - Empty folder

### Category 4: Implementation Summary Files (CONSERVATIVE - Keep Important Ones)
These are status/summary files from development, safe to remove but keeping a few important ones:
- Keep: `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `ARCHITECTURE.md`, `TECHNICAL_ARCHITECTURE.md`
- Remove: Implementation summaries, status files, fix summaries (already in archive)

### Category 5: Keep (Important)
- `api/` - Vercel serverless functions (might be used)
- `migrations/` - Drizzle ORM migrations (referenced in drizzle.config.ts)
- `server/migrations/` - Supabase SQL migrations
- All source code
- All configuration files

## DECIDE - Removal Plan

**Phase 1: Remove Nested Folder**
- Remove `12-Step-Companion/` submodule folder

**Phase 2: Remove Archives**
- Remove `apps/docs/archive/` (already archived, safe to delete)

**Phase 3: Remove Empty Folders**
- Remove `markdowns from prompts/`

**Phase 4: Clean Root-Level Docs (Conservative)**
- Keep essential docs (README, CONTRIBUTING, CHANGELOG, ARCHITECTURE, TECHNICAL_ARCHITECTURE)
- Remove implementation summaries and status files (they're historical, not needed for building)

