# Remove Trunk from PATH

## Issue

Trunk launcher (`c:\Users\H\.cache\trunk\launcher`) is appearing in PATH but is not needed for this workspace.

## Current Status

- ✅ Trunk is **NOT** in User PATH
- ✅ Trunk is **NOT** in Machine PATH  
- ⚠️ Trunk appears in current shell PATH (likely from PowerShell profile or dynamic addition)

## Solution

### Option 1: Remove from PowerShell Profile (Recommended)

Trunk might be added in your PowerShell profile. Check and remove:

1. **Check PowerShell Profile**:
   ```powershell
   Test-Path $PROFILE
   ```

2. **View Profile**:
   ```powershell
   notepad $PROFILE
   ```

3. **Remove trunk PATH entries**:
   - Look for lines containing `trunk` or `c:\Users\H\.cache\trunk`
   - Remove or comment them out

4. **Reload PowerShell**:
   ```powershell
   . $PROFILE
   ```

### Option 2: Remove from System PATH (If Found)

If trunk is somehow in system PATH:

1. Open System Environment Variables:
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Go to "Advanced" → "Environment Variables"

2. Check both "User variables" and "System variables" PATH
3. Remove any entries containing `trunk`
4. Restart VS Code

### Option 3: VS Code Terminal (Already Configured)

VS Code terminal PATH is configured and will **not** include trunk if it's not in system PATH.

The VS Code settings use `${env:PATH}` which inherits from system PATH. Since trunk is not in User or Machine PATH, it won't be included in VS Code terminal after reload.

## Verification

After removing trunk:

1. **Check current shell**:
   ```powershell
   $env:PATH -split ';' | Where-Object { $_ -match 'trunk' }
   ```
   Should return nothing.

2. **Reload VS Code**:
   - `Ctrl+Shift+P` → "Developer: Reload Window"
   - Open new terminal
   - Check PATH: `$env:PATH -split ';' | Where-Object { $_ -match 'trunk' }`

## Notes

- Trunk directory exists: `C:\Users\H\.cache\trunk\launcher` ✅ (can be left as-is, just not in PATH)
- VS Code terminal will not include trunk if it's not in system PATH ✅
- Current shell may still show trunk until PowerShell profile is updated

