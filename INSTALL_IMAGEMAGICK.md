# Installing ImageMagick on Windows

ImageMagick is needed to generate placeholder assets for the mobile app. Here are several ways to install it:

## 🚀 Quick Install (Recommended)

### Option 1: Chocolatey (Easiest)

**If you have Chocolatey:**
```powershell
# Run PowerShell as Administrator
choco install imagemagick -y
```

**If you don't have Chocolatey:**
```powershell
# Run PowerShell as Administrator
.\scripts\install-imagemagick-choco.ps1
```
This will install Chocolatey first, then ImageMagick.

### Option 2: Scoop

**If you have Scoop:**
```powershell
scoop install imagemagick
```

### Option 3: Use Our Script

```powershell
# Run PowerShell as Administrator
.\scripts\install-imagemagick.ps1
```

This script will:
- Try Chocolatey first
- Then try Scoop
- If neither works, open the download page

## 📥 Manual Installation

1. **Download ImageMagick:**
   - Visit: https://imagemagick.org/script/download.php#windows
   - Download: `ImageMagick-7.x.x-Q16-HDRI-x64-dll.exe` (or latest version)

2. **Run the Installer:**
   - Run the downloaded `.exe` file
   - **Important:** Check these options:
     - ✅ "Install development headers and libraries for C and C++"
     - ✅ "Add application directory to your system path"

3. **Restart Terminal:**
   - Close and reopen your PowerShell/terminal
   - Or refresh PATH:
     ```powershell
     $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
     ```

4. **Verify Installation:**
   ```powershell
   magick -version
   ```
   Should show ImageMagick version info.

## ✅ After Installation

Once ImageMagick is installed, you can create mobile assets:

```powershell
.\scripts\create-mobile-assets.ps1
```

This will generate:
- `favicon.png` (48x48px)
- `icon.png` (1024x1024px)
- `splash.png` (1242x2436px)
- `adaptive-icon.png` (1024x1024px)
- `notification-icon.png` (96x96px)

## 🔄 Alternative: Manual Asset Creation

If you prefer not to install ImageMagick, you can:

1. **Use Online Tools:**
   - [Favicon Generator](https://favicon.io/)
   - [App Icon Generator](https://www.appicon.co/)
   - [Expo Asset Generator](https://www.npmjs.com/package/expo-asset-generator)

2. **Use Design Tools:**
   - Figma
   - Canva
   - Photoshop
   - GIMP (free)

3. **Create Placeholders:**
   - Use any image editor to create simple colored squares
   - Export as PNG with the required dimensions

## 📋 Required Assets

Create these files in `apps/mobile/assets/`:

| File | Size | Purpose |
|------|------|---------|
| `favicon.png` | 48x48px | Web favicon |
| `icon.png` | 1024x1024px | App icon |
| `splash.png` | 1242x2436px | Splash screen |
| `adaptive-icon.png` | 1024x1024px | Android adaptive icon |
| `notification-icon.png` | 96x96px | Push notification icon |

## ⚠️ Notes

- **Development:** The app will work in Expo Go without these assets
- **Web Builds:** `favicon.png` is required for web builds
- **Production:** All assets are required for App Store/Play Store submissions
- **Placeholders:** You can use simple colored squares for development

## 🆘 Troubleshooting

**"magick: command not found"**
- Restart your terminal
- Or manually add ImageMagick to PATH:
  ```powershell
  $env:Path += ";C:\Program Files\ImageMagick-7.x.x-Q16-HDRI"
  ```

**Installation fails**
- Make sure you're running PowerShell as Administrator
- Check Windows Defender/antivirus isn't blocking the installer
- Try downloading the installer manually from the website

**Assets script doesn't work**
- Verify ImageMagick is installed: `magick -version`
- Check the assets directory exists: `apps\mobile\assets\`
- Try running the script as Administrator

