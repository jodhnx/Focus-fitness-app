import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FitnessColors } from '@/constants/fitness-theme';

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Extra bottom padding for tab bar */
  contentBottomInset?: number;
};

export function ScreenScroll({ title, subtitle, children, contentBottomInset = 100 }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + FitnessColors.spacing.sm }]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomInset + insets.bottom },
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
  },
  header: {
    paddingHorizontal: FitnessColors.spacing.md,
    marginBottom: FitnessColors.spacing.md,
  },
  title: {
    color: FitnessColors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 4,
    color: FitnessColors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: FitnessColors.spacing.md,
  },
});
