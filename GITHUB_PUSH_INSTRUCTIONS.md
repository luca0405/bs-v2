# Push Bean Stalker App to GitHub Repository

## Repository: luca0405/bean-stalker-app2

### Method 1: Direct Upload via GitHub Web Interface

1. **Download the project:**
   - In Replit, click the three dots menu → "Download as zip"
   - Extract the zip file on your computer

2. **Go to your GitHub repository:**
   - Visit: https://github.com/luca0405/bean-stalker-app2
   - Click "uploading an existing file" or drag and drop

3. **Upload all files:**
   - Select all project files and folders
   - Add commit message: "Initial Bean Stalker iOS app with Xcode Cloud setup"
   - Click "Commit changes"

### Method 2: Git Commands (Recommended)

If you have Git installed locally:

```bash
# Clone your repository
git clone https://github.com/luca0405/bean-stalker-app2.git
cd bean-stalker-app2

# Copy all Bean Stalker files to this directory
# (copy from downloaded Replit project)

# Add all files
git add .

# Commit with descriptive message
git commit -m "Add complete Bean Stalker iOS app with Xcode Cloud and TestFlight setup

- Full React PWA with TypeScript
- iOS app with Capacitor integration
- RevenueCat IAP system ready
- Square Kitchen Display integration
- Xcode Cloud workflow configured
- TestFlight distribution setup
- Bundle ID: com.beanstalker.member"

# Push to GitHub
git push origin main
```

### Method 3: Using GitHub Desktop

1. Open GitHub Desktop
2. Clone repository: luca0405/bean-stalker-app2
3. Copy all Bean Stalker files to the cloned folder
4. Commit changes with message
5. Push to origin

## Important Files Included:

### Core Application
- `client/` - React PWA frontend
- `server/` - Node.js Express backend
- `shared/` - TypeScript schemas
- `ios/` - Capacitor iOS project

### iOS/TestFlight Setup
- `.xcode-cloud.yml` - Xcode Cloud workflow
- `ci_scripts/ci_post_clone.sh` - Build preparation
- `XCODE_CLOUD_TESTFLIGHT_SETUP.md` - Setup guide
- `REVENUECAT_PRODUCTS_SETUP.md` - IAP configuration

### Configuration
- `capacitor.config.ts` - iOS app configuration
- `package.json` - Dependencies and scripts
- `drizzle.config.ts` - Database configuration

## After Pushing to GitHub:

### 1. Set up Xcode Cloud
- Open Xcode
- Product → Xcode Cloud → Create Workflow
- Connect to: https://github.com/luca0405/bean-stalker-app2
- Use GitHub App installation method (fixes "Repository is Locked")

### 2. Configure Environment Variables
In your deployment environment, set:
```
DATABASE_URL=your_postgresql_url
SQUARE_ACCESS_TOKEN=your_square_token
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_LOCATION_ID=your_square_location_id
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_key
```

### 3. TestFlight Distribution
- Builds will automatically upload to TestFlight
- Add internal testers in App Store Connect
- Test account: iamninz / password123

## Project Status:
✅ Complete iOS app ready for TestFlight
✅ Xcode Cloud workflow configured
✅ RevenueCat IAP integration
✅ Square Kitchen Display sync
✅ Bundle ID: com.beanstalker.member
✅ Safe area fixes for iPhone 16 Pro

Ready for App Store distribution!