# Installation Troubleshooting Guide

## ✅ Installation Completed Successfully?

If you see this message, you're done:
```
added 993 packages, and audited 994 packages in 4m
```

**You can ignore all warnings!** The app will work fine.

## Common Issues & Solutions

### Issue: npm install hangs or is very slow

**Solutions:**
1. **Check your internet connection**
2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```
3. **Use a different registry:**
   ```bash
   npm install --registry https://registry.npmjs.org/
   ```
4. **Try yarn instead:**
   ```bash
   npm install -g yarn
   yarn install
   ```

### Issue: "EACCES" or Permission Errors

**Windows:**
- Run PowerShell/CMD as Administrator
- Or use: `npm install --global-style`

**Mac/Linux:**
```bash
sudo npm install
# OR better: fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
```

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Delete everything and reinstall
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Issue: Node version too old

**Check your version:**
```bash
node --version
```

**Need Node 20+?**
- Download from: https://nodejs.org/
- Or use nvm: https://github.com/nvm-sh/nvm

### Issue: npm install shows many warnings

**This is NORMAL!** Common warnings you can ignore:
- `npm warn deprecated inflight@1.0.6` ✅ Safe to ignore
- `npm warn deprecated glob@7.2.3` ✅ Safe to ignore
- `npm warn deprecated sourcemap-codec@1.4.8` ✅ Safe to ignore
- Security vulnerabilities in dev dependencies ✅ Usually safe to ignore

**These are just warnings** - they don't prevent the app from running.

### Issue: "cross-env not found" after install

**Solution:**
```bash
npm install cross-env --save-dev
```

Or reinstall everything:
```bash
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: Installation fails with network errors

**Solutions:**
1. **Check firewall/proxy settings**
2. **Try with verbose logging:**
   ```bash
   npm install --verbose
   ```
3. **Use yarn:**
   ```bash
   yarn install
   ```

### Issue: "Out of memory" during install

**Solutions:**
1. **Close other applications**
2. **Increase Node memory:**
   ```bash
   $env:NODE_OPTIONS="--max-old-space-size=4096"
   npm install
   ```
3. **Install dependencies one at a time** (last resort)

## Alternative Installation Methods

### Using Yarn

```bash
# Install yarn globally
npm install -g yarn

# Install dependencies
yarn install

# Run dev server
yarn dev
```

### Using pnpm

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

## Verify Installation

After `npm install`, verify everything is installed:

```bash
# Check if key packages are installed
npm list cross-env
npm list vite
npm list react

# Should show version numbers, not "empty"
```

## Still Having Issues?

1. **Check Node.js version:**
   ```bash
   node --version  # Need v20+
   ```

2. **Check npm version:**
   ```bash
   npm --version  # Need v9+
   ```

3. **Try fresh install:**
   ```bash
   # Windows PowerShell
   Remove-Item -Recurse -Force node_modules, package-lock.json, dist
   npm cache clean --force
   npm install
   ```

4. **Check for conflicting global packages:**
   ```bash
   npm list -g --depth=0
   ```

5. **Create a new issue** with:
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Full error message
   - Operating system (Windows/Mac/Linux)

## Quick Test

After installation, test if everything works:

```bash
# This should work without errors
npm run check

# This should start the dev server
npm run dev
```

If both commands work, you're all set! 🎉

