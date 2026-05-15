import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';

type Props = ViewProps & {
  children: React.ReactNode;
  padded?: boolean;
};

export function FitnessCard({ children, style, padded = true, ...rest }: Props) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FitnessColors.surface,
    borderRadius: FitnessColors.cardRadius,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  padded: {
    padding: FitnessColors.spacing.md,
  },
});
