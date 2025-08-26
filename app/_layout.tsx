import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { ReduxProvider } from '@/src/components/providers/ReduxProvider';
import { AppProvider } from '@/src/components/providers/AppProvider';
import { CurrencyProvider } from '@/src/components/providers/SimpleCurrencyProvider';
import { ThemedRootLayout } from '@/src/components/layout/ThemedRootLayout';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
