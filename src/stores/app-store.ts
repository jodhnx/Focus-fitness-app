import { create } from 'zustand';

type Toast = { id: string; title: string; body?: string; tone?: 'success' | 'error' | 'info' };

type ActiveWorkoutSet = { reps: string; weight: string; done: boolean };
type ActiveWorkoutExercise = { name: string; muscleGroup?: string; sets: ActiveWorkoutSet[] };

type AppStore = {
  toasts: Toast[];
  activeWorkoutName: string;
  activeWorkoutExercises: ActiveWorkoutExercise[];
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  setActiveWorkout: (name: string, exercises: ActiveWorkoutExercise[]) => void;
  clearActiveWorkout: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  toasts: [],
  activeWorkoutName: '',
  activeWorkoutExercises: [],
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }].slice(-4),
    })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  setActiveWorkout: (name, exercises) => set({ activeWorkoutName: name, activeWorkoutExercises: exercises }),
  clearActiveWorkout: () => set({ activeWorkoutName: '', activeWorkoutExercises: [] }),
}));
