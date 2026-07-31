import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const storeSlug = process.env.STORE_SLUG ?? '';
  const store = await db.store.findUnique({ where: { slug: storeSlug } });
  if (!store) return NextResponse.json({ total: 0, breakdown: {}, lastUpdated: null });

  const chunks = await db.$queryRawUnsafe<{ chunkType: string; count: bigint }[]>(
    `SELECT "chunkType", COUNT(*) as count FROM "StoreKnowledge" WHERE "storeId" = $1 GROUP BY "chunkType"`,
    store.id
  );

  const breakdown = Object.fromEntries(chunks.map((c) => [c.chunkType, Number(c.count)]));
  const total = chunks.reduce((s, c) => s + Number(c.count), 0);

  const latest = await db.$queryRawUnsafe<{ createdAt: Date }[]>(
    `SELECT "createdAt" FROM "StoreKnowledge" WHERE "storeId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
    store.id
  );

  return NextResponse.json({ total, breakdown, lastUpdated: latest[0]?.createdAt ?? null });
}

const STORE_SLUG = process.env.STORE_SLUG ?? '';

async function getEmbedding(openai: OpenAI, text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

export async function POST(_req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  await db.$executeRawUnsafe(
    'DELETE FROM "StoreKnowledge" WHERE "storeId" = $1',
    store.id
  );

  const chunks: { type: string; content: string; metadata: object }[] = [];

  // ── Layer 1: Company chunk from DB ───────────────────────────────────────

  chunks.push({
    type: 'company',
    content: `${store.name} — passenger transport & delivery. ${store.description ?? ''} Address: ${(store as Record<string,unknown>).address ?? ''}, ${(store as Record<string,unknown>).city ?? ''}. Phone/WhatsApp: ${(store as Record<string,unknown>).phone ?? ''}. Email: ${(store as Record<string,unknown>).email ?? ''}.`,
    metadata: { name: store.name, city: (store as Record<string,unknown>).city },
  });

  // ── Layer 2: Curated static facts ────────────────────────────────────────

  const FACTS: { type: string; content: string }[] = [
    { type: 'vehicles', content: 'Fleet: Peugeot 5008 minivan for up to 5 passengers; Renault Trafic van for up to 8 passengers. All prices are fixed per vehicle (not per person), include VAT, no hidden costs.' },
    { type: 'route',    content: 'Airport transfer Trenčín → Bratislava: minivan (up to 5) 90 €, van (up to 8) 120 €.' },
    { type: 'route',    content: 'Airport transfer Trenčín → Vienna Airport (Schwechat): minivan 140 €, van 190 €.' },
    { type: 'route',    content: 'Airport transfer Trenčín → Budapest Airport: minivan 250 €, van 290 €.' },
    { type: 'route',    content: 'Airport transfer Trenčín → Prague Airport: minivan 270 €, van 330 €.' },
    { type: 'airports', content: 'Airports served: Bratislava, Vienna, Budapest, Prague. Available 24/7 including night and early-morning transfers.' },
    { type: 'tours',    content: 'Tourist trips: guided private trips across Europe — Croatia, Italy, Slovenia. Private or groups from 4 people. Croatia (Adriatic coast) from 85 €. Seasonal organized package tours run regularly — dates, destination and price change each time. For the CURRENT tour offer, contact us via WhatsApp +421 951 287 892 or our Telegram channel.' },
    { type: 'delivery', content: 'Deliveries & moving: furniture, personal belongings, help with relocation — within Slovakia and abroad; also small parcels. Price: within Trenčín 45 €; outside the city 0.9 € per km.' },
    { type: 'booking',  content: 'How to book: WhatsApp +421 951 287 892, the website request form, or phone. Provide: pickup, destination, date, time, passengers, luggage. Every booking is confirmed via WhatsApp.' },
  ];
  FACTS.forEach(f => chunks.push({ type: f.type, content: f.content, metadata: {} }));

  // ── Layer 3: Approved reviews (dynamic) ──────────────────────────────────

  const reviews = await db.testimonial.findMany({
    where: { storeId: store.id, status: 'APPROVED' },
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  if (reviews.length > 0) {
    const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    chunks.push({
      type: 'review',
      content: `${store.name} reviews: ${avgRating}/5 based on ${reviews.length} approved reviews. Latest: ${reviews.slice(0, 5).map((r) => `"${r.text}" — ${r.customer?.name ?? r.authorName ?? 'Customer'} (${r.rating}⭐)`).join('; ')}.`,
      metadata: { avgRating, totalReviews: reviews.length },
    });
  }

  const dbChunksCount = chunks.length;

  // ── Layer 2: Web pages crawl ──────────────────────────────────────────────

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const { getDefaultLocale } = await import('@/config');
  const defaultLocale = getDefaultLocale();
  const pagesToCrawl = [
    { path: `/${defaultLocale}`, label: 'Home page' },
    { path: `/${defaultLocale}/testimonials`, label: 'Reviews page' },
    { path: `/${defaultLocale}/products`, label: 'Products page' },
  ];

  for (const page of pagesToCrawl) {
    try {
      const res = await fetch(`${baseUrl}${page.path}`, {
        headers: { 'User-Agent': 'StoreRAGCrawler/1.0' },
        cache: 'no-store',
      });
      if (!res.ok) continue;

      const html = await res.text();
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000);

      if (text.length < 100) continue;

      chunks.push({
        type: 'webpage',
        content: `Obsah stránky "${page.label}" (${page.path}):\n${text}`,
        metadata: { url: page.path, label: page.label },
      });
    } catch (err) {
      console.warn(`[crawl] Failed to fetch ${page.path}:`, err);
    }
  }

  const webChunksCount = chunks.length - dbChunksCount;

  // ── Save all chunks with embeddings ──────────────────────────────────────

  let saved = 0;
  for (const chunk of chunks) {
    const embedding = await getEmbedding(openai, chunk.content);
    const vectorStr = `[${embedding.join(',')}]`;
    await db.$executeRawUnsafe(
      `INSERT INTO "StoreKnowledge" (id, "storeId", "chunkType", content, embedding, metadata, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, $5::jsonb, now())`,
      store.id,
      chunk.type,
      chunk.content,
      vectorStr,
      JSON.stringify(chunk.metadata)
    );
    saved++;
  }

  return NextResponse.json({
    ok: true,
    chunksIndexed: saved,
    breakdown: { db: dbChunksCount, web: webChunksCount },
  });
}
