import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ThemedRootLayout } from '@/src/components/layout/ThemedRootLayout';
import { AppProvider } from '@/src/components/providers/AppProvider';
import { ReduxProvider } from '@/src/components/providers/ReduxProvider';
import { CurrencyProvider } from '@/src/components/providers/SimpleCurrencyProvider';
import { firebaseConfig } from '@/src/config/firebaseConfig';
import { useAppDispatch } from '@/src/hooks/useAppDispatch';
import { initFirebase } from '@/src/services/AuthService';
import { migrationService } from '@/src/services/MigrationService';
import { syncService } from '@/src/services/SyncService';

// Initialize Firebase once at app startup
initFirebase(firebaseConfig);

function RootLayoutContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize Firebase listeners and sync service
    syncService.start();

    return () => {
      syncService.stop();
    };
  }, [dispatch]);

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

  return <ThemedRootLayout />;
}

export default function RootLayout() {
  return (
    <ReduxProvider>
      <CurrencyProvider>
        <AppProvider>
          <RootLayoutContent />
        </AppProvider>
      </CurrencyProvider>
    </ReduxProvider>
  );
}
