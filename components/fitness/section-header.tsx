import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';

type Props = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Text onPress={onActionPress} style={styles.action}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: FitnessColors.spacing.sm,
    marginTop: FitnessColors.spacing.lg,
  },
  title: {
    color: FitnessColors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  action: {
    color: FitnessColors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
