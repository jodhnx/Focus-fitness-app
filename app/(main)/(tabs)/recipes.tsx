import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { ScreenScroll } from '@/components/fitness/screen-scroll';
import { SectionHeader } from '@/components/fitness/section-header';
import { FitnessColors } from '@/constants/fitness-theme';
import { recipes } from '@/data/recipes';
import type { RecipeCategory } from '@/types/domain';

const FILTERS: { id: RecipeCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
  { id: 'meal-prep', label: 'Meal prep' },
  { id: 'high-protein', label: 'High protein' },
];

export default function RecipesScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      const okCat = filter === 'all' || r.category === filter;
      const okText =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      return okCat && okText;
    });
  }, [query, filter]);

  return (
    <ScreenScroll title="Recipes" subtitle="Search & filter healthy meals">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search recipes..."
        placeholderTextColor={FitnessColors.textMuted}
        style={styles.search}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <Pressable key={f.id} onPress={() => setFilter(f.id)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionHeader title="Results" />
      {filtered.map((r) => (
        <FitnessCard key={r.id} style={styles.card}>
          <View style={styles.top}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{r.title}</Text>
              <Text style={styles.desc}>{r.description}</Text>
            </View>
            <View style={styles.calBox}>
              <Text style={styles.calNum}>{r.calories}</Text>
              <Text style={styles.calLbl}>kcal</Text>
            </View>
          </View>
          <View style={styles.tags}>
            {r.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
            <Text style={styles.prep}>{r.prepMin} min</Text>
          </View>
          <View style={styles.macros}>
            <Text style={[styles.m, { color: FitnessColors.protein }]}>P {r.protein}g</Text>
            <Text style={[styles.m, { color: FitnessColors.carbs }]}>C {r.carbs}g</Text>
            <Text style={[styles.m, { color: FitnessColors.fat }]}>F {r.fat}g</Text>
          </View>
        </FitnessCard>
      ))}
      {filtered.length === 0 ? <Text style={styles.none}>No recipes match your filters.</Text> : null}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  search: {
    marginTop: FitnessColors.spacing.sm,
    backgroundColor: FitnessColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  chips: {
    gap: 8,
    paddingVertical: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    backgroundColor: FitnessColors.surface,
  },
  chipActive: {
    borderColor: FitnessColors.accent,
    backgroundColor: FitnessColors.accentMuted,
  },
  chipText: {
    color: FitnessColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: FitnessColors.accent,
  },
  card: {
    marginBottom: FitnessColors.spacing.md,
  },
  top: {
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    color: FitnessColors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  desc: {
    marginTop: 8,
    color: FitnessColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  calBox: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  calNum: {
    color: FitnessColors.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  calLbl: {
    color: FitnessColors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: FitnessColors.spacing.md,
  },
  tag: {
    backgroundColor: FitnessColors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  tagText: {
    color: FitnessColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  prep: {
    marginLeft: 'auto',
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  macros: {
    flexDirection: 'row',
    gap: 16,
    marginTop: FitnessColors.spacing.md,
  },
  m: {
    fontSize: 13,
    fontWeight: '700',
  },
  none: {
    color: FitnessColors.textMuted,
    fontSize: 14,
    marginBottom: 24,
  },
});
