# Curate - Smart Inventory Management App

A cross-platform inventory management app built with Expo, React Native, and Redux Toolkit.

## Project Structure

```
curate/
├── app/                     # Expo Router pages
│   ├── (tabs)/             # Tab-based navigation
│   │   ├── _layout.tsx     # Tab layout configuration
│   │   ├── index.tsx       # Dashboard tab
│   │   ├── inventory.tsx   # Inventory tab
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

- **Dashboard**: Overview of inventory statistics
- **Inventory Management**: Add, view, and search items
- **Data Persistence**: Local database storage
- **Cross-Platform**: Works on iOS, Android, and Web
- **Type Safety**: Full TypeScript support
- **State Management**: Redux Toolkit for scalable state management
- **Currency Support**: Multi-currency with flag display
- **Mobile Optimized**: Touch-friendly interface

## Database

### Storage Solution
- **AsyncStorage**: Cross-platform local storage
- **Persistent Data**: Survives app restarts and updates
- **Structured Storage**: Separate inventory and settings data
- **Type-Safe Operations**: Full TypeScript integration

### Database Service (`DatabaseService.ts`)
```typescript
// Inventory operations
await databaseService.saveInventoryItem(item);
const items = await databaseService.getInventoryItems();
await databaseService.deleteInventoryItem(id);

// Settings operations
await databaseService.saveSettings(settings);
const settings = await databaseService.getSettings();
```

### Data Structure
- **Inventory Items**: JSON objects with id, name, category, location, prices, etc.
- **User Settings**: Currency preferences, theme, notifications
- **Auto-Initialization**: Database setup on first app launch
- **Mock Data**: Sample inventory items for new users
