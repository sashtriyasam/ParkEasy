# Simple Deployment Script
Write-Output "Starting build process..."

# Navigate to Frontend
Set-Location frontend

# Clean
Write-Output "Cleaning..."
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path dist) { Remove-Item -Recurse -Force dist }

# Install
Write-Output "Installing dependencies..."
npm install

# Build
Write-Output "Building..."
npm run build

Write-Output "Build process complete."
