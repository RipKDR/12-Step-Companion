# Nested Directory Note

## Issue Found

There is a nested `12-Step-Companion/` directory inside the workspace root:

- Location: `C:\Users\H\12-Step-Companion\12-Step-Companion\`
- Contains: ~244 files (94 markdown, 73 TypeScript, 32 JSON)

## Investigation Needed

This appears to be either:

1. A duplicate/old version of the project
2. A nested clone or copy
3. An accidental directory structure

## Recommendation

**Before deleting**, please:

1. Compare contents with root directory
2. Check if any unique files exist in nested directory
3. Verify git history to understand how it got there
4. Backup important files if needed

## Action Required

Once verified as duplicate, you can safely remove:

```powershell
Remove-Item -Recurse -Force "12-Step-Companion"
```

**⚠️ Warning**: Only delete after confirming it's safe to remove!
