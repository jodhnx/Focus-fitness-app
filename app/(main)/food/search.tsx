import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import { foodCatalog } from '@/data/food-catalog';
import type { FoodCatalogItem, MealType } from '@/types/domain';

function normalizeMealType(value: unknown): MealType {
  const v = String(value);
  if (v === 'breakfast' || v === 'lunch' || v === 'dinner' || v === 'snack') return v;
  return 'snack';
}

export default function FoodSearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ mealType?: string }>();
  const mealType = normalizeMealType(params.mealType);
  const { favoriteFoodIds, toggleFavoriteFood, isFavorite } = useAppData();
  const [q, setQ] = useState('');

  const favorites = useMemo(() => {
    const set = new Set(favoriteFoodIds);
    return foodCatalog.filter((f) => set.has(f.id));
  }, [favoriteFoodIds]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return foodCatalog.filter((f) => {
      if (!query) return true;
      return (
        f.name.toLowerCase().includes(query) ||
        (f.brand?.toLowerCase().includes(query) ?? false) ||
        (f.barcode?.includes(query) ?? false)
      );
    });
  }, [q]);

  function openFood(item: FoodCatalogItem) {
    router.push({
      pathname: '/food/add-meal',
      params: { foodId: item.id, mealType },
    });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search foods, brands, barcodes..."
        placeholderTextColor={FitnessColors.textMuted}
        style={styles.search}
      />

      {favorites.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.heading}>Favorites</Text>
          {favorites.map((item) => (
            <FitnessCard key={item.id} style={styles.rowCard} padded>
              <View style={styles.row}>
                <Pressable style={{ flex: 1 }} onPress={() => openFood(item)}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {item.servingLabel} · {item.calories} kcal
                  </Text>
                </Pressable>
                <Pressable onPress={() => toggleFavoriteFood(item.id)} hitSlop={10}>
                  <Text style={styles.star}>{isFavorite(item.id) ? '★' : '☆'}</Text>
                </Pressable>
              </View>
            </FitnessCard>
          ))}
        </View>
      ) : null}

      <Text style={styles.heading}>Database</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        renderItem={({ item }) => (
          <FitnessCard style={styles.rowCard} padded>
            <View style={styles.row}>
              <Pressable style={{ flex: 1 }} onPress={() => openFood(item)}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.brand ? `${item.brand} · ` : ''}
                  {item.servingLabel}
                </Text>
                <Text style={styles.macros}>
                  {item.calories} kcal · P{item.protein} C{item.carbs} F{item.fat}
                </Text>
              </Pressable>
              <Pressable onPress={() => toggleFavoriteFood(item.id)} hitSlop={10}>
                <Text style={styles.star}>{isFavorite(item.id) ? '★' : '☆'}</Text>
              </Pressable>
            </View>
          </FitnessCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
    paddingHorizontal: FitnessColors.spacing.md,
  },
  search: {
    backgroundColor: FitnessColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  block: {
    marginBottom: 12,
  },
  heading: {
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  rowCard: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    marginTop: 4,
    color: FitnessColors.textMuted,
    fontSize: 13,
  },
  macros: {
    marginTop: 6,
    color: FitnessColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  star: {
    color: FitnessColors.accent,
    fontSize: 22,
    fontWeight: '900',
  },
});
