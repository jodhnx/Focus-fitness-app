import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import { useAuth } from '@/contexts/auth-context';

void SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const { hydrated, profile } = useAppData();

  const bootstrapping = authLoading || !hydrated;

  useEffect(() => {
    if (bootstrapping) return;
    void SplashScreen.hideAsync();

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    if (!profile?.onboardingComplete) {
      router.replace('/(onboarding)/welcome');
      return;
    }
    router.replace('/(main)/(tabs)' as never);
  }, [bootstrapping, user, profile, router]);

  if (bootstrapping) {
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
    <View
      style={{
        flex: 1,
        backgroundColor: FitnessColors.background,
      }}
    />
  );
}
