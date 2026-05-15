import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';

type Point = { label: string; value: number };

type Props = {
  data: Point[];
  color?: string;
  height?: number;
};

export function SimpleBarChart({ data, color = FitnessColors.accent, height = 140 }: Props) {
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const labelSpace = 22;
  const barMax = Math.max(40, height - labelSpace);

  return (
    <View style={[styles.chart, { height }]}>
      {data.map((d) => {
        const norm = (d.value - min) / span;
        const h = Math.max(8, (norm * 0.72 + 0.28) * barMax);
        return (
          <View key={d.label} style={styles.col}>
            <View style={[styles.barArea, { height: barMax }]}>
              <View style={[styles.bar, { height: h, backgroundColor: color }]} />
            </View>
            <Text style={styles.label}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: FitnessColors.spacing.sm,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barArea: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 6,
  },
  bar: {
    width: '100%',
    maxWidth: 36,
    borderRadius: 6,
  },
  label: {
    color: FitnessColors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
