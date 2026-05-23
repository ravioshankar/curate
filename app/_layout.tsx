import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { ReduxProvider } from '@/src/components/providers/ReduxProvider';
import { AppProvider } from '@/src/components/providers/AppProvider';
import { CurrencyProvider } from '@/src/components/providers/SimpleCurrencyProvider';
import { ThemedRootLayout } from '@/src/components/layout/ThemedRootLayout';
import { migrationService } from '@/src/services/MigrationService';

// Run migration in background before rendering UI
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Always run migration on app launch (even if fonts not loaded yet)
  migrationService.populateInitialData().then(() => {
    console.log('RootLayout: Initial data population complete');
  }).catch((error) => {
    console.error('RootLayout: Failed to populate initial data:', error);
  });

  if (!loaded) {
    return null;
  }

  return (
    <ReduxProvider>
      <CurrencyProvider>
        <AppProvider>
          <ThemedRootLayout />
        </AppProvider>
      </CurrencyProvider>
    </ReduxProvider>
  );
}
