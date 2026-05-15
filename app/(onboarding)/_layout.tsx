import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';
import { useAuth } from '@/contexts/auth-context';

export default function OnboardingLayout() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: FitnessColors.background,
        }}
      >
        <ActivityIndicator color={FitnessColors.accent} size="large" />
      </View>
    );
  }

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
      <Stack.Screen name="welcome" options={{ title: 'Welcome' }} />
      <Stack.Screen name="body" options={{ title: 'About you' }} />
      <Stack.Screen name="goals" options={{ title: 'Goals' }} />
      <Stack.Screen name="review" options={{ title: 'Your plan' }} />
    </Stack>
  );
}
