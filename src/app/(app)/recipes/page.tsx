import { recipes } from '@/data/recipes';

import { RecipesClient } from './recipes-client';

export default function RecipesPage() {
  return <RecipesClient recipes={recipes} />;
}
