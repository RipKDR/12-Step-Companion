# Quick Chocolatey installation script for ImageMagick
# Run as Administrator: .\scripts\install-imagemagick-choco.ps1

Write-Host "Installing ImageMagick via Chocolatey..." -ForegroundColor Cyan

# Check if Chocolatey is installed
try {
    $null = Get-Command choco -ErrorAction Stop
    Write-Host "✅ Chocolatey found" -ForegroundColor Green
} catch {
    Write-Host "❌ Chocolatey not installed. Installing Chocolatey first..." -ForegroundColor Yellow

    # Install Chocolatey
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# Install ImageMagick
Write-Host "Installing ImageMagick..." -ForegroundColor Cyan
choco install imagemagick -y

# Verify
try {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    $version = & magick -version 2>&1 | Select-Object -First 1
    Write-Host "✅ ImageMagick installed: $version" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Installation complete. Please restart your terminal." -ForegroundColor Yellow
}

