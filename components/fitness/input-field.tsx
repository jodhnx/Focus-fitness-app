import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';

type Props = TextInputProps & {
  label: string;
};

export function InputField({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={FitnessColors.textMuted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: FitnessColors.spacing.md,
  },
  label: {
    color: FitnessColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: FitnessColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
