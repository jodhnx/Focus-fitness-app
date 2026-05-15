import type { FoodCatalogItem } from '@/types/domain';

const BASE = 'https://world.openfoodfacts.org';

type OffNutriments = {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;
};

type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: OffNutriments;
  countries_tags?: string[];
};

function mapProduct(p: OffProduct): FoodCatalogItem | null {
  const name = p.product_name?.trim();
  if (!name) return null;
  const n = p.nutriments ?? {};
  const calories = Math.round(n['energy-kcal_100g'] ?? 0);
  const serving = p.serving_size?.trim() || '100 g';
  return {
    id: `off_${p.code ?? name}`,
    name,
    brand: p.brands?.split(',')[0]?.trim(),
    servingLabel: serving,
    calories: calories > 0 ? calories : Math.round((n.proteins_100g ?? 0) * 4 + (n.carbohydrates_100g ?? 0) * 4 + (n.fat_100g ?? 0) * 9),
    protein: Math.round((n.proteins_100g ?? 0) * 10) / 10,
    carbs: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
    fat: Math.round((n.fat_100g ?? 0) * 10) / 10,
    fiber: Math.round((n.fiber_100g ?? 0) * 10) / 10,
    sugar: Math.round((n.sugars_100g ?? 0) * 10) / 10,
    sodiumMg: Math.round((n.sodium_100g ?? 0) * 1000),
    barcode: p.code,
    source: 'open_food_facts',
  };
}

/** Search foods — biased toward Austria, Germany, Switzerland (DACH) */
export async function searchOpenFoodFacts(
  query: string,
  options?: { page?: number; pageSize?: number }
): Promise<FoodCatalogItem[]> {
  const q = query.trim();
  if (!q) return [];

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 24;

  const params = new URLSearchParams({
    search_terms: q,
    search_simple: '1',
    action: 'process',
    json: '1',
    page: String(page),
    page_size: String(pageSize),
    // Prefer DACH products
    tagtype_0: 'countries',
    tag_contains_0: 'contains',
    tag_0: 'austria',
  });

  const url = `${BASE}/cgi/search.pl?${params.toString()}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'FitnessApp/1.0 (Expo React Native)' },
  });

  if (!res.ok) throw new Error('Food search failed. Try again.');

  const json = (await res.json()) as { products?: OffProduct[] };
  const items: FoodCatalogItem[] = [];
  for (const p of json.products ?? []) {
    const mapped = mapProduct(p);
    if (mapped) items.push(mapped);
  }
  return items;
}

/** Fallback search without country filter (broader EU) */
export async function searchOpenFoodFactsGlobal(query: string): Promise<FoodCatalogItem[]> {
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams({
    search_terms: q,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '24',
    fields: 'code,product_name,brands,serving_size,nutriments,countries_tags',
  });

  const res = await fetch(`${BASE}/cgi/search.pl?${params.toString()}`, {
    headers: { 'User-Agent': 'FitnessApp/1.0 (Expo React Native)' },
  });
  if (!res.ok) return [];

  const json = (await res.json()) as { products?: OffProduct[] };
  return (json.products ?? []).map(mapProduct).filter((x): x is FoodCatalogItem => x !== null);
}

export async function fetchProductByBarcode(barcode: string): Promise<FoodCatalogItem | null> {
  const code = barcode.trim();
  if (!code) return null;

  const res = await fetch(`${BASE}/api/v2/product/${code}.json`, {
    headers: { 'User-Agent': 'FitnessApp/1.0 (Expo React Native)' },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as { product?: OffProduct; status?: number };
  if (json.status !== 1 || !json.product) return null;
  return mapProduct(json.product);
}

export async function searchFoodsWithFallback(query: string): Promise<FoodCatalogItem[]> {
  try {
    const dach = await searchOpenFoodFacts(query);
    if (dach.length >= 5) return dach;
    const global = await searchOpenFoodFactsGlobal(query);
    const seen = new Set(dach.map((f) => f.id));
    return [...dach, ...global.filter((f) => !seen.has(f.id))].slice(0, 30);
  } catch {
    return searchOpenFoodFactsGlobal(query);
  }
}
