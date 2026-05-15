import { Stack } from 'expo-router';
import React from 'react';

import { FitnessColors } from '@/constants/fitness-theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: FitnessColors.background },
        headerTintColor: FitnessColors.textPrimary,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: FitnessColors.background },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Sign in' }} />
      <Stack.Screen name="register" options={{ title: 'Create account' }} />
    </Stack>
  );
}
