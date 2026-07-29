import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';
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
    'fleet-' +
    name
      .toLowerCase()
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

  const vehicles = await db.service.findMany({
    where: { storeId: store.id, category: 'fleet' },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json(vehicles);
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const body = await req.json() as {
    nameKey: string;
    description?: string;
    image?: string;
    metadata?: { capacity?: string; luggage?: string };
    active?: boolean;
  };

  if (!body.nameKey?.trim()) {
    return NextResponse.json({ error: 'Vehicle name is required' }, { status: 400 });
  }

  const maxSort = await db.service.findFirst({
    where: { storeId: store.id, category: 'fleet' },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  const vehicle = await db.service.create({
    data: {
      storeId: store.id,
      slug: makeSlug(body.nameKey),
      nameKey: body.nameKey.trim(),
      description: body.description?.trim() || null,
      image: body.image?.trim() || null,
      category: 'fleet',
      metadata: (body.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      price: 0,
      duration: 0,
      active: body.active ?? true,
      sortOrder: (maxSort?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath('/', 'layout');
  return NextResponse.json(vehicle, { status: 201 });
}
