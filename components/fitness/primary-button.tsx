import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { FitnessColors } from '@/constants/fitness-theme';

type Props = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  style?: PressableProps['style'];
};

export function PrimaryButton({
  title,
  variant = 'primary',
  loading,
  disabled,
  style: styleProp,
  ...rest
}: Props) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => {
        const pressed = state.pressed;
        const extra = typeof styleProp === 'function' ? styleProp(state) : styleProp;
        return [
          styles.base,
          isPrimary && styles.primary,
          variant === 'ghost' && styles.ghost,
          isDanger && styles.danger,
          (disabled || loading) && styles.disabled,
          pressed && styles.pressed,
          extra,
        ];
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? '#0B0B0C' : FitnessColors.textPrimary} />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary && styles.labelPrimary,
            variant === 'ghost' && styles.labelGhost,
            isDanger && styles.labelDanger,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: FitnessColors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  danger: {
    backgroundColor: FitnessColors.danger,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.92,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  labelPrimary: {
    color: '#0B0B0C',
  },
  labelGhost: {
    color: FitnessColors.textPrimary,
  },
  labelDanger: {
    color: '#FFFFFF',
  },
});
