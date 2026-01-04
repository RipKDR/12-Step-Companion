# PowerShell script to remove nested folder and archive directory
# Run this script from the project root: .\scripts\remove-folders.ps1

Write-Host "🧹 Removing unnecessary folders..." -ForegroundColor Cyan

# Remove nested 12-Step-Companion folder
$nestedFolder = "12-Step-Companion"
if (Test-Path $nestedFolder) {
    Write-Host "Removing nested folder: $nestedFolder" -ForegroundColor Yellow
    Remove-Item -Path $nestedFolder -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path $nestedFolder) {
        Write-Host "  ❌ Failed to remove $nestedFolder" -ForegroundColor Red
    } else {
        Write-Host "  ✅ Successfully removed $nestedFolder" -ForegroundColor Green
    }
} else {
    Write-Host "  ⏭️  $nestedFolder does not exist" -ForegroundColor Gray
}

# Remove archive directory
$archiveFolder = "apps\docs\archive"
if (Test-Path $archiveFolder) {
    Write-Host "Removing archive folder: $archiveFolder" -ForegroundColor Yellow
    Remove-Item -Path $archiveFolder -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path $archiveFolder) {
        Write-Host "  ❌ Failed to remove $archiveFolder" -ForegroundColor Red
    } else {
        Write-Host "  ✅ Successfully removed $archiveFolder" -ForegroundColor Green
    }
} else {
    Write-Host "  ⏭️  $archiveFolder does not exist" -ForegroundColor Gray
}

# Remove empty "markdowns from prompts" folder
$promptsFolder = "markdowns from prompts"
if (Test-Path $promptsFolder) {
    Write-Host "Removing empty folder: $promptsFolder" -ForegroundColor Yellow
    Remove-Item -Path $promptsFolder -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path $promptsFolder) {
        Write-Host "  ❌ Failed to remove $promptsFolder" -ForegroundColor Red
    } else {
        Write-Host "  ✅ Successfully removed $promptsFolder" -ForegroundColor Green
    }
} else {
    Write-Host "  ⏭️  $promptsFolder does not exist" -ForegroundColor Gray
}

Write-Host "`n✅ Cleanup complete!" -ForegroundColor Green

