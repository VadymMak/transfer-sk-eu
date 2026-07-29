import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreConfig } from '@/lib/store-config';

export async function POST(req: Request) {
  try {
    const body = await req.json() as Record<string, string>;
    const { pickup, dropoff, date, time, passengers, luggage, flightNumber, name, phone, note } = body;

    if (!pickup || !dropoff || !date || !time || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const config = await getStoreConfig();

    // Save as Appointment with metadata — reuses existing model
    await db.appointment.create({
      data: {
        storeId: config.id,
        guestName: name,
        guestPhone: phone,
        date: new Date(date),
        timeSlot: time,
        duration: 0,
        note: [
          `Von: ${pickup}`,
          `Nach: ${dropoff}`,
          `Passagiere: ${passengers}`,
          `Gepäck: ${luggage}`,
          flightNumber ? `Flugnummer: ${flightNumber}` : '',
          note ? `Nachricht: ${note}` : '',
        ].filter(Boolean).join(' | '),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[transfer-quotes]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
