import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

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
    name: string;
    role: string;
    bio: string | null;
    photo: string | null;
    active: boolean;
    sortOrder: number;
  }>;

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.role !== undefined) data.role = body.role.trim();
  if (body.bio !== undefined) data.bio = body.bio?.trim() || null;
  if (body.photo !== undefined) data.photo = body.photo?.trim() || null;
  if (body.active !== undefined) data.active = body.active;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  try {
    const master = await db.serviceMaster.update({ where: { id }, data });
    return NextResponse.json(master);
  } catch {
    return NextResponse.json({ error: 'Master not found' }, { status: 404 });
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
    await db.serviceMaster.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Master not found' }, { status: 404 });
  }
}
