import { getNutritionData } from '@/lib/app-data';

import { NutritionClient } from './nutrition-client';

export default async function NutritionPage() {
  const data = await getNutritionData();
  return <NutritionClient data={data} />;
}
