import { DarkTheme, type Theme } from '@react-navigation/native';

/** Dark gym-style palette inspired by modern fitness apps */
export const FitnessColors = {
  background: '#0B0B0C',
  surface: '#121214',
  surfaceElevated: '#18181B',
  border: '#27272A',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  accent: '#34D399',
  accentMuted: 'rgba(52, 211, 153, 0.15)',
  protein: '#38BDF8',
  carbs: '#FBBF24',
  fat: '#C084FC',
  water: '#22D3EE',
  danger: '#F87171',
  chartGrid: '#27272A',
  tabBar: '#0F0F10',
  cardRadius: 16,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;

export const FitnessDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: FitnessColors.accent,
    background: FitnessColors.background,
    card: FitnessColors.surface,
    text: FitnessColors.textPrimary,
    border: FitnessColors.border,
    notification: FitnessColors.accent,
  },
};
