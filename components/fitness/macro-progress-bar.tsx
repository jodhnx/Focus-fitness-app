import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';

type Props = {
  label: string;
  value: number;
  max: number;
  color: string;
  unit?: string;
  showValues?: boolean;
};

export function MacroProgressBar({
  label,
  value,
  max,
  color,
  unit = 'g',
  showValues = true,
}: Props) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        {showValues && (
          <Text style={styles.values}>
            {Math.round(value)}
            {unit} / {max}
            {unit}
          </Text>
        )}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: FitnessColors.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: FitnessColors.spacing.sm,
  },
  label: {
    color: FitnessColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  values: {
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: FitnessColors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
