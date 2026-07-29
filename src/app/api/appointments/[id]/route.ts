import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { AppointmentStatus } from '@/lib/types';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appointment = await db.appointment.findUnique({
    where: { id },
    include: {
      service: { select: { nameKey: true, price: true, duration: true } },
      master:  { select: { name: true, role: true } },
    },
  });

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ appointment });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { status?: AppointmentStatus; internalNote?: string };

    const updated = await db.appointment.update({
      where: { id },
      data: {
        ...(body.status       ? { status: body.status }             : {}),
        ...(body.internalNote ? { internalNote: body.internalNote } : {}),
      },
    });

    return NextResponse.json({ appointment: updated });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
