import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { ScreenScroll } from '@/components/fitness/screen-scroll';
import { SectionHeader } from '@/components/fitness/section-header';
import { FitnessColors } from '@/constants/fitness-theme';
import { recentWorkouts, todaysWorkouts, trainingPlans } from '@/data/workouts';

export default function TrainScreen() {
  const router = useRouter();

  return (
    <ScreenScroll title="Train" subtitle="Workouts & programs">
      <SectionHeader title="Today" actionLabel="History" onActionPress={() => router.push('/workout/history')} />
      {todaysWorkouts.map((w) => (
        <FitnessCard key={w.id} style={styles.block}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.badge}>{w.focus}</Text>
              <Text style={styles.title}>{w.name}</Text>
              <Text style={styles.meta}>
                {w.durationMin} min · {w.exercises.length} exercises
              </Text>
            </View>
            <Pressable onPress={() => router.push({ pathname: '/workout/active', params: { templateId: w.id } })} style={styles.goBtn}>
              <Text style={styles.goText}>Start</Text>
            </Pressable>
          </View>
          <View style={styles.divider} />
          {w.exercises.map((ex, i) => (
            <View key={`${w.id}-${i}`} style={styles.exRow}>
              <Text style={styles.exName}>{ex.name}</Text>
              <Text style={styles.exSets}>{ex.sets}</Text>
            </View>
          ))}
        </FitnessCard>
      ))}

      <SectionHeader title="Training plans" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.plansScroll}>
        {trainingPlans.map((p) => (
          <FitnessCard key={p.id} style={styles.planCard} padded>
            <Text style={styles.planTitle}>{p.title}</Text>
            <Text style={styles.planMeta}>
              {p.weeks} wk · {p.daysPerWeek}x / week
            </Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalText}>{p.goal}</Text>
            </View>
            <Text style={styles.planDesc}>{p.description}</Text>
          </FitnessCard>
        ))}
      </ScrollView>

      <SectionHeader title="Templates" />
      {recentWorkouts.map((w) => (
        <FitnessCard key={w.id} style={styles.compact}>
          <View style={styles.compactRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.compactTitle}>{w.name}</Text>
              <Text style={styles.compactMeta}>
                {w.durationMin} min · {w.focus}
              </Text>
            </View>
            <Pressable onPress={() => router.push({ pathname: '/workout/active', params: { templateId: w.id } })}>
              <Text style={styles.link}>Log</Text>
            </Pressable>
          </View>
        </FitnessCard>
      ))}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: FitnessColors.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    color: FitnessColors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    color: FitnessColors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  meta: {
    marginTop: 6,
    color: FitnessColors.textMuted,
    fontSize: 13,
  },
  goBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: FitnessColors.accentMuted,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  goText: {
    color: FitnessColors.accent,
    fontSize: 13,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: FitnessColors.border,
    marginVertical: FitnessColors.spacing.md,
  },
  exRow: {
    marginBottom: 10,
  },
  exName: {
    color: FitnessColors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  exSets: {
    marginTop: 2,
    color: FitnessColors.textMuted,
    fontSize: 13,
  },
  plansScroll: {
    paddingRight: FitnessColors.spacing.md,
    gap: 12,
  },
  planCard: {
    width: 260,
    marginRight: 0,
  },
  planTitle: {
    color: FitnessColors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  planMeta: {
    marginTop: 6,
    color: FitnessColors.textMuted,
    fontSize: 13,
  },
  goalPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: FitnessColors.surfaceElevated,
  },
  goalText: {
    color: FitnessColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  planDesc: {
    marginTop: 10,
    color: FitnessColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  compact: {
    marginBottom: FitnessColors.spacing.sm,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactTitle: {
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  compactMeta: {
    marginTop: 4,
    color: FitnessColors.textMuted,
    fontSize: 13,
  },
  link: {
    color: FitnessColors.accent,
    fontWeight: '900',
  },
});
