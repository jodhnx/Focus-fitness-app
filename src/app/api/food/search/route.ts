import { NextResponse } from 'next/server';

import { fetchProductByBarcode, searchFoodsWithFallback } from '@/lib/api/open-food-facts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode') ?? '';
  if (barcode.trim().length >= 6) {
    const item = await fetchProductByBarcode(barcode);
    return NextResponse.json(item ? [item] : []);
  }
  const q = searchParams.get('q') ?? '';
  if (q.trim().length < 2) {
    return NextResponse.json([]);
  }
  try {
    const items = await searchFoodsWithFallback(q);
    return NextResponse.json(items);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
