# Required Assets for Mobile App

The mobile app requires the following asset files to be created before building:

## Required Assets

1. **icon.png** (1024x1024px)
   - Location: `apps/mobile/assets/icon.png`
   - Used for: App icon on iOS and Android

2. **splash.png** (1242x2436px recommended)
   - Location: `apps/mobile/assets/splash.png`
   - Used for: App splash screen

3. **adaptive-icon.png** (1024x1024px)
   - Location: `apps/mobile/assets/adaptive-icon.png`
   - Used for: Android adaptive icon foreground

4. **favicon.png** (48x48px minimum)
   - Location: `apps/mobile/assets/favicon.png`
   - Used for: Web favicon

5. **notification-icon.png** (96x96px)
   - Location: `apps/mobile/assets/notification-icon.png`
   - Used for: Push notification icon (Android)

## Creating Assets

You can create placeholder assets using:
- Online tools: [Expo Asset Generator](https://www.npmjs.com/package/expo-asset-generator)
- Design tools: Figma, Sketch, or any image editor
- AI tools: DALL-E, Midjourney, etc.

## Quick Start (Placeholder Assets)

For development, you can create simple placeholder assets:

```bash
# Create assets directory
mkdir -p apps/mobile/assets

# Generate placeholder assets using ImageMagick (if installed)
# Or use any image editor to create 1024x1024px PNG files
```

## Note

The app will work in development mode (Expo Go) without these assets, but they are required for:
- EAS builds
- Production builds
- App Store/Play Store submissions

