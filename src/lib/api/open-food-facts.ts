import type { FoodCatalogItem } from '@/types/domain';
import { foodCatalog } from '@/data/food-catalog';

const BASE = 'https://world.openfoodfacts.org';
const USER_AGENT = 'ApexFit/2.0 (https://apexfit.app)';

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
  image_url?: string;
  image_front_url?: string;
  nutriments?: OffNutriments;
  countries_tags?: string[];
};

const SEARCH_TIMEOUT_MS = 1200;
const QUERY_ALIASES: Record<string, string[]> = {
  bread: ['brot', 'vollkornbrot', 'roggenbrot', 'sauerteigbrot', 'semmel', 'toastbrot'],
  brot: ['brot', 'vollkornbrot', 'roggenbrot', 'sauerteigbrot', 'semmel', 'toastbrot'],
  yogurt: ['joghurt', 'skyr', 'topfen'],
  joghurt: ['joghurt', 'skyr', 'topfen'],
  quark: ['topfen', 'magertopfen'],
  topfen: ['topfen', 'magertopfen', 'quark'],
  oats: ['haferflocken', 'dinkel flocken'],
  hafer: ['haferflocken', 'oats'],
  chicken: ['huhn', 'hühnerbrust', 'huhnchen', 'chicken'],
  huhn: ['huhn', 'hühnerbrust', 'chicken'],
  reis: ['reis', 'rice'],
  rice: ['reis', 'rice'],
  nudeln: ['nudeln', 'pasta'],
  pasta: ['nudeln', 'pasta'],
};

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function localFoodSearch(query: string, limit = 18): FoodCatalogItem[] {
  const normalized = normalizeSearch(query);
  if (normalized.length < 2) return [];

  const queryWords = normalized.split(' ').filter(Boolean);
  const aliasWords = queryWords.flatMap((word) => QUERY_ALIASES[word] ?? []);
  const terms = [...queryWords, ...aliasWords.map(normalizeSearch)].filter(Boolean);

  return foodCatalog
    .map((food) => {
      const haystack = normalizeSearch(`${food.name} ${food.brand ?? ''}`);
      let score = 0;
      for (const term of terms) {
        if (haystack === term) score += 100;
        else if (haystack.startsWith(term)) score += 55;
        else if (haystack.includes(term)) score += 25;
      }
      if (queryWords.every((word) => haystack.includes(word))) score += 20;
      return { food, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name, 'de-AT'))
    .slice(0, limit)
    .map((entry) => entry.food);
}

function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), SEARCH_TIMEOUT_MS);
    }),
  ]);
}

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
    imageUrl: p.image_front_url ?? p.image_url,
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

async function searchCountry(query: string, country: string, options?: { page?: number; pageSize?: number }) {
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
    fields: 'code,product_name,brands,serving_size,nutriments,countries_tags,image_url,image_front_url',
    // Prefer DACH products
    tagtype_0: 'countries',
    tag_contains_0: 'contains',
    tag_0: country,
  });

  const url = `${BASE}/cgi/search.pl?${params.toString()}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.6' },
    next: { revalidate: 3600 },
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

/** Search foods — biased toward Austria, Germany, Switzerland (DACH) */
export async function searchOpenFoodFacts(
  query: string,
  options?: { page?: number; pageSize?: number }
): Promise<FoodCatalogItem[]> {
  const results = await Promise.allSettled([
    searchCountry(query, 'austria', options),
    searchCountry(query, 'germany', options),
    searchCountry(query, 'switzerland', { ...options, pageSize: 12 }),
  ]);
  const [austria, germany, switzerland] = results.map((result) => (result.status === 'fulfilled' ? result.value : []));
  const seen = new Set<string>();
  return [...austria, ...germany, ...switzerland].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
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
    fields: 'code,product_name,brands,serving_size,nutriments,countries_tags,image_url,image_front_url',
  });

  const res = await fetch(`${BASE}/cgi/search.pl?${params.toString()}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.6' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const json = (await res.json()) as { products?: OffProduct[] };
  return (json.products ?? []).map(mapProduct).filter((x): x is FoodCatalogItem => x !== null);
}

export async function fetchProductByBarcode(barcode: string): Promise<FoodCatalogItem | null> {
  const code = barcode.trim();
  if (!code) return null;

  const res = await fetch(`${BASE}/api/v2/product/${code}.json`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.6' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as { product?: OffProduct; status?: number };
  if (json.status !== 1 || !json.product) return null;
  return mapProduct(json.product);
}

export async function searchFoodsWithFallback(query: string): Promise<FoodCatalogItem[]> {
  const local = localFoodSearch(query);
  const seen = new Set(local.map((f) => f.id));
  try {
    const dach = await withTimeout(searchOpenFoodFacts(query, { pageSize: 36 }), []);
    const mergedDach = dach.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
    if (local.length + mergedDach.length >= 12) return [...local, ...mergedDach].slice(0, 36);

    const global = await withTimeout(searchOpenFoodFactsGlobal(query), []);
    const mergedGlobal = global.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
    return [...local, ...mergedDach, ...mergedGlobal].slice(0, 36);
  } catch {
    return local;
  }
}
