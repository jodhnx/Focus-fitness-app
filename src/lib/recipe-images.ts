/** Curated Unsplash food images (stable URLs, no API key). */
const RECIPE_IMAGES: Record<string, string> = {
  breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a28266?w=800&q=80',
  oats: 'https://images.unsplash.com/photo-1517673400267-025144b0d1e4?w=800&q=80',
  salad: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  salmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
  chicken: 'https://images.unsplash.com/photo-1604908176997-43162f4d988e?w=800&q=80',
  smoothie: 'https://images.unsplash.com/photo-1505252585467-87387214ad6b?w=800&q=80',
  eggs: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
  steak: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  bowl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
  snack: 'https://images.unsplash.com/photo-1490474568700-7a896b6c9472?w=800&q=80',
  prep: 'https://images.unsplash.com/photo-1498837167922-ddd27525cd40?w=800&q=80',
  bulk: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
  lowcal: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  curry: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  wrap: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
  chili: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  toast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
  sushi: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
  soup: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&q=80',
  grain: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
};

export function recipeImageFor(key: string): string {
  return RECIPE_IMAGES[key] ?? RECIPE_IMAGES.bowl;
}
