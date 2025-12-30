# PowerShell script to install ImageMagick on Windows
# Run as Administrator: .\scripts\install-imagemagick.ps1

Write-Host "ImageMagick Installation Script" -ForegroundColor Cyan
Write-Host "=" -Repeat 50 -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script requires Administrator privileges." -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host "`nAlternatively, you can install ImageMagick manually:" -ForegroundColor Cyan
    Write-Host "1. Download from: https://imagemagick.org/script/download.php#windows" -ForegroundColor Cyan
    Write-Host "2. Run the installer" -ForegroundColor Cyan
    Write-Host "3. Make sure to check 'Install development headers and libraries for C and C++'" -ForegroundColor Cyan
    exit 1
}

# Check if Chocolatey is installed
$chocoInstalled = $false
try {
    $null = Get-Command choco -ErrorAction Stop
    $chocoInstalled = $true
    Write-Host "✅ Chocolatey detected" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  Chocolatey not found" -ForegroundColor Gray
}

# Check if Scoop is installed
$scoopInstalled = $false
try {
    $null = Get-Command scoop -ErrorAction Stop
    $scoopInstalled = $true
    Write-Host "✅ Scoop detected" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  Scoop not found" -ForegroundColor Gray
}

# Installation methods (in order of preference)
$installed = $false

# Method 1: Chocolatey
if ($chocoInstalled -and -not $installed) {
    Write-Host "`n📦 Installing ImageMagick via Chocolatey..." -ForegroundColor Cyan
    try {
        choco install imagemagick -y
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ ImageMagick installed successfully via Chocolatey!" -ForegroundColor Green
            $installed = $true
        }
    } catch {
        Write-Host "❌ Chocolatey installation failed" -ForegroundColor Red
    }
}

# Method 2: Scoop
if ($scoopInstalled -and -not $installed) {
    Write-Host "`n📦 Installing ImageMagick via Scoop..." -ForegroundColor Cyan
    try {
        scoop install imagemagick
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ ImageMagick installed successfully via Scoop!" -ForegroundColor Green
            $installed = $true
        }
    } catch {
        Write-Host "❌ Scoop installation failed" -ForegroundColor Red
    }
}

# Method 3: Direct download (if package managers not available)
if (-not $installed) {
    Write-Host "`n📥 Package managers not available. Downloading ImageMagick installer..." -ForegroundColor Cyan

    $downloadUrl = "https://imagemagick.org/script/download.php"
    $installerPath = "$env:TEMP\ImageMagick-installer.exe"

    Write-Host "Please download ImageMagick manually:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://imagemagick.org/script/download.php#windows" -ForegroundColor Cyan
    Write-Host "2. Download the Windows binary (ImageMagick-7.x.x-Q16-HDRI-x64-dll.exe)" -ForegroundColor Cyan
    Write-Host "3. Run the installer" -ForegroundColor Cyan
    Write-Host "4. Make sure to check 'Install development headers and libraries for C and C++'" -ForegroundColor Cyan
    Write-Host "5. Add ImageMagick to PATH during installation" -ForegroundColor Cyan

    # Try to open the download page
    try {
        Start-Process "https://imagemagick.org/script/download.php#windows"
        Write-Host "`n✅ Opened download page in your browser" -ForegroundColor Green
    } catch {
        Write-Host "`n⚠️  Could not open browser automatically" -ForegroundColor Yellow
    }
}

# Verify installation
Write-Host "`n🔍 Verifying ImageMagick installation..." -ForegroundColor Cyan

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

try {
    $magickVersion = & magick -version 2>&1 | Select-Object -First 1
    if ($magickVersion -match "ImageMagick") {
        Write-Host "✅ ImageMagick is installed and working!" -ForegroundColor Green
        Write-Host "Version: $magickVersion" -ForegroundColor Gray
        Write-Host "`nYou can now run: .\scripts\create-mobile-assets.ps1" -ForegroundColor Cyan
        $installed = $true
    }
} catch {
    Write-Host "⚠️  ImageMagick not found in PATH" -ForegroundColor Yellow
    Write-Host "If you just installed it, you may need to:" -ForegroundColor Yellow
    Write-Host "1. Close and reopen your terminal" -ForegroundColor Yellow
    Write-Host "2. Or restart your computer" -ForegroundColor Yellow
}

if (-not $installed) {
    Write-Host "`n📝 Manual Installation Instructions:" -ForegroundColor Cyan
    Write-Host "=" -Repeat 50 -ForegroundColor Cyan
    Write-Host "1. Download ImageMagick:" -ForegroundColor White
    Write-Host "   https://imagemagick.org/script/download.php#windows" -ForegroundColor Cyan
    Write-Host "`n2. Run the installer and:" -ForegroundColor White
    Write-Host "   ✓ Check 'Install development headers and libraries for C and C++'" -ForegroundColor Green
    Write-Host "   ✓ Check 'Add application directory to your system path'" -ForegroundColor Green
    Write-Host "`n3. After installation, restart your terminal or run:" -ForegroundColor White
    Write-Host "   `$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')" -ForegroundColor Cyan
    Write-Host "`n4. Verify installation:" -ForegroundColor White
    Write-Host "   magick -version" -ForegroundColor Cyan
}

