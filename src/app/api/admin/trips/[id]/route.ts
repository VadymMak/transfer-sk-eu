import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import { revalidatePath } from 'next/cache';

async function checkAdmin(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

const INCLUDE = {
  translations: true,
  galleryImages: { orderBy: { sortOrder: 'asc' as const } },
} as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const trip = await db.trip.findUnique({ where: { id }, include: INCLUDE });
  if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(trip);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  const body = await req.json() as {
    coverImage?: string | null;
    dateStart?: string;
    dateEnd?: string | null;
    price?: number;
    maxSeats?: number | null;
    active?: boolean;
    sortOrder?: number;
    translations?: Array<{ locale: string; name: string; description?: string; itinerary?: string }>;
    // Gallery image ops — each URL is the Blob URL returned by /api/admin/upload (purpose=gallery)
    galleryAdd?: Array<{ url: string; alt?: string }>;
    galleryRemove?: string[];  // array of TripGalleryImage IDs to delete
  };

  const { translations, galleryAdd, galleryRemove, ...scalarFields } = body;

  await db.trip.update({
    where: { id },
    data: {
      ...(scalarFields.coverImage !== undefined && { coverImage: scalarFields.coverImage }),
      ...(scalarFields.dateStart !== undefined && { dateStart: new Date(scalarFields.dateStart) }),
      ...(scalarFields.dateEnd !== undefined && {
        dateEnd: scalarFields.dateEnd ? new Date(scalarFields.dateEnd) : null,
      }),
      ...(scalarFields.price !== undefined && { price: scalarFields.price }),
      ...(scalarFields.maxSeats !== undefined && { maxSeats: scalarFields.maxSeats }),
      ...(scalarFields.active !== undefined && { active: scalarFields.active }),
      ...(scalarFields.sortOrder !== undefined && { sortOrder: scalarFields.sortOrder }),
    },
  });

  // Upsert translations
  if (translations?.length) {
    for (const t of translations) {
      await db.tripTranslation.upsert({
        where: { tripId_locale: { tripId: id, locale: t.locale } },
        create: {
          tripId: id,
          locale: t.locale,
          name: t.name.trim(),
          description: t.description?.trim() || null,
          itinerary: t.itinerary?.trim() || null,
        },
        update: {
          name: t.name.trim(),
          description: t.description?.trim() || null,
          itinerary: t.itinerary?.trim() || null,
        },
      });
    }
  }

  // Add gallery images (URLs come from /api/admin/upload with purpose=gallery)
  if (galleryAdd?.length) {
    const maxSort = await db.tripGalleryImage.findFirst({
      where: { tripId: id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    let nextSort = (maxSort?.sortOrder ?? -1) + 1;
    for (const img of galleryAdd) {
      await db.tripGalleryImage.create({
        data: { tripId: id, url: img.url, alt: img.alt?.trim() || null, sortOrder: nextSort++ },
      });
    }
  }

  // Remove gallery images
  if (galleryRemove?.length) {
    await db.tripGalleryImage.deleteMany({ where: { id: { in: galleryRemove }, tripId: id } });
  }

  const trip = await db.trip.findUnique({ where: { id }, include: INCLUDE });
  revalidatePath('/', 'layout');
  return NextResponse.json(trip);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await db.trip.delete({ where: { id } });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
