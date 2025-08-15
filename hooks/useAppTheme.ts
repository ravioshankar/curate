import { useSelector } from 'react-redux';
import { useColorScheme } from 'react-native';
import { RootState } from '@/src/store/store';

export function useAppTheme() {
  const { theme } = useSelector((state: RootState) => state.user.settings);
  const systemTheme = useColorScheme();
  
  if (theme === 'auto') {
    return systemTheme ?? 'light';
  }
  
  return theme;
}