import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { InputField } from '@/components/fitness/input-field';
import { PrimaryButton } from '@/components/fitness/primary-button';
import { FitnessColors } from '@/constants/fitness-theme';
import { findFoodByBarcode } from '@/data/food-catalog';

export default function BarcodePlaceholderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [code, setCode] = useState('');

  function lookup() {
    const hit = findFoodByBarcode(code);
    if (!hit) return;
    router.replace({
      pathname: '/food/add-meal',
      params: { foodId: hit.id, mealType: 'snack' },
    });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <FitnessCard>
        <Text style={styles.title}>Scanner placeholder</Text>
        <Text style={styles.body}>
          Wire `expo-camera` / `expo-barcode-scanner` here, then resolve products against Supabase `food_items`
          (see `types/database.ts`).
        </Text>
      </FitnessCard>

      <FitnessCard style={{ marginTop: 12 }}>
        <Text style={styles.label}>Manual barcode (demo)</Text>
        <InputField label="UPC / EAN" value={code} onChangeText={setCode} keyboardType="number-pad" />
        <PrimaryButton title="Lookup demo item" onPress={lookup} />
        <Text style={styles.hint}>Try: 0020000000011 or 748927019283</Text>
      </FitnessCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
    paddingHorizontal: FitnessColors.spacing.md,
  },
  title: {
    color: FitnessColors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  body: {
    marginTop: 8,
    color: FitnessColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  hint: {
    marginTop: 10,
    color: FitnessColors.textMuted,
    fontSize: 12,
  },
});
