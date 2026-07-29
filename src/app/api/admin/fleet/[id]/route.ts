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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json() as Partial<{
    nameKey: string;
    description: string | null;
    image: string | null;
    metadata: { capacity?: string; luggage?: string } | null;
    active: boolean;
    sortOrder: number;
  }>;

  const data: Record<string, unknown> = {};
  if (body.nameKey !== undefined) data.nameKey = body.nameKey.trim();
  if (body.description !== undefined) data.description = body.description?.trim() || null;
  if (body.image !== undefined) data.image = body.image?.trim() || null;
  if (body.metadata !== undefined) data.metadata = body.metadata;
  if (body.active !== undefined) data.active = body.active;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  try {
    const vehicle = await db.service.update({ where: { id }, data });
    revalidatePath('/', 'layout');
    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.service.delete({ where: { id } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
}
