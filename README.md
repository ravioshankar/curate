<div align="center">
  <img src="./assets/logo.svg" alt="Curate Logo" width="120" height="120" />
  
  # Curate - Premium Personal Asset Curator
  
  *A sophisticated cross-platform app that helps you curate, organize, and cherish your personal belongings with elegance and intelligence.*
  
  **Built with Expo, React Native, and Redux Toolkit**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-51-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
  [![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.0-purple.svg)](https://redux-toolkit.js.org/)
</div>

---

## Project Structure

```
curate/
├── app/                     # Expo Router pages
│   ├── (tabs)/             # Tab-based navigation
│   │   ├── _layout.tsx     # Tab layout configuration
│   │   ├── index.tsx       # Dashboard tab
│   │   ├── collection.tsx  # Collection tab
│   │   └── profile.tsx     # Profile tab
│   ├── _layout.tsx         # Root layout
│   └── +not-found.tsx      # 404 page
├── src/                     # Business logic
│   ├── components/         # Business components
│   │   ├── common/         # Shared components
│   │   ├── layout/         # Layout components
│   │   └── providers/      # Context providers
│   ├── screens/            # Screen components
│   ├── services/           # Data services
│   ├── store/              # Redux state
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   └── data/               # Mock data
├── components/             # UI components
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── IconSymbol.tsx
│   ├── TabBarBackground.tsx
│   └── [other UI components]
├── constants/              # App constants
├── hooks/                  # Custom hooks
└── assets/                 # Static assets
```

## Architecture Principles

### State Management
- **Redux Toolkit**: Centralized state management
- **Async Actions**: Proper handling of async operations
- **Type Safety**: Full TypeScript integration

### Service Layer
- **StorageService**: Abstracted data persistence
- **Separation of Concerns**: Business logic separated from UI
- **Error Handling**: Proper try/catch patterns

### Component Architecture
- **Screen Components**: Page-level components in `src/screens/`
- **Reusable Components**: Shared UI components in `src/components/`
- **Provider Pattern**: Redux provider wrapper

### Cross-Platform Support
- **React Native**: Mobile-first approach
- **Expo Web**: Web compatibility
- **Shared Codebase**: Same code for mobile and web

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the development server
   ```bash
   npx expo start
   ```

3. Open the app in:
   - [Expo Go](https://expo.dev/go) for mobile testing
   - Web browser for web testing
   - iOS Simulator or Android Emulator

## Features

- **Personal Collection Dashboard**: Beautiful overview of your curated belongings
- **Smart Asset Organization**: Categorize and track your valuable possessions
- **Visual Memory Keeping**: Capture and store photos of your cherished items
- **Multi-Currency Valuation**: Track worth across different currencies
- **Cross-Platform Sync**: Access your collection on iOS, Android, and Web
- **Secure Local Storage**: Your personal data stays private and secure
- **Elegant Ruby Red Design**: Premium interface with sophisticated styling
- **Intelligent Search**: Quickly find any item in your collection

## Database

### Storage Solution
- **AsyncStorage**: Cross-platform local storage
- **Persistent Data**: Survives app restarts and updates
- **Structured Storage**: Separate collection and settings data
- **Type-Safe Operations**: Full TypeScript integration

### Database Service (`DatabaseService.ts`)
```typescript
// Collection operations
await databaseService.saveCollectionItem(item);
const items = await databaseService.getCollectionItems();
await databaseService.deleteCollectionItem(id);

// Settings operations
await databaseService.saveSettings(settings);
const settings = await databaseService.getSettings();
```

### Data Structure
- **Collection Items**: JSON objects with id, name, category, location, prices, etc.
- **User Settings**: Currency preferences, theme, notifications
- **Auto-Initialization**: Database setup on first app launch
- **Mock Data**: Sample collection items for new users
