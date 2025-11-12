# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including the new `cross-env` dependency.

### 2. Create Environment File

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

**Note**: For local development, you don't need to edit `.env` - the app works without any configuration!

### 3. Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5000`

## ✅ Verify Everything Works

1. **Open browser**: Navigate to `http://localhost:5000`
2. **Check console**: You should see:
   - `⚠️  Auth disabled: REPL_ID or SESSION_SECRET not set. Running in local-only mode.`
   - `serving on port 5000`
3. **Test the app**: All features should work offline!

## 🔧 Common First-Time Issues

### Issue: `cross-env` not found
**Solution**: Run `npm install` again

### Issue: Port 5000 already in use
**Solution**: 
1. Edit `.env` and change `PORT=5000` to `PORT=3000`
2. Restart the dev server

### Issue: TypeScript errors
**Solution**: 
```bash
npm run check
```
This will show any TypeScript issues.

## 📦 Build for Production

```bash
npm run build
npm start
```

The production build will be in `dist/` directory.

## 🎯 What's Different from Replit?

- ✅ No Replit dependencies required
- ✅ Works on Windows, Mac, and Linux
- ✅ Auth is optional (disabled by default)
- ✅ Can deploy to any Node.js platform
- ✅ All data stored locally (no database required)

## 🆘 Need Help?

Check the main [README.md](./README.md) for detailed documentation.

