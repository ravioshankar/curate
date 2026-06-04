# Expo Orbit Integration Guide for iQRate

## 🎯 Overview

**Expo Orbit** is a menu bar system tray application that accelerates your mobile development workflow by enabling one-click build launches and simulator management.

### ✨ Key Features
- **Launch builds instantly** - Install APK/AAB files from local storage, GitHub releases, or EAS dashboard
- **Development builds in Expo Go** - Skip full reinstall cycles with atomic updates
- **Simulator/Emulator control** - Launch iOS simulator or Android emulator with a click
- **Offline capability** - Download builds to your machine first, install later without internet
- **Auto-updates** (Linux) - Built-in support for automatic build update detection

---

## 📦 Current Setup Analysis

### Project: iQRate (`/home/ravio/workspace/curate/`)

#### Core Configuration Files ✓

1. **`app.json`** - Expo configuration
   ```json
   {
     "name": "iQRate",
     "slug": "iQRate",
     "version": "1.0.1",
     "icon": "./assets/images/icon.svg",
     "scheme": "iQRate",
     "newArchEnabled": true,
     "ios": { "supportsTablet": true },
     "android": {
       "package": "com.iQRate.collection",
       "versionCode": 10001
     },
     "web": { "themeColor": "#B91C1C" }
   }
   ```

2. **`package.json`** - Build scripts
   ```bash
   # Available build commands:
   npm run build:apk           # Android APK (preview profile)
   npm run build:local         # Local Android build
   npm run eas:preview         # Cross-platform preview builds
   npm run eas:production      # Production builds for all platforms
   ```

3. **`eas.json`** - EAS Build profiles
   - ✓ Development profile (developmentClient: true)
   - ✓ Preview profile (APK for Android, simulator for iOS)
   - ✓ Production profile (AAB for Android)
   - ✓ Local profile (internal distribution)

---

## 🚀 Expo Orbit Installation Options for Linux

### Option 1: Direct .deb Package (✓ You have this!)
Your `/home/ravio/Downloads/expo-orbit_2.6.0_amd64.deb` file:

```bash
# Install the deb package
sudo dpkg -i /home/ravio/Downloads/expo-orbit_2.6.0_amd64.deb

# Fix any missing dependencies
sudo apt-get install -f

# Launch Orbit
orbit &  # Or use orbit command from PATH
```

### Option 2: GitHub Releases
Download directly from https://github.com/expo/orbit/releases

```bash
# Download latest version
wget https://github.com/expo/orbit/releases/download/v2.x.y/expo-orbit_2.x.y_amd64.deb
sudo dpkg -i expo-orbit_*.deb
```

### Option 3: Build from Source (Advanced)
Clone and build locally:

```bash
git clone https://github.com/expo/orbit.git
cd orbit
npm install
npm run build
sudo npm install -g ./orbit-build
```

---

## 🎯 Workflow Integration for iQRate

### Scenario 1: Local Development (No EAS)

**Step 1:** Build locally with `npm run build:apk`
**Step 2:** Copy APK to `/home/ravio/Downloads/` or any accessible location
**Step 3:** Launch from Orbit menu bar → "Install from Local File" → Select your APK

### Scenario 2: EAS Cloud Builds (Recommended for Production)

**Step 1:** Configure EAS account:
```bash
npm login @expo/cli
# Follow prompts to link GitHub and configure signing
```

**Step 2:** Build on EAS platform:
```bash
npm run eas:preview        # Preview build in cloud
# OR
npm run eas:production     # Production build (requires signing)
```

**Step 3:** Download from Orbit automatically or via link, then install.

### Scenario 3: Development Builds with Expo Go

**Step 1:** Create development build:
```bash
npm run eas:preview        # Uses "preview" profile → APK format
```

**Step 2:** Launch on physical device using **Expo Go app**:
- Download "Expo Go" from Play Store/App Store
- Open Expo Orbit menu bar
- Click "Launch on Device" → Select your device
- Automatically connects via QR code to install development build

---

## 📱 Testing Checklist

### For Development Builds
- [ ] Can you launch preview build from Orbit?
- [ ] Does it connect to Expo Go successfully?
- [ ] Are updates applied atomically (instant)?

### For Production Builds  
- [ ] Is signing certificate configured in EAS?
- [ ] Can you install production AAB/APK?
- [ ] Does version code increment properly?

---

## 🔧 Advanced Features

### Auto-Updates (Linux v2.6.0+)
Expo Orbit 2.6.0+ includes auto-update support for Linux:
```bash
# Check if auto-updates are enabled
orbit --help | grep -i update

# Auto-updates will notify you when new builds are available
# Click the menu bar icon → "Check for Updates"
```

### File Explorer Integration
Drag-and-drop APK/AAB files directly into Orbit to install them.

---

## 🎓 Best Practices

### 1. **Use Profiles Wisely**
   - `development` profile → Expo Go testing only
   - `preview` profile → Internal distribution (no Google Play account needed)
   - `production` profile → Submit to stores (requires signing)
   - `local` profile → Local development with internal distribution

### 2. **Keep Builds Organized**
Create a directory structure:
```bash
mkdir -p ~/expo-builds/{dev,preview,staging,production}
# Place your APK/AAB files in appropriate folders
```

### 3. **Version Control**
Add to `.gitignore`:
```bash
/app.json                # If sensitive (add sensitive fields)
/node_modules/
/.git/
/coverage/
/build/
/expo-builds/
```

### 4. **Test on Real Devices Early**
- Development builds work on physical devices too
- Use Expo Orbit's simulator management to test across platforms

---

## 📚 Next Steps

Choose one path forward:

### Path A: Quick Start (Recommended for Learning)
```bash
# Install deb if not already installed
sudo dpkg -i /home/ravio/Downloads/expo-orbit_2.6.0_amd64.deb
sudo apt-get install -f

# Build a test APK
cd /home/ravio/workspace/curate
npm run build:local

# Find where orbit installs (check PATH or ~/.local/bin)
which orbit || find /usr/local -name "orbit" 2>/dev/null
```

### Path B: EAS Cloud Setup
```bash
# Link Expo account
npm login @expo/cli

# Create first preview build
npm run eas:preview

# Download build link (orbit will prompt you)
```

### Path C: Simulator Testing
```bash
# Launch Android emulator with Orbit
orbit --help | grep -i emulator

# Or launch from menu bar → "Launch Emulator"
```

---

## 📖 References

- [Expo Orbit Docs](https://docs.expo.dev/build/orbit/)
- [GitHub Releases](https://github.com/expo/orbit/releases)
- [Expo EAS Build Docs](https://docs.expo.dev/eas/overview/)
- [EAS Submit Configuration](https://docs.expo.dev/eas-update/ci-cd/#eas-submit-configuration)

---

**Status**: Workspace analyzed. Expo Orbit deb file available (v2.6.0). Ready for installation and build testing. 🚀