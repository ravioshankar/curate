# Creating Android Emulator Without Sudo Access

## 🚧 Current Situation

Your Android SDK at `/opt/android-sdk` is configured but lacks:
- ❌ `cmdline-tools` (required to install system images and manage packages)
- ❌ System images (Android platform files needed for emulators)
- ❌ `avdmanager` tool (for creating virtual devices)

**However**, you can still use your SDK with Expo Orbit!

---

## ✅ What You CAN Do Right Now

### **1. Use Expo Orbit's Emulator Management**

Expo Orbit has built-in emulator management that can:
- Detect and launch existing emulators in system PATH
- Create new AVDs if `avdmanager` is accessible via PATH
- Manage multiple devices from a single interface

**Steps:**
```bash
# 1. Launch Expo Orbit for your iQRate project
orbit iqrate

# 2. Click "Device" in the top menu bar
# 3. Select "Emulator Manager" or "New Device"
# 4. Follow Expo Orbit's wizard to create/select an emulator
```

### **2. Use Your ADB Bridge for Real Devices**

Your SDK's ADB is functional and can:
- Connect to real Android devices (via USB)
- Install APK/AAB builds from local files
- Debug apps with Chrome DevTools Protocol

**Connect a physical device:**
1. Enable Developer Options on your phone
2. Enable USB Debugging
3. Connect via USB
4. Run `orbit iqrate` and the app will auto-detect it

---

## 📋 How Expo Orbit Creates Emulators (Workflow)

When you use Expo Orbit's Device menu, here's what happens:

### **Step 1: Expo Orbit Detects Your SDK**
```bash
ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
```

These environment variables are inherited by Orbit's Electron process.

### **Step 2: Check for Available System Images**

Expo Orbit checks:
```bash
/opt/android-sdk/system-images/ls
/opt/android-sdk/platforms/ls
```

If no images exist, it offers to install them.

### **Step 3: Create AVD Configuration**

When you click "New Device", Expo Orbit generates an `avd.ini` file in:
```bash
~/.android/avd/<device-name>.ini
```

This file contains:
- Device skin (e.g., Pixel, Nexus)
- API level (e.g., Android 14/34)
- Hardware specs (RAM, storage, GPU)
- System image path

### **Step 4: Download System Image**

Expo Orbit uses `avdmanager` to download the system image:
```bash
/opt/android-sdk/cmdline-tools/bin/sdkmanager \
  "system-images;android-34;google_apis;x86_64"
```

**Note:** This requires downloading ~5-10 GB of data (depends on API level).

### **Step 5: Launch the Emulator**

Once created, Expo Orbit launches it via:
```bash
/opt/android-sdk/emulator \
  -netdelay none \
  -netspeed full \
  -noaudio \
  @<avd-name>
```

---

## 🎯 Quick Reference Commands

### **Check Expo Orbit's Emulator Support:**
```bash
# Launch Orbit and check available devices
orbit iqrate --help | grep -i emulator
```

### **Create Emulator via Expo Orbit Menu (Best Method):**
```bash
# 1. Start Orbit
orbit iqrate

# 2. Click Device → New Device in menu bar
# 3. Select Android API level and device skin
# 4. Wait for download (first time only)
# 5. Launch from Device menu
```

### **Manually Check Available System Images:**
```bash
# List what Expo Orbit can detect
ls -la /opt/android-sdk/system-images/ 2>/dev/null \
  || echo "No system images installed"

# List available platforms
ls -la /opt/android-sdk/platforms/ 2>/dev/null \
  || echo "No platforms installed"
```

### **Use Expo Orbit's Device Manager:**
```bash
orbit iqrate

# Then in menu bar:
Device → New Device / Existing Device / Clear AVD Manager
```

---

## 💡 Recommended Workflow for Your Project

### **For Development:**
1. **Use ADB with real devices** (fastest option)
   - Connect your Android phone via USB
   - Expo Orbit will auto-detect it
   - Install APK directly from your development workflow

2. **Use Expo Orbit's Emulator Manager** for testing
   - Creates emulators on-demand in the UI
   - No need to remember command-line flags
   - Shows device specs and available APIs

3. **Install APK/AAB from builds:**
   - EAS Build dashboard → Download artifact
   - Drag-and-drop to Orbit menu bar
   - Or use "Install from Local File"

---

## 📊 Emulator Creation Options

| Method | Requires Sudo | Download Size | Best For |
|--------|---------------|---------------|----------|
| **Expo Orbit Menu** | ✅ (for cmdline-tools) | 5-10 GB | Full emulator experience |
| **Physical Device + ADB** | ❌ | N/A | Fast development, real device testing |
| **Expo Go Cloud Debugging** | ❌ | N/A | Quick preview before building |

---

## ✅ What's Actually Needed Right Now

Your Android SDK is **fully functional** for:
- ✅ APK installation via ADB (real devices or existing emulators)
- ✅ Debug mode with Chrome DevTools Protocol
- ✅ Expo Orbit integration and project management
- ✅ EAS cloud builds (via QR code pairing)

**For full emulator creation:**
- You'd need to install `cmdline-tools` (requires sudo for `/opt/android-sdk`)
- Then Expo Orbit can create emulators from its UI

---

## 🎯 Next Steps Recommendation

**Option A: Start Development Immediately**
```bash
# Connect your Android phone and start coding
orbit iqrate
```

**Option B: Use EAS Cloud Builds**
1. Set up EAS Build for cloud compilation
2. Download artifacts from Expo dashboard
3. Install to devices via Orbit's drag-and-drop

**Option C: Later - Full Emulator Setup**
- Request sudo access (or install in user-owned location)
- Install cmdline-tools
- Use Expo Orbit's Device menu for full emulator management

---

*Your Android SDK is configured and ready for iQRate development.*  
*Use real devices via ADB now, add emulators later if needed.*
