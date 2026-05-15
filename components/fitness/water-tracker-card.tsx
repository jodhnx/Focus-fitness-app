import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';

type Props = {
  glasses: number;
  goal: number;
  onAdd: () => void;
  onRemove: () => void;
};

export function WaterTrackerCard({ glasses, goal, onAdd, onRemove }: Props) {
  const pct = goal > 0 ? Math.min(1, glasses / goal) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View>
          <Text style={styles.title}>Water</Text>
          <Text style={styles.sub}>
            {glasses} / {goal} glasses
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={onRemove} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
            <Text style={styles.btnText}>−</Text>
          </Pressable>
          <Pressable onPress={onAdd} style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}>
            <Text style={[styles.btnText, styles.btnTextPrimary]}>+</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: FitnessColors.water }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FitnessColors.surface,
    borderRadius: FitnessColors.cardRadius,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    padding: FitnessColors.spacing.md,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: FitnessColors.spacing.md,
  },
  title: {
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    marginTop: 2,
    color: FitnessColors.textMuted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: FitnessColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  btnPrimary: {
    backgroundColor: FitnessColors.accentMuted,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
  btnText: {
    color: FitnessColors.textPrimary,
    fontSize: 22,
    fontWeight: '600',
  },
  btnTextPrimary: {
    color: FitnessColors.accent,
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: FitnessColors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});
