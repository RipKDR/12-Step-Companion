# 12-Step Recovery Companion - Mobile App

Privacy-first mobile companion app built with Expo and React Native for iOS and Android.

## Features

- **Offline-First**: Core features work without internet connection
- **Secure Storage**: Uses Expo SecureStore for sensitive data
- **Location Services**: Geofenced triggers and meeting finder
- **Push Notifications**: Daily reminders and routine nudges
- **Sponsor Sharing**: Secure code-based sharing with sponsors
- **Step Work**: Complete all 12 steps with guided prompts
- **Daily Journaling**: Track cravings, feelings, triggers, and gratitude
- **Sobriety Counter**: Track clean time with timezone support

## Prerequisites

- **Node.js 20+** and npm
- **Expo CLI**: `npm install -g expo-cli` or use `npx expo`
- **Expo Go** app (for development) - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **EAS CLI** (for builds): `npm install -g eas-cli`

## Quick Start

### 1. Install Dependencies

From the project root:

```bash
npm install
```

Or from the mobile app directory:

```bash
cd apps/mobile
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root (or copy from `.env.example`):

```env
# Expo Public Variables (REQUIRED for mobile app)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=http://localhost:5000
```

**Important**: 
- These variables must start with `EXPO_PUBLIC_` to be accessible in the app
- Never expose `SUPABASE_SERVICE_ROLE_KEY` - it's server-side only
- Get your Supabase credentials from: Supabase Dashboard → Settings → API

### 3. Start Development Server

From the project root:

```bash
npm run mobile:dev
```

Or from the mobile app directory:

```bash
cd apps/mobile
npm start
```

This will:
- Start the Expo development server
- Show a QR code in your terminal
- Open Expo DevTools in your browser

### 4. Run on Device

**Option A: Expo Go (Recommended for Development)**
1. Install Expo Go on your phone
2. Scan the QR code from the terminal
3. The app will load on your device

**Option B: iOS Simulator (Mac only)**
```bash
npm run mobile:ios
# or
cd apps/mobile && npm run ios
```

**Option C: Android Emulator**
```bash
npm run mobile:android
# or
cd apps/mobile && npm run android
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (safe for client) |
| `EXPO_PUBLIC_API_URL` | Yes | Backend API URL (tRPC endpoint) |

**Security Note**: Only variables prefixed with `EXPO_PUBLIC_` are accessible in the app. Never expose service role keys or secrets.

## Project Structure

```
apps/mobile/
├── src/
│   ├── app/              # Expo Router pages
│   │   ├── (auth)/       # Authentication screens
│   │   └── (tabs)/       # Main app tabs
│   ├── components/       # React Native components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and services
│       ├── supabase.ts  # Supabase client
│       ├── trpc.ts      # tRPC client
│       ├── sqlite.ts    # Local database
│       └── secure-store.ts # Secure storage
├── app.json             # Expo static config
├── app.config.js        # Expo dynamic config (merges with app.json)
├── eas.json            # EAS Build configuration
└── package.json        # Dependencies
```

## Building for Production

### Prerequisites

1. **EAS Account**: Sign up at [expo.dev](https://expo.dev)
2. **EAS CLI**: `npm install -g eas-cli`
3. **Login**: `eas login`

### Build Configuration

The app uses EAS Build with configurations in `eas.json`:

- **Development**: For testing with development client
- **Preview**: Internal distribution builds
- **Production**: App Store and Play Store builds

### Build Commands

**iOS Preview Build:**
```bash
cd apps/mobile
eas build --platform ios --profile preview
```

**Android Preview Build:**
```bash
cd apps/mobile
eas build --platform android --profile preview
```

**Production Build:**
```bash
cd apps/mobile
eas build --platform all --profile production
```

### Environment Variables for Builds

Set environment variables in EAS:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-anon-key
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.yourdomain.com
```

Or configure in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
        "EXPO_PUBLIC_API_URL": "https://api.yourdomain.com"
      }
    }
  }
}
```

## Testing

### Run Tests

```bash
cd apps/mobile
npm test
```

### Type Checking

```bash
cd apps/mobile
npx tsc --noEmit
```

## Troubleshooting

### Environment Variables Not Loading

1. **Restart Expo**: Stop and restart `expo start`
2. **Clear Cache**: `expo start -c`
3. **Check Prefix**: Variables must start with `EXPO_PUBLIC_`
4. **Verify File**: Ensure `.env` is in project root

### Supabase Connection Issues

1. **Check Credentials**: Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. **Network**: Ensure device/simulator can reach Supabase
3. **RLS Policies**: Check Row Level Security policies in Supabase

### Build Failures

1. **Check EAS Status**: `eas build:list`
2. **View Logs**: Click build URL in terminal
3. **Common Issues**:
   - Missing environment variables
   - Invalid app.json/app.config.js
   - Asset files missing (icon.png, splash.png)

### Metro Bundler Issues

```bash
# Clear Metro cache
cd apps/mobile
npx expo start -c

# Reset watchman (if installed)
watchman watch-del-all
```

## Privacy & Security

### Data Storage

- **SecureStore**: Authentication tokens and sensitive data
- **SQLite**: Local cache (offline-first)
- **Supabase**: Encrypted cloud sync (opt-in)

### Permissions

The app requests:
- **Location**: For meeting finder and geofenced triggers (optional)
- **Notifications**: For daily reminders and routine nudges (optional)

All permissions are requested with clear explanations and can be denied.

### Data Sharing

- **Sponsor Sharing**: Opt-in, per-item granularity
- **No Analytics**: No tracking by default (PostHog opt-in only)
- **Export/Delete**: Users can export or delete all data anytime

## Deployment

### App Store (iOS)

1. **Build**: `eas build --platform ios --profile production`
2. **Submit**: `eas submit --platform ios`
3. **Or**: Download IPA and submit manually via App Store Connect

### Play Store (Android)

1. **Build**: `eas build --platform android --profile production`
2. **Submit**: `eas submit --platform android`
3. **Or**: Download APK/AAB and upload to Play Console

## Development Tips

### Hot Reload

- Shake device → "Reload" (or press `r` in terminal)
- Changes to `app.config.js` require restart: `expo start`

### Debugging

- **React Native Debugger**: Install standalone app
- **Flipper**: For advanced debugging
- **Console Logs**: View in terminal or Expo DevTools

### Testing on Physical Devices

- **iOS**: Requires Apple Developer account ($99/year)
- **Android**: Can test with APK on any device
- **Expo Go**: Free, but limited to Expo SDK features

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Supabase Mobile Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md)
2. Review [Expo Forums](https://forums.expo.dev)
3. Open an issue on GitHub

---

**Privacy Note**: This app is designed with privacy in mind. All sensitive data is stored securely, and cloud sync is optional. Users have full control over their data.

