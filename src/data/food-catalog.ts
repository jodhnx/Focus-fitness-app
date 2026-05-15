import type { FoodCatalogItem } from '@/types/domain';

export const foodCatalog: FoodCatalogItem[] = [
  { id: 'fc_1', name: 'Chicken breast', brand: 'Fresh', servingLabel: '150 g cooked', calories: 248, protein: 46, carbs: 0, fat: 5.4, barcode: '0020000000011' },
  { id: 'fc_2', name: 'Greek yogurt 0%', brand: 'Fage', servingLabel: '170 g', calories: 100, protein: 18, carbs: 6, fat: 0 },
  { id: 'fc_3', name: 'Large egg', brand: '—', servingLabel: '1 egg (50 g)', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, barcode: '0020000000028' },
  { id: 'fc_4', name: 'Oats dry', brand: 'Quaker', servingLabel: '40 g', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { id: 'fc_5', name: 'Banana', brand: '—', servingLabel: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: 'fc_6', name: 'Salmon fillet', brand: 'Atlantic', servingLabel: '150 g', calories: 280, protein: 39, carbs: 0, fat: 12 },
  { id: 'fc_7', name: 'Brown rice cooked', brand: '—', servingLabel: '150 g', calories: 168, protein: 3.5, carbs: 32, fat: 1.2 },
  { id: 'fc_8', name: 'Broccoli steamed', brand: '—', servingLabel: '150 g', calories: 52, protein: 4.3, carbs: 10, fat: 0.6 },
  { id: 'fc_9', name: 'Whey protein shake', brand: 'Optimum', servingLabel: '1 scoop + water', calories: 120, protein: 24, carbs: 3, fat: 1.5, barcode: '748927019283' },
  { id: 'fc_10', name: 'Whole wheat bread', brand: 'Dave\'s', servingLabel: '1 slice', calories: 110, protein: 5, carbs: 19, fat: 2 },
  { id: 'fc_11', name: 'Turkey deli slices', brand: 'Boar\'s Head', servingLabel: '6 slices (84 g)', calories: 90, protein: 18, carbs: 2, fat: 1 },
  { id: 'fc_12', name: 'Almonds', brand: 'Blue Diamond', servingLabel: '28 g', calories: 170, protein: 6, carbs: 6, fat: 15, barcode: '041570000012' },
  { id: 'fc_13', name: 'Apple', brand: '—', servingLabel: '1 medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: 'fc_14', name: 'Cottage cheese 2%', brand: 'Good Culture', servingLabel: '113 g', calories: 90, protein: 12, carbs: 5, fat: 2.5 },
  { id: 'fc_15', name: 'Sweet potato baked', brand: '—', servingLabel: '200 g', calories: 180, protein: 4, carbs: 41, fat: 0.2 },
  { id: 'fc_16', name: 'Lean ground beef 93%', brand: '—', servingLabel: '120 g cooked', calories: 170, protein: 22, carbs: 0, fat: 8 },
  { id: 'fc_17', name: 'Pasta cooked', brand: 'Barilla', servingLabel: '140 g', calories: 220, protein: 8, carbs: 43, fat: 1.3 },
  { id: 'fc_18', name: 'Avocado', brand: '—', servingLabel: '½ medium', calories: 120, protein: 1.5, carbs: 6, fat: 11 },
  { id: 'fc_19', name: 'Tuna canned in water', brand: 'StarKist', servingLabel: '1 can (120 g drained)', calories: 120, protein: 26, carbs: 0, fat: 1 },
  { id: 'fc_20', name: 'Blueberries', brand: '—', servingLabel: '150 g', calories: 86, protein: 1, carbs: 21, fat: 0.5 },
  { id: 'fc_21', name: 'Peanut butter', brand: 'Jif Natural', servingLabel: '32 g (2 tbsp)', calories: 190, protein: 8, carbs: 8, fat: 16 },
  { id: 'fc_22', name: 'Protein bar', brand: 'Quest', servingLabel: '1 bar (60 g)', calories: 200, protein: 20, carbs: 22, fat: 8, barcode: '888849000111' },
  { id: 'fc_23', name: 'Spinach raw', brand: '—', servingLabel: '85 g', calories: 20, protein: 2, carbs: 3, fat: 0.3 },
  { id: 'fc_24', name: 'White rice cooked', brand: '—', servingLabel: '150 g', calories: 205, protein: 4.3, carbs: 45, fat: 0.4 },
  { id: 'fc_25', name: 'Mozzarella part-skim', brand: 'Galbani', servingLabel: '28 g', calories: 70, protein: 7, carbs: 1, fat: 4.5 },
  { id: 'fc_26', name: 'Black beans cooked', brand: 'Goya', servingLabel: '130 g', calories: 120, protein: 8, carbs: 22, fat: 0.5 },
  { id: 'fc_27', name: 'Prosciutto', brand: 'Volpi', servingLabel: '56 g', calories: 140, protein: 12, carbs: 1, fat: 10 },
  { id: 'fc_28', name: 'Protein pancake mix', brand: 'Kodiak', servingLabel: '53 g dry', calories: 190, protein: 14, carbs: 30, fat: 2 },
  { id: 'fc_29', name: 'Carrots raw', brand: '—', servingLabel: '100 g', calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { id: 'fc_30', name: 'Extra virgin olive oil', brand: 'Bertolli', servingLabel: '1 tbsp', calories: 120, protein: 0, carbs: 0, fat: 14 },
];

export function findFoodByBarcode(code: string): FoodCatalogItem | undefined {
  const trimmed = code.trim();
  return foodCatalog.find((f) => f.barcode === trimmed);
}
