import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InputField } from '@/components/fitness/input-field';
import { PrimaryButton } from '@/components/fitness/primary-button';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import type { Gender } from '@/types/domain';

const genders: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

export default function OnboardingBody() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAppData();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [weight, setWeight] = useState(String(profile?.weightKg ?? 78));
  const [height, setHeight] = useState(String(profile?.heightCm ?? 178));
  const [age, setAge] = useState(String(profile?.age ?? 28));
  const [gender, setGender] = useState<Gender>(profile?.gender ?? 'male');

  function next() {
    const w = Number(weight.replace(',', '.'));
    const h = Number(height.replace(',', '.'));
    const a = Number(age);
    if (!displayName.trim() || !Number.isFinite(w) || !Number.isFinite(h) || !Number.isFinite(a)) {
      return;
    }
    updateProfile({
      displayName: displayName.trim(),
      weightKg: w,
      heightCm: h,
      age: Math.round(a),
      gender,
    });
    router.push('/(onboarding)/goals');
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: FitnessColors.spacing.md }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sub}>Used for calorie and macro targets (Mifflin–St Jeor).</Text>

      <InputField label="Display name" value={displayName} onChangeText={setDisplayName} autoCapitalize="words" />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <InputField label="Weight (kg)" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <InputField label="Height (cm)" keyboardType="decimal-pad" value={height} onChangeText={setHeight} />
        </View>
      </View>

      <InputField label="Age" keyboardType="number-pad" value={age} onChangeText={setAge} />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.chips}>
        {genders.map((g) => {
          const active = gender === g.id;
          return (
            <Pressable
              key={g.id}
              onPress={() => setGender(g.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{g.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton title="Continue" onPress={next} style={{ marginTop: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
  },
  sub: {
    marginTop: 8,
    marginBottom: 16,
    color: FitnessColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    color: FitnessColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    backgroundColor: FitnessColors.surface,
  },
  chipActive: {
    borderColor: FitnessColors.accent,
    backgroundColor: FitnessColors.accentMuted,
  },
  chipText: {
    color: FitnessColors.textSecondary,
    fontWeight: '700',
  },
  chipTextActive: {
    color: FitnessColors.accent,
  },
});
