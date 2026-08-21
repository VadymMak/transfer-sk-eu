// Run: npx tsx prisma/seed-trips.ts
// Adds one example trip so the admin and public pages have data to display.

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const store = await db.store.findUnique({ where: { slug: 'transfer-sk-eu' } });
  if (!store) throw new Error('Store transfer-sk-eu not found');

  const slug = 'vieden-shopping-2026';

  const trip = await db.trip.upsert({
    where: { storeId_slug: { storeId: store.id, slug } },
    update: {},
    create: {
      storeId: store.id,
      slug,
      dateStart: new Date('2026-10-10T07:00:00'),
      dateEnd: new Date('2026-10-10T20:00:00'),
      price: 35,
      currency: 'EUR',
      maxSeats: 8,
      active: true,
      sortOrder: 0,
      translations: {
        create: [
          {
            locale: 'sk',
            name: 'Viedeň — nákupný výlet',
            description: 'Pohodlný skupinový výlet do Viedne s odchodom z Trenčína. Čas na nakupovanie, prehliadky aj gastronómiu.',
            itinerary: '07:00 Odchod z Trenčína\n10:00 Príchod do Viedne\n10:00–17:00 Voľný program\n17:30 Odchod späť\n20:00 Príchod do Trenčína',
          },
          {
            locale: 'cs',
            name: 'Vídeň — nákupní výlet',
            description: 'Pohodlný skupinový výlet do Vídně s odjezdem z Trenčína. Čas na nakupování, prohlídky i gastronomii.',
            itinerary: '07:00 Odjezd z Trenčína\n10:00 Příjezd do Vídně\n10:00–17:00 Volný program\n17:30 Odjezd zpět\n20:00 Příjezd do Trenčína',
          },
          {
            locale: 'de',
            name: 'Wien — Shopping-Ausflug',
            description: 'Komfortabler Gruppenausflug nach Wien ab Trenčín. Zeit zum Einkaufen, Besichtigen und Genießen.',
            itinerary: '07:00 Abfahrt Trenčín\n10:00 Ankunft Wien\n10:00–17:00 Freies Programm\n17:30 Rückfahrt\n20:00 Ankunft Trenčín',
          },
          {
            locale: 'en',
            name: 'Vienna — Shopping Trip',
            description: 'Comfortable group trip to Vienna from Trenčín. Time for shopping, sightseeing and dining.',
            itinerary: '07:00 Departure from Trenčín\n10:00 Arrival in Vienna\n10:00–17:00 Free time\n17:30 Return journey\n20:00 Arrival in Trenčín',
          },
          {
            locale: 'ru',
            name: 'Вена — шоппинг-тур',
            description: 'Комфортная групповая поездка в Вену из Тренчина. Шоппинг, достопримечательности, гастрономия.',
            itinerary: '07:00 Отправление из Тренчина\n10:00 Прибытие в Вену\n10:00–17:00 Свободное время\n17:30 Отправление обратно\n20:00 Прибытие в Тренчин',
          },
          {
            locale: 'uk',
            name: 'Відень — шопінг-тур',
            description: 'Комфортна групова поїздка до Відня з Тренчина. Шопінг, пам\'ятки, гастрономія.',
            itinerary: '07:00 Відправлення з Тренчина\n10:00 Прибуття до Відня\n10:00–17:00 Вільний час\n17:30 Відправлення назад\n20:00 Прибуття до Тренчина',
          },
        ],
      },
    },
    include: { translations: true },
  });

  console.log(`✓ Trip seeded: ${trip.slug} (${trip.translations.length} translations)`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
