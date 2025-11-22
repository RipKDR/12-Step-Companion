# Nested Directory Structure Note

## Overview

There is a nested directory structure `12-Step-Companion/12-Step-Companion/` in the repository. This appears to be a duplicate or legacy structure.

## Current Status

- **Location**: `12-Step-Companion/12-Step-Companion/`
- **Purpose**: Unknown - appears to be duplicate/legacy
- **Impact**: None - not referenced in any build scripts or critical paths

## Investigation

The nested directory contains:
- Similar structure to root directory
- May be from an earlier migration or Git clone issue
- Not actively used by any build processes

## Recommendation

1. **If duplicate**: Can be safely removed after verifying no unique content
2. **If legacy**: Document purpose or archive separately
3. **If needed**: Update any path references if structure changes

## Action Items

- [ ] Verify contents are duplicate or unique
- [ ] Check Git history for origin
- [ ] Document purpose OR remove if duplicate
- [ ] Update any path references if structure changes

## Build Script Impact

**Current**: No build scripts reference the nested directory structure.

All build scripts use:
- `apps/*` (not `12-Step-Companion/apps/*`)
- `packages/*` (not `12-Step-Companion/packages/*`)
- Root-level paths (e.g., `pnpm-workspace.yaml`, `package.json`)

## Conclusion

The nested directory does not impact production builds or deployment. It can be safely ignored or removed after verification.
