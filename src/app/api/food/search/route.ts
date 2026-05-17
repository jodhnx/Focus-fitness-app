import { NextResponse } from 'next/server';

import { fetchProductByBarcode, searchFoodsWithFallback } from '@/lib/api/open-food-facts';

function foodSearchResponse(items: unknown[]) {
  return NextResponse.json(items, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode') ?? '';
  if (barcode.trim().length >= 6) {
    const item = await fetchProductByBarcode(barcode);
    return foodSearchResponse(item ? [item] : []);
  }
  const q = searchParams.get('q') ?? '';
  if (q.trim().length < 2) {
    return foodSearchResponse([]);
  }
  try {
    const items = await searchFoodsWithFallback(q);
    return foodSearchResponse(items);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
