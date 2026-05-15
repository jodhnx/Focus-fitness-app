import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';
import { useAuth } from '@/contexts/auth-context';

const headerScreen = {
  headerShown: true as const,
  headerStyle: { backgroundColor: FitnessColors.background },
  headerTintColor: FitnessColors.textPrimary,
  headerTitleStyle: { fontWeight: '800' as const },
  contentStyle: { backgroundColor: FitnessColors.background },
};

export default function MainLayout() {
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
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="food/search" options={{ ...headerScreen, title: 'Food search' }} />
      <Stack.Screen name="food/add-meal" options={{ ...headerScreen, title: 'Add meal' }} />
      <Stack.Screen name="food/barcode" options={{ ...headerScreen, title: 'Barcode scan' }} />
      <Stack.Screen name="workout/active" options={{ ...headerScreen, title: 'Log workout' }} />
      <Stack.Screen name="workout/history" options={{ ...headerScreen, title: 'Workout history' }} />
      <Stack.Screen name="profile" options={{ ...headerScreen, title: 'Profile' }} />
    </Stack>
  );
}
