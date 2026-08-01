import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentCustomer } from '@/lib/customerAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ items: [], total: 0 });

  const [items, total] = await Promise.all([
    db.testimonial.findMany({
      where: { storeId: store.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
      include: {
        customer: { select: { name: true } },
      },
    }),
    db.testimonial.count({
      where: { storeId: store.id, status: 'APPROVED' },
    }),
  ]);

  const aggregate =
    items.length > 0
      ? { count: total, average: +(items.reduce((sum, t) => sum + t.rating, 0) / items.length).toFixed(1) }
      : null;

  return NextResponse.json({
    items: items.map((t) => ({
      id: t.id,
      text: t.text,
      content: t.text,
      rating: t.rating,
      customerName: t.customer?.name ?? 'Klient',
      name: t.customer?.name ?? 'Klient',
      locale: t.locale,
      createdAt: t.createdAt.toISOString(),
      adminReply: t.adminReply,
      adminReplyAt: t.adminReplyAt?.toISOString() ?? null,
    })),
    total,
    aggregate,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      name?: string;
      city?: string;
      rating?: number | string;
      text?: string;
      locale?: string;
      website?: string;
    };

    // Honeypot — silent drop
    if (body.website) return NextResponse.json({ ok: true });

    const name = (typeof body.name === 'string' ? body.name : '').trim();
    const city = (typeof body.city === 'string' ? body.city : '').trim();
    const text = (typeof body.text === 'string' ? body.text : '').trim();
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const locale = typeof body.locale === 'string' ? body.locale : 'de';

    if (!text) return NextResponse.json({ ok: true });

    const authorName = name ? (city ? `${name}, ${city}` : name) : null;

    const store = await db.store.findUnique({
      where: { slug: process.env.STORE_SLUG ?? '' },
      select: { id: true },
    });
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    await db.testimonial.create({
      data: {
        text,
        rating,
        locale,
        authorName,
        status: 'PENDING',
        storeId: store.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[testimonials POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
