# Curate - Smart Inventory Management App

A cross-platform inventory management app built with Expo, React Native, and Redux Toolkit.

## Project Structure

```
curate/
├── app/                     # Expo Router pages
│   ├── (tabs)/             # Tab-based navigation
│   │   ├── _layout.tsx     # Tab layout configuration
│   │   ├── index.tsx       # Main home screen
│   │   └── placeholder*.tsx # Tab placeholders
│   └── _layout.tsx         # Root layout
├── src/                     # Source code (business logic)
│   ├── components/         # Business logic components
│   │   ├── common/         # Shared business components
│   │   │   ├── InventoryCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── Header.tsx
│   │   │   └── NavButton.tsx
│   │   ├── forms/          # Form-specific components
│   │   └── providers/      # Context/Provider components
│   ├── screens/            # Screen components
│   │   ├── DashboardScreen.tsx
│   │   └── HomePage.tsx
│   ├── services/           # API/Storage services
│   │   └── StorageService.ts
│   ├── store/              # Redux state management
│   │   ├── InventoryStore.ts
│   │   └── store.ts
│   ├── types/              # TypeScript interfaces
│   │   └── inventory.ts
│   ├── utils/              # Utility functions
│   │   └── inventoryUtils.ts
│   └── data/               # Mock data & constants
│       └── mockInventory.ts
├── components/             # UI/Theme components
│   ├── ui/                 # Platform-specific UI
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── Collapsible.tsx
│   ├── ExternalLink.tsx
│   ├── HapticTab.tsx
│   └── ParallaxScrollView.tsx
├── constants/              # App constants
├── hooks/                  # Custom React hooks
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
- **Data Persistence**: Local storage with AsyncStorage
- **Cross-Platform**: Works on iOS, Android, and Web
- **Type Safety**: Full TypeScript support
- **State Management**: Redux Toolkit for scalable state management
