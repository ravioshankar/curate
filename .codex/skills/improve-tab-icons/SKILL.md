---
name: improve-tab-icons
description: Improve mobile or web app tab bar icons for clarity, consistency, and active/inactive state quality. Use when Codex is asked to audit, choose, replace, standardize, or polish tab icons in navigation files, especially React Native, Expo Router, React Navigation, or icon-library based tab bars.
---

# Improve Tab Icons

## Workflow

1. Locate the tab/navigation definition and identify every visible tab.
2. Determine the existing icon library and prefer staying within it. Avoid mixing icon families unless the app already does so intentionally.
3. Map each tab to a recognizable concept:
   - Home/dashboard: `home`, `view-dashboard`, or close local equivalent.
   - Data, collection, records, projects: `database`, `folder-table`, `clipboard-list`, or `layers`.
   - Analytics, valuation, money: `chart-line`, `chart-pie`, `currency-usd`, or `finance`.
   - Profile/account/settings: `account-circle`, `account`, or `cog`.
4. Make focused and unfocused states distinct when the library supports outline/filled pairs. If no exact outline pair exists, choose a nearby pair instead of using the same glyph twice.
5. Route all tabs through one helper or configuration map when practical. Avoid one-off inline icon logic except for genuinely dynamic visuals such as a user avatar.
6. Keep icon size, color, and focused behavior consistent across tabs. Do not let icon changes alter tab layout height or label spacing.
7. Verify with lint/typecheck when available, or at least inspect the edited navigation file for invalid icon names, missing imports, and unreachable fallback cases.

## React Native Pattern

Prefer a typed config map over repeated switch cases when the tab list is small and stable:

```tsx
const TAB_ICONS = {
  home: { active: 'home', inactive: 'home-outline' },
  profile: { active: 'account-circle', inactive: 'account-circle-outline' },
} as const;
```

Use the app's current icon component, for example `react-native-vector-icons/MaterialCommunityIcons`, `@expo/vector-icons`, or `lucide-react-native`. Confirm names belong to the imported icon set before using them.

## Quality Bar

- Every visible tab has an intentional icon.
- Active and inactive variants are visually related but distinguishable.
- Names match user-facing tab purpose, not implementation route names.
- Fallback icons are only for unexpected cases.
- Dynamic avatar tabs still have a proper fallback icon.
