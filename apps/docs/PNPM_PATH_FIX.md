# pnpm PATH Fix

## Issue Found

**Problem**: `pnpm` command not recognized in VS Code terminal

**Root Cause**: Node.js and pnpm are installed but not in the PATH environment variable

## What Was Found

✅ **Node.js**: Installed at `C:\Program Files\nodejs\` (v24.11.0)  
✅ **npm**: Available via Node.js installation (v11.6.2)  
✅ **pnpm**: Installed globally at `C:\Users\H\.npm-global\` (v10.22.0)  
❌ **PATH**: Missing Node.js and npm directories

## Fix Applied

Added PATH entries to `.vscode/settings.json`:

```json
"terminal.integrated.env.windows": {
    "PATH": "${env:PATH};C:\\Program Files\\nodejs;C:\\Users\\H\\AppData\\Roaming\\npm;C:\\Users\\H\\.npm-global"
}
```

## How to Verify

1. **Close and reopen VS Code terminal** (or open a new terminal)
2. **Test commands**:
   ```powershell
   node --version    # Should show: v24.11.0
   npm --version    # Should show: 11.6.2
   pnpm --version   # Should show: 10.22.0
   ```

## If It Still Doesn't Work

### Option 1: Reload VS Code Window
- Press `Ctrl+Shift+P`
- Type: "Developer: Reload Window"
- Press Enter
- Open new terminal and test again

### Option 2: Check System PATH
If VS Code terminal still doesn't work, add to system PATH:

1. **Open System Environment Variables**:
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Go to "Advanced" tab
   - Click "Environment Variables"

2. **Edit PATH**:
   - Under "User variables", select "Path"
   - Click "Edit"
   - Add these entries:
     - `C:\Program Files\nodejs`
     - `C:\Users\H\AppData\Roaming\npm`
     - `C:\Users\H\.npm-global`

3. **Restart VS Code** completely

### Option 3: Use Full Paths Temporarily
If you need to use pnpm immediately:

```powershell
& "C:\Users\H\.npm-global\pnpm.cmd" --version
& "C:\Users\H\.npm-global\pnpm.cmd" install
```

## Expected Behavior After Fix

After reloading VS Code terminal, you should be able to run:

```powershell
# All these should work:
node --version
npm --version  
pnpm --version
pnpm install
pnpm dev
pnpm build
```

## Notes

- **VS Code Terminal**: Uses `terminal.integrated.env.windows` settings
- **System Terminal**: Uses system PATH (needs separate fix if needed)
- **pnpm Version**: Currently v10.22.0 (project requires >=8.0.0) ✅

## Related Files

- `.vscode/settings.json` - VS Code terminal environment settings
- `package.json` - Specifies `pnpm@8.15.0` as package manager

