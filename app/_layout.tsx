import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { FitnessDarkTheme } from '@/constants/fitness-theme';
import { AppDataProvider } from '@/contexts/app-data-context';
import { AuthProvider } from '@/contexts/auth-context';

export const unstable_settings = {
  anchor: '(main)/(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <ThemeProvider value={FitnessDarkTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(main)" />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AppDataProvider>
    </AuthProvider>
  );
}
