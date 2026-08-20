import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import { revalidatePath } from 'next/cache';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

async function checkAdmin(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

function makeSlug(name: string): string {
  return (
    'trip-' +
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Date.now()
  );
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json([]);

  const trips = await db.trip.findMany({
    where: { storeId: store.id },
    orderBy: [{ sortOrder: 'asc' }, { dateStart: 'asc' }],
    include: { translations: true },
  });

  return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const body = await req.json() as {
    slug?: string;
    coverImage?: string;
    dateStart: string;
    dateEnd?: string;
    price: number;
    maxSeats?: number;
    active?: boolean;
    translations: Array<{ locale: string; name: string; description?: string; itinerary?: string }>;
  };

  if (!body.dateStart || !body.price || !body.translations?.length) {
    return NextResponse.json({ error: 'dateStart, price, and at least one translation are required' }, { status: 400 });
  }

  const skName = body.translations.find((t) => t.locale === 'sk')?.name
    ?? body.translations[0]?.name ?? 'trip';

  const maxSort = await db.trip.findFirst({
    where: { storeId: store.id },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  const trip = await db.trip.create({
    data: {
      storeId: store.id,
      slug: body.slug?.trim() || makeSlug(skName),
      coverImage: body.coverImage?.trim() || null,
      dateStart: new Date(body.dateStart),
      dateEnd: body.dateEnd ? new Date(body.dateEnd) : null,
      price: body.price,
      maxSeats: body.maxSeats ?? null,
      active: body.active ?? true,
      sortOrder: (maxSort?.sortOrder ?? -1) + 1,
      translations: {
        create: body.translations.map((t) => ({
          locale: t.locale,
          name: t.name.trim(),
          description: t.description?.trim() || null,
          itinerary: t.itinerary?.trim() || null,
        })),
      },
    },
    include: { translations: true },
  });

  revalidatePath('/', 'layout');
  return NextResponse.json(trip, { status: 201 });
}
