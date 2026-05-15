import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/contexts/auth-context';
import { toDateKey } from '@/lib/date';
import { calculateMacroTargets } from '@/lib/nutrition/calculateTargets';
import type {
  FoodServingLog,
  MacroTargets,
  UserProfile,
  WeightEntry,
  WorkoutSession,
} from '@/types/domain';

const STORAGE_KEY = 'fitness_app_v2_bundle';

type PersistedBundle = {
  profilesByUserId: Record<string, UserProfile>;
  foodLogsByUserId: Record<string, Record<string, FoodServingLog[]>>;
  favoriteFoodIdsByUserId: Record<string, string[]>;
  workoutSessionsByUserId: Record<string, WorkoutSession[]>;
  weightLogByUserId: Record<string, WeightEntry[]>;
  waterByUserId: Record<string, number>;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function defaultProfileFromEmail(email: string): UserProfile {
  const base = email.split('@')[0] ?? 'Athlete';
  return {
    displayName: base.charAt(0).toUpperCase() + base.slice(1),
    weightKg: 78,
    heightCm: 178,
    age: 28,
    gender: 'male',
    goal: 'maintain',
    activityLevel: 'moderate',
    onboardingComplete: false,
    dailyTargets: null,
  };
}

const emptyBundle = (): PersistedBundle => ({
  profilesByUserId: {},
  foodLogsByUserId: {},
  favoriteFoodIdsByUserId: {},
  workoutSessionsByUserId: {},
  weightLogByUserId: {},
  waterByUserId: {},
});

type LegacySession = { userId: string; email: string } | null;

function migrateLegacyBundle(raw: unknown): PersistedBundle {
  const base = emptyBundle();
  if (!raw || typeof raw !== 'object') return base;
  const p = raw as Record<string, unknown>;

  const legacySession = p.session as LegacySession;
  const legacyUserId = legacySession?.userId;

  let profilesByUserId = (p.profilesByUserId as PersistedBundle['profilesByUserId']) ?? {};
  const legacyProfile = p.profile as UserProfile | null | undefined;
  if (legacyProfile && legacyUserId && !profilesByUserId[legacyUserId]) {
    profilesByUserId = { ...profilesByUserId, [legacyUserId]: legacyProfile };
  }

  let foodLogsByUserId = (p.foodLogsByUserId as PersistedBundle['foodLogsByUserId']) ?? {};
  const legacyFoodLogs = p.foodLogsByDate as Record<string, FoodServingLog[]> | undefined;
  if (legacyFoodLogs && legacyUserId && !foodLogsByUserId[legacyUserId]) {
    foodLogsByUserId = { ...foodLogsByUserId, [legacyUserId]: legacyFoodLogs };
  }

  let favoriteFoodIdsByUserId =
    (p.favoriteFoodIdsByUserId as PersistedBundle['favoriteFoodIdsByUserId']) ?? {};
  const legacyFav = p.favoriteFoodIds as string[] | undefined;
  if (legacyFav && legacyUserId && !favoriteFoodIdsByUserId[legacyUserId]) {
    favoriteFoodIdsByUserId = { ...favoriteFoodIdsByUserId, [legacyUserId]: legacyFav };
  }

  let workoutSessionsByUserId =
    (p.workoutSessionsByUserId as PersistedBundle['workoutSessionsByUserId']) ?? {};
  const legacyWorkouts = p.workoutSessions as WorkoutSession[] | undefined;
  if (legacyWorkouts?.length && legacyUserId && !workoutSessionsByUserId[legacyUserId]) {
    workoutSessionsByUserId = { ...workoutSessionsByUserId, [legacyUserId]: legacyWorkouts };
  }

  let weightLogByUserId = (p.weightLogByUserId as PersistedBundle['weightLogByUserId']) ?? {};
  const legacyWeight = p.weightLog as WeightEntry[] | undefined;
  if (legacyWeight?.length && legacyUserId && !weightLogByUserId[legacyUserId]) {
    weightLogByUserId = { ...weightLogByUserId, [legacyUserId]: legacyWeight };
  }

  let waterByUserId = (p.waterByUserId as PersistedBundle['waterByUserId']) ?? {};
  const legacyWater = typeof p.waterGlasses === 'number' ? p.waterGlasses : undefined;
  if (legacyWater !== undefined && legacyUserId && waterByUserId[legacyUserId] === undefined) {
    waterByUserId = { ...waterByUserId, [legacyUserId]: legacyWater };
  }

  return {
    ...base,
    profilesByUserId,
    foodLogsByUserId,
    favoriteFoodIdsByUserId,
    workoutSessionsByUserId,
    weightLogByUserId,
    waterByUserId,
  };
}

async function loadBundle(): Promise<PersistedBundle> {
  try {
    const rawV2 = await AsyncStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      return migrateLegacyBundle(JSON.parse(rawV2));
    }
    const rawV1 = await AsyncStorage.getItem('fitness_app_v1_bundle');
    if (rawV1) {
      const migrated = migrateLegacyBundle(JSON.parse(rawV1));
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return emptyBundle();
}

type AppDataContextValue = {
  /** Local profile/food/workout storage finished loading */
  hydrated: boolean;
  profile: UserProfile | null;
  dailyTargets: MacroTargets | null;
  favoriteFoodIds: string[];
  foodLogsByDate: Record<string, FoodServingLog[]>;
  workoutSessions: WorkoutSession[];
  weightLog: WeightEntry[];
  waterGlasses: number;
  waterGoal: number;
  updateProfile: (patch: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  addFoodLog: (input: Omit<FoodServingLog, 'id' | 'loggedAt'> & { loggedAt?: string }) => void;
  removeFoodLog: (dateKey: string, logId: string) => void;
  toggleFavoriteFood: (foodId: string) => void;
  isFavorite: (foodId: string) => boolean;
  addWeightEntry: (kg: number, date?: string) => void;
  addWorkoutSession: (session: WorkoutSession) => void;
  addWater: () => void;
  removeWater: () => void;
  totalsForDay: (dateKey: string) => MacroTargets;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

const WATER_GOAL = 10;

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [bundle, setBundle] = useState<PersistedBundle>(emptyBundle);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userIdRef = useRef<string | null>(null);
  const userEmailRef = useRef<string | null>(null);

  useEffect(() => {
    userIdRef.current = user?.id ?? null;
    userEmailRef.current = user?.email ?? null;
  }, [user?.id, user?.email]);

  const persist = useCallback((next: PersistedBundle) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }, 250);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await loadBundle();
      if (!cancelled) {
        setBundle(loaded);
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setAndPersist = useCallback(
    (updater: (prev: PersistedBundle) => PersistedBundle) => {
      setBundle((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  /** Seed local rows for a brand-new Supabase user */
  useEffect(() => {
    if (!hydrated || !user?.id) return;
    const userId = user.id;
    const email = user.email ?? 'user';
    setAndPersist((prev) => {
      if (prev.profilesByUserId[userId]) return prev;
      return {
        ...prev,
        profilesByUserId: {
          ...prev.profilesByUserId,
          [userId]: defaultProfileFromEmail(email),
        },
        foodLogsByUserId: { ...prev.foodLogsByUserId, [userId]: prev.foodLogsByUserId[userId] ?? {} },
        favoriteFoodIdsByUserId: {
          ...prev.favoriteFoodIdsByUserId,
          [userId]: prev.favoriteFoodIdsByUserId[userId] ?? [],
        },
        workoutSessionsByUserId: {
          ...prev.workoutSessionsByUserId,
          [userId]: prev.workoutSessionsByUserId[userId] ?? [],
        },
        weightLogByUserId: {
          ...prev.weightLogByUserId,
          [userId]: prev.weightLogByUserId[userId] ?? [],
        },
        waterByUserId: {
          ...prev.waterByUserId,
          [userId]: prev.waterByUserId[userId] ?? 0,
        },
      };
    });
  }, [hydrated, user?.id, user?.email, setAndPersist]);

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setAndPersist((prev) => {
        const uid = userIdRef.current;
        if (!uid) return prev;
        const current =
          prev.profilesByUserId[uid] ?? defaultProfileFromEmail(userEmailRef.current ?? 'user');
        return {
          ...prev,
          profilesByUserId: {
            ...prev.profilesByUserId,
            [uid]: { ...current, ...patch },
          },
        };
      });
    },
    [setAndPersist]
  );

  const completeOnboarding = useCallback(() => {
    setAndPersist((prev) => {
      const uid = userIdRef.current;
      if (!uid) return prev;
      const current = prev.profilesByUserId[uid];
      if (!current) return prev;
      const dailyTargets = calculateMacroTargets(current);
      return {
        ...prev,
        profilesByUserId: {
          ...prev.profilesByUserId,
          [uid]: {
            ...current,
            onboardingComplete: true,
            dailyTargets,
          },
        },
      };
    });
  }, [setAndPersist]);

  const addFoodLog = useCallback(
    (input: Omit<FoodServingLog, 'id' | 'loggedAt'> & { loggedAt?: string }) => {
      const day = toDateKey();
      const entry: FoodServingLog = {
        ...input,
        id: createId('food'),
        loggedAt: input.loggedAt ?? new Date().toISOString(),
      };
      setAndPersist((prev) => {
        const uid = userIdRef.current;
        if (!uid) return prev;
        const userLogs = prev.foodLogsByUserId[uid] ?? {};
        const list = userLogs[day] ?? [];
        return {
          ...prev,
          foodLogsByUserId: {
            ...prev.foodLogsByUserId,
            [uid]: {
              ...userLogs,
              [day]: [...list, entry],
            },
          },
        };
      });
    },
    [setAndPersist]
  );

  const removeFoodLog = useCallback(
    (dateKey: string, logId: string) => {
      setAndPersist((prev) => {
        const uid = userIdRef.current;
        if (!uid) return prev;
        const userLogs = prev.foodLogsByUserId[uid] ?? {};
        const list = userLogs[dateKey] ?? [];
        return {
          ...prev,
          foodLogsByUserId: {
            ...prev.foodLogsByUserId,
            [uid]: {
              ...userLogs,
              [dateKey]: list.filter((x) => x.id !== logId),
            },
          },
        };
      });
    },
    [setAndPersist]
  );

  const toggleFavoriteFood = useCallback(
    (foodId: string) => {
      setAndPersist((prev) => {
        const uid = userIdRef.current;
        if (!uid) return prev;
        const current = prev.favoriteFoodIdsByUserId[uid] ?? [];
        const set = new Set(current);
        if (set.has(foodId)) set.delete(foodId);
        else set.add(foodId);
        return {
          ...prev,
          favoriteFoodIdsByUserId: {
            ...prev.favoriteFoodIdsByUserId,
            [uid]: Array.from(set),
          },
        };
      });
    },
    [setAndPersist]
  );

  const addWeightEntry = useCallback(
    (kg: number, date?: string) => {
      const d = date ?? toDateKey();
      const entry: WeightEntry = { id: createId('wt'), date: d, kg };
      setAndPersist((prev) => {
        const uid = userIdRef.current;
        if (!uid) return prev;
        const list = prev.weightLogByUserId[uid] ?? [];
        const nextList = [...list, entry].sort((a, b) => a.date.localeCompare(b.date));
        return {
          ...prev,
          weightLogByUserId: {
            ...prev.weightLogByUserId,
            [uid]: nextList,
          },
        };
      });
    },
    [setAndPersist]
  );

  const addWorkoutSession = useCallback(
    (session: WorkoutSession) => {
      setAndPersist((prev) => {
        const uid = userIdRef.current;
        if (!uid) return prev;
        const list = prev.workoutSessionsByUserId[uid] ?? [];
        return {
          ...prev,
          workoutSessionsByUserId: {
            ...prev.workoutSessionsByUserId,
            [uid]: [session, ...list],
          },
        };
      });
    },
    [setAndPersist]
  );

  const addWater = useCallback(() => {
    setAndPersist((prev) => {
      const uid = userIdRef.current;
      if (!uid) return prev;
      const g = prev.waterByUserId[uid] ?? 0;
      return {
        ...prev,
        waterByUserId: {
          ...prev.waterByUserId,
          [uid]: Math.min(WATER_GOAL + 6, g + 1),
        },
      };
    });
  }, [setAndPersist]);

  const removeWater = useCallback(() => {
    setAndPersist((prev) => {
      const uid = userIdRef.current;
      if (!uid) return prev;
      const g = prev.waterByUserId[uid] ?? 0;
      return {
        ...prev,
        waterByUserId: {
          ...prev.waterByUserId,
          [uid]: Math.max(0, g - 1),
        },
      };
    });
  }, [setAndPersist]);

  const derived = useMemo(() => {
    const uid = user?.id ?? null;
    const email = user?.email ?? 'user';
    const profile =
      uid && bundle.profilesByUserId[uid]
        ? bundle.profilesByUserId[uid]
        : uid
          ? defaultProfileFromEmail(email)
          : null;
    const foodLogsByDate = uid ? bundle.foodLogsByUserId[uid] ?? {} : {};
    const favoriteFoodIds = uid ? bundle.favoriteFoodIdsByUserId[uid] ?? [] : [];
    const workoutSessions = uid ? bundle.workoutSessionsByUserId[uid] ?? [] : [];
    const weightLog = uid ? bundle.weightLogByUserId[uid] ?? [] : [];
    const waterGlasses = uid ? bundle.waterByUserId[uid] ?? 0 : 0;
    return {
      profile,
      foodLogsByDate,
      favoriteFoodIds,
      workoutSessions,
      weightLog,
      waterGlasses,
      dailyTargets: profile?.dailyTargets ?? null,
    };
  }, [bundle, user?.id, user?.email]);

  const totalsForDay = useCallback(
    (dateKey: string): MacroTargets => {
      const logs = derived.foodLogsByDate[dateKey] ?? [];
      return logs.reduce(
        (acc, l) => ({
          calories: acc.calories + l.calories,
          protein: acc.protein + l.protein,
          carbs: acc.carbs + l.carbs,
          fat: acc.fat + l.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
    },
    [derived.foodLogsByDate]
  );

  const isFavorite = useCallback(
    (foodId: string) => derived.favoriteFoodIds.includes(foodId),
    [derived.favoriteFoodIds]
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      hydrated,
      profile: derived.profile,
      dailyTargets: derived.dailyTargets,
      favoriteFoodIds: derived.favoriteFoodIds,
      foodLogsByDate: derived.foodLogsByDate,
      workoutSessions: derived.workoutSessions,
      weightLog: derived.weightLog,
      waterGlasses: derived.waterGlasses,
      waterGoal: WATER_GOAL,
      updateProfile,
      completeOnboarding,
      addFoodLog,
      removeFoodLog,
      toggleFavoriteFood,
      isFavorite,
      addWeightEntry,
      addWorkoutSession,
      addWater,
      removeWater,
      totalsForDay,
    }),
    [
      hydrated,
      derived,
      updateProfile,
      completeOnboarding,
      addFoodLog,
      removeFoodLog,
      toggleFavoriteFood,
      isFavorite,
      addWeightEntry,
      addWorkoutSession,
      addWater,
      removeWater,
      totalsForDay,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
