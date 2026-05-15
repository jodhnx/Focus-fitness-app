import { NextResponse } from 'next/server';

import { searchFoodsWithFallback } from '@/lib/api/open-food-facts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
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
