# Changelog

All notable changes to the 12-Step Recovery Companion project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Workspace settings optimization (VS Code)
- Debug configurations for Node.js, Expo, and Next.js
- Recommended extensions list
- Documentation organization (archived old files)
- CONTRIBUTING.md and CHANGELOG.md

### Changed
- Removed npm lockfile from packages/api (using pnpm only)
- Organized documentation into docs/ folder structure

### Fixed
- Package manager mismatch (npm → pnpm)
- Linter false positives (excluded .pro files)
- File watcher performance (excluded node_modules)

## [1.0.0] - 2024-01-XX

### Added
- Initial release
- Mobile app (Expo React Native)
- Web app (Next.js 14)
- Backend API (Express + tRPC)
- Step work tracker
- Daily journal
- Meeting finder
- Sponsor connection
- Geofenced triggers
- Action plans and routines
- Offline-first architecture
- Privacy controls

### Security
- Row Level Security (RLS) on all tables
- Client-side encryption for sensitive data
- Per-item sharing controls
- No service role keys exposed to client

---

## Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

