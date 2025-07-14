#!/bin/bash

# Xcode Cloud Post-Clone Script for Bean Stalker
# This script runs after Xcode Cloud clones your repository

set -e

echo "🚀 Starting Bean Stalker iOS build process..."
echo "📍 Current directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

# Check Node.js and npm versions
echo "🔍 Environment check..."
node --version
npm --version

# Install Node.js dependencies with retries and timeout
echo "📦 Installing Node.js dependencies..."
timeout 600 npm ci --no-audit --no-fund --prefer-offline || {
  echo "⚠️ npm ci failed, trying alternative approach..."
  rm -rf node_modules package-lock.json
  npm install --no-audit --no-fund
}

# Verify package installation
echo "🔍 Verifying package installation..."
ls -la node_modules/ | head -10

# Build the web application with extended timeout
echo "🔨 Building web application..."
timeout 900 npm run build || {
  echo "⚠️ Build timeout or failure, retrying with verbose output..."
  npm run build --verbose
}

# Verify build output
echo "🔍 Verifying build output..."
if [ -d "dist" ]; then
  echo "✅ Build directory exists"
  ls -la dist/
  echo "📊 Build size: $(du -sh dist/)"
else
  echo "❌ Build directory missing!"
  exit 1
fi

# Sync Capacitor with latest web build
echo "🔄 Syncing Capacitor iOS project..."
npx cap sync ios --no-open

# Verify Capacitor sync
echo "🔍 Verifying Capacitor sync..."
if [ -d "ios/App/App/public" ]; then
  echo "✅ iOS public directory synced"
  ls -la ios/App/App/public/ | head -10
else
  echo "❌ iOS sync failed!"
  exit 1
fi

# Install CocoaPods dependencies with specific version
echo "📱 Installing iOS dependencies..."
cd ios/App

# Check if Podfile exists
if [ -f "Podfile" ]; then
  echo "✅ Podfile found"
  cat Podfile
  
  # Install pods with retry mechanism
  pod install --repo-update --verbose || {
    echo "⚠️ Pod install failed, trying without repo update..."
    pod install --verbose
  }
else
  echo "❌ Podfile missing!"
  exit 1
fi

cd ../..

# Final verification
echo "🔍 Final verification..."
echo "iOS project structure:"
ls -la ios/App/
echo "Pod installation status:"
ls -la ios/App/Pods/ | head -5

echo "✅ Bean Stalker build preparation complete!"
echo "📱 Ready for Xcode build and TestFlight upload"