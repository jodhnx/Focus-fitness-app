import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';

type Props = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatTile({ label, value, hint }: Props) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: FitnessColors.surfaceElevated,
    borderRadius: FitnessColors.cardRadius,
    padding: FitnessColors.spacing.md,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  label: {
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    marginTop: 8,
    color: FitnessColors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  hint: {
    marginTop: 4,
    color: FitnessColors.textSecondary,
    fontSize: 12,
  },
});
