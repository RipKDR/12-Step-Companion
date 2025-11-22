# PowerShell script to create placeholder assets for mobile app
# Run from project root: .\scripts\create-mobile-assets.ps1

$assetsDir = "apps\mobile\assets"

Write-Host "Creating mobile app assets directory..." -ForegroundColor Cyan

# Create assets directory if it doesn't exist
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
    Write-Host "Created assets directory: $assetsDir" -ForegroundColor Green
} else {
    Write-Host "Assets directory already exists: $assetsDir" -ForegroundColor Gray
}

# Check if ImageMagick is available
$magickAvailable = $false
try {
    $null = Get-Command magick -ErrorAction Stop
    $magickAvailable = $true
} catch {
    Write-Host "ImageMagick not found. Will create minimal placeholder files." -ForegroundColor Yellow
}

if ($magickAvailable) {
    Write-Host "Creating assets with ImageMagick..." -ForegroundColor Cyan

    # Create favicon (48x48)
    magick -size 48x48 xc:"#10b981" "$assetsDir\favicon.png"
    Write-Host "Created favicon.png" -ForegroundColor Green

    # Create icon (1024x1024)
    magick -size 1024x1024 xc:"#10b981" "$assetsDir\icon.png"
    Write-Host "Created icon.png" -ForegroundColor Green

    # Create splash (1242x2436)
    magick -size 1242x2436 gradient:"#10b981-white" "$assetsDir\splash.png"
    Write-Host "Created splash.png" -ForegroundColor Green

    # Create adaptive-icon (1024x1024)
    magick -size 1024x1024 xc:"#10b981" "$assetsDir\adaptive-icon.png"
    Write-Host "Created adaptive-icon.png" -ForegroundColor Green

    # Create notification-icon (96x96)
    magick -size 96x96 xc:"#10b981" "$assetsDir\notification-icon.png"
    Write-Host "Created notification-icon.png" -ForegroundColor Green
} else {
    Write-Host "`nImageMagick not available. Please install it or create assets manually:" -ForegroundColor Yellow
    Write-Host "1. Install ImageMagick: https://imagemagick.org/script/download.php" -ForegroundColor Yellow
    Write-Host "2. Or create these files manually in ${assetsDir}:" -ForegroundColor Yellow
    Write-Host "   - favicon.png (48x48px)" -ForegroundColor Yellow
    Write-Host "   - icon.png (1024x1024px)" -ForegroundColor Yellow
    Write-Host "   - splash.png (1242x2436px)" -ForegroundColor Yellow
    Write-Host "   - adaptive-icon.png (1024x1024px)" -ForegroundColor Yellow
    Write-Host "   - notification-icon.png (96x96px)" -ForegroundColor Yellow
    Write-Host "`nFor now, creating a minimal text file as placeholder..." -ForegroundColor Yellow

    # Create a placeholder text file
    $readmeContent = @"
# Placeholder Assets Directory

This directory should contain:
- favicon.png (48x48px minimum)
- icon.png (1024x1024px)
- splash.png (1242x2436px recommended)
- adaptive-icon.png (1024x1024px)
- notification-icon.png (96x96px)

See apps/mobile/ASSETS_NEEDED.md for details.
"@
    $readmePath = Join-Path $assetsDir "README.txt"
    $readmeContent | Out-File -FilePath $readmePath -Encoding UTF8
}

Write-Host "`n✅ Assets setup complete!" -ForegroundColor Green
Write-Host "Note: For production, replace placeholder assets with proper designs." -ForegroundColor Cyan

