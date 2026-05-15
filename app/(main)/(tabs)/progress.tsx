import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { InputField } from '@/components/fitness/input-field';
import { PrimaryButton } from '@/components/fitness/primary-button';
import { ScreenScroll } from '@/components/fitness/screen-scroll';
import { SectionHeader } from '@/components/fitness/section-header';
import { SimpleBarChart } from '@/components/fitness/simple-bar-chart';
import { StatTile } from '@/components/fitness/stat-tile';
import { WaterTrackerCard } from '@/components/fitness/water-tracker-card';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import { lastNDates } from '@/lib/date';

export default function ProgressScreen() {
  const {
    waterGlasses,
    waterGoal,
    addWater,
    removeWater,
    weightLog,
    addWeightEntry,
    workoutSessions,
    totalsForDay,
  } = useAppData();
  const [weightInput, setWeightInput] = useState('');

  const days = useMemo(() => lastNDates(7), []);
  const calorieSeries = useMemo(
    () =>
      days.map((d) => ({
        label: d.slice(8),
        value: totalsForDay(d).calories,
      })),
    [days, totalsForDay]
  );

  const weightSeries = useMemo(() => {
    const slice = weightLog.slice(-7);
    if (slice.length === 0) {
      return [
        { label: '—', value: 0 },
        { label: '—', value: 0 },
      ];
    }
    return slice.map((w) => ({
      label: w.date.slice(5),
      value: w.kg,
    }));
  }, [weightLog]);

  const trainingMinutes = useMemo(() => {
    return workoutSessions.reduce((acc, s) => {
      const start = new Date(s.startedAt).getTime();
      const end = s.completedAt ? new Date(s.completedAt).getTime() : start;
      return acc + Math.max(0, Math.round((end - start) / 60000));
    }, 0);
  }, [workoutSessions]);

  function logWeight() {
    const v = Number(weightInput.replace(',', '.'));
    if (!Number.isFinite(v) || v <= 0) return;
    addWeightEntry(v);
    setWeightInput('');
  }

  return (
    <ScreenScroll title="Progress" subtitle="Weight, fuel, and training load">
      <View style={{ marginTop: FitnessColors.spacing.sm }}>
        <WaterTrackerCard glasses={waterGlasses} goal={waterGoal} onAdd={addWater} onRemove={removeWater} />
      </View>

      <SectionHeader title="Weight" />
      <FitnessCard>
        <View style={styles.weightHeader}>
          <Text style={styles.weightCurrent}>
            {weightLog.length ? `${weightLog[weightLog.length - 1]?.kg} kg` : 'No entries'}
          </Text>
          <Text style={styles.weightDelta}>Log a weigh-in to chart progress</Text>
        </View>
        <SimpleBarChart data={weightSeries} color={FitnessColors.protein} height={120} />
        <InputField label="Add weight (kg)" keyboardType="decimal-pad" value={weightInput} onChangeText={setWeightInput} />
        <PrimaryButton title="Save entry" onPress={logWeight} />
      </FitnessCard>

      <SectionHeader title="Calories (7 days)" />
      <FitnessCard>
        <SimpleBarChart data={calorieSeries} color={FitnessColors.accent} height={110} />
        <Text style={styles.caption}>Daily calories logged from your food diary</Text>
      </FitnessCard>

      <SectionHeader title="Statistics" />
      <View style={styles.grid}>
        <StatTile label="Workouts" value={workoutSessions.length} hint="all time" />
        <StatTile label="Est. time" value={`${trainingMinutes}m`} hint="logged duration" />
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: FitnessColors.spacing.sm,
  },
  weightCurrent: {
    color: FitnessColors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  weightDelta: {
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  caption: {
    marginTop: FitnessColors.spacing.sm,
    color: FitnessColors.textMuted,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
