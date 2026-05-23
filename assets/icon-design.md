# iQRate App Icon Design

## Current Design (Updated)
- **Logo**: Three overlapping circles (red, blue, green) representing curation and collection
- **Background**: Ruby Red (#B91C1C) for app icons
- **Colors**: 
  - Red circle: #DC2626 (or white for app icons)
  - Blue circle: #2563EB (or white for app icons)  
  - Green circle: #16A34A (or white for app icons)
- **Style**: Modern, minimalist, premium feel

## Icon Specifications
- **App Icon**: 1024x1024px with ruby red background and white circles
- **Adaptive Icon**: 1024x1024px foreground with transparent background
- **Splash Icon**: 400x400px white circles on transparent (ruby red background set in config)
- **Favicon**: 32x32px with ruby red background and white circles

## Design Elements
1. **Three Circles**: Represent different categories/collections being curated
2. **Overlapping Pattern**: Shows interconnection and organization
3. **Ruby Red**: Brand color (#B91C1C) 
4. **White Accents**: Clean, premium contrast for app icons
5. **Transparency**: For in-app logo usage with colored circles

## Implementation Status ✅
All icons now use consistent three-circle design:
- ✅ `/assets/images/icon.png` (1024x1024)
- ✅ `/assets/images/adaptive-icon.png` (1024x1024) 
- ✅ `/assets/images/favicon.png` (32x32)
- ✅ `/assets/images/splash-icon.png` (400x400)
- ✅ `/assets/logo.svg` (120x120 - for in-app use)
- ✅ `/src/components/common/IQRateLogo.tsx` (React component)
- ✅ Native iOS and Android icons (auto-generated)

## Color Palette
- Primary: #B91C1C (Ruby Red)
- Secondary: #FFFFFF (White)
- Logo Colors: #DC2626 (Red), #2563EB (Blue), #16A34A (Green)