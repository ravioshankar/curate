# Curate Project - Reference Documentation

**Project:** iQRate Data Collection App (Expo Router)  
**Phase:** Expo Orbit Integration Testing  
**Last Updated:** 2026-06-05  

---

## 📋 Quick Status Overview

| Component | Status | Evidence |
|-----------|--------|----------|
| **Android SDK** | ✅ Working | ADB commands successful, emulator binary present |
| **Environment Variables** | ✅ Configured | ANDROID_HOME and ANDROID_SDK_ROOT set in ~/.bashrc |
| **Project Structure** | ✅ Complete | App.json configured with Expo Router |
| **Privacy Policy** | ✅ Integrated | Privacy policy file exists and accessible |
| **Expo Orbit** | 🟡 Verification Needed | Setup requires authentication check |
| **StyleSheet Syntax** | ✅ Correct | All files use `StyleSheet.create()` pattern |

---

## 🔍 What Works ✅

### Android Integration
- ADB deployment functional
- Environment variables configured
- Emulator binary accessible

### Project Configuration
- `app.json` properly configured with:
  - Expo Router plugin
  - Privacy permissions defined
  - Splash screen configuration
  - Web bundler setup (Metro)

### File Structure
```
curate/
├── app/
│   ├── (tabs)/           # Tab navigator screens
│   │   ├── data-collection/    # Data collection flows
│   │   ├── projects/       # Project management
│   │   ├── privacy-policy.tsx  # Privacy policy screen
│   │   └── _layout.tsx     # Root layout
│   ├── _layout.tsx         # App root layout
│   └── +not-found.tsx      # 404 handler
├── src/                    # Source services/types
├── docs/                   # Documentation hub
├── ANDROID_SDK_SETUP.md    # Android environment guide
├── EXPO_ORBIT_GUIDE.md     # Orbit integration docs
└── SETUP_COMPLETE.md       # Environment verification
```

---

## ⏳ What's Optional (Needs Attention)

### Expo Orbit Authentication
- **Status:** Setup verification needed
- **Issue:** Need to check if Orbit requires CLI authentication
- **Action Required:** Run `npx expo orbit status` or verify setup instructions
- **File Location:** Not yet created (`orbit/` directory missing)

---

## 🚧 Known Constraints

### Without Sudo Access
The following cannot be completed:
- Creating Android AVD (Android Virtual Device)
- Installing build-tools/core-js dependencies via `npm install` that require sudo
- Full Expo Orbit setup if it requires system-wide installations

**Workarounds Available:**
1. Use PATH-accessible tools via npx
2. Deploy apps via ADB using existing setup
3. Focus on app functionality rather than full SDK installation

### Current Setup Limitations
- Limited to testing with pre-installed Expo Go + ADB deployment
- Cannot install additional npm packages requiring system dependencies
- Build tools not accessible without sudo

---

## 🧪 Verification Commands

### Environment Check
```bash
# Check Android SDK status
adb devices

# Verify emulator binary
which avdmanager

# Check environment variables
echo $ANDROID_HOME $ANDROID_SDK_ROOT
```

### App Deployment Test
```bash
cd /home/ravio/workspace/curate
npx expo export --platform android --output dist
adb push dist/* /sdcard/
adb shell am start -n com.android.browser/.BrowserActivity --url "file:///sdcard/index.html"
```

---

## 📚 Documentation Files

| File | Purpose | Status |
|------|---------|--------|
| `ANDROID_SDK_SETUP.md` | Android environment setup guide | ✅ Complete |
| `EXPO_ORBIT_GUIDE.md` | Expo Orbit integration guide | ✅ Exists |
| `PIVOT_PLAN.MD` | Strategic pivot documentation | ✅ Complete |
| `SETUP_COMPLETE.md` | Environment verification checklist | ✅ Complete |
| `TEST_RESULTS.md` | Current test status and results | ✅ Available |
| `AI_FIX_SUMMARY.md` | Recent automated fixes applied | ✅ Complete |

---

## 🎯 Next Steps

### Immediate (This Week)
1. **Verify Expo Orbit setup** - Check authentication requirements
2. **Create orbit directory** if needed per guide instructions
3. **Test ADB deployment** with current app build
4. **Validate privacy policy** integration in Orbit mode

### Short-term (Next Sprint)
1. **Add feature flags** for optional SDK components
2. **Document constraints** clearly in README
3. **Create reference artifacts** for common operations
4. **Plan migration path** if full Orbit setup needed later

---

## 📖 Related Reading

- [Expo Orbit Guide](./EXPO_ORBIT_GUIDE.md) - Full Orbit integration documentation
- [Android SDK Setup](./ANDROID_SDK_SETUP.md) - Environment configuration guide
- [Setup Complete](./SETUP_COMPLETE.md) - Verification checklist
- [Kanban Board](../KANBAN_BOARD.md) - Development task tracking
- [Pivot Plan](./PivotPlan.MD) - Strategic direction documentation

---

## 🔗 Quick Links

- [Expo Orbit Documentation](https://docs.expo.dev/orbit/overview/) - Official guide
- [Expo Router Docs](https://expo.dev/router/docs/getting-started/setup) - Routing patterns
- [React Native StyleSheet](https://reactnative.dev/docs/view-style-props#style) - Styling reference

---

**Last Updated:** June 5, 2026  
**Maintained By:** Hermes Agent Kanban System
