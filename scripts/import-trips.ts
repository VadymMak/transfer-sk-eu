/**
 * Idempotent bulk import of tours from prisma/data/tours-import.json.
 * UPSERT only — never deletes existing trips or translations.
 * Re-running produces no duplicates.
 *
 * Usage:  npm run import:trips
 */

import path from 'path';
import fs from 'fs';
import { db } from '../src/lib/db';
import { Prisma } from '@prisma/client';

const STORE_SLUG = process.env.STORE_SLUG ?? 'transfer-sk-eu';
const DATA_FILE = path.resolve(__dirname, '../prisma/data/tours-import.json');

// ─── JSON shape ──────────────────────────────────────────────────────────────

interface FaqItem { q: string; a: string }

interface LocaleData {
  name: string;
  headline?: string;
  description?: string;
  audience?: string[];
  itinerary?: string[];
  included?: string[];
  extrasNote?: string[];
  bookingNote?: string;
  tags?: string;
  faq?: FaqItem[];
}

interface TourEntry {
  slug: string;
  departureDate: string;
  priceAdult: number;
  priceChild?: number | null;
  prepayment?: number | null;
  bookingPhone?: string | null;
  seatsTotal?: number | null;
  translations: Record<string, LocaleData>;
}

interface ImportFile {
  tours: TourEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function joinLines(arr: string[] | undefined | null): string | null {
  if (!arr || arr.length === 0) return null;
  return arr.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`[import-trips] File not found: ${DATA_FILE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(raw) as ImportFile;

  // Resolve store
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) {
    console.error(`[import-trips] Store not found: STORE_SLUG="${STORE_SLUG}"`);
    process.exit(1);
  }
  console.log(`[import-trips] Store: ${store.id} (${STORE_SLUG})`);
  console.log(`[import-trips] Tours in file: ${data.tours.length}\n`);

  for (const [i, tour] of data.tours.entries()) {
    const dateStart = new Date(`${tour.departureDate}T00:00:00.000Z`);

    // ── UPSERT Trip ──
    const trip = await db.trip.upsert({
      where: { storeId_slug: { storeId: store.id, slug: tour.slug } },
      create: {
        storeId:     store.id,
        slug:        tour.slug,
        dateStart,
        dateEnd:     null,
        price:       tour.priceAdult,
        priceChild:  tour.priceChild ?? null,
        prepayment:  tour.prepayment ?? null,
        bookingPhone: tour.bookingPhone ?? null,
        seatsTotal:  tour.seatsTotal ?? null,
        active:      false,
        sortOrder:   i,
        // coverImage intentionally omitted → null
      },
      update: {
        dateStart,
        price:       tour.priceAdult,
        priceChild:  tour.priceChild ?? null,
        prepayment:  tour.prepayment ?? null,
        bookingPhone: tour.bookingPhone ?? null,
        seatsTotal:  tour.seatsTotal ?? null,
        // active/coverImage/gallery/videos: NOT touched on update
      },
    });

    const isNew = trip.createdAt.getTime() === trip.updatedAt.getTime();
    console.log(`  [${tour.slug}] ${isNew ? 'CREATED' : 'UPDATED'} trip id=${trip.id}`);

    // ── UPSERT translations ──
    const locales = Object.entries(tour.translations);
    for (const [locale, tr] of locales) {
      const itinerary = joinLines(tr.itinerary);
      const audience  = joinLines(tr.audience);
      const included  = joinLines(tr.included);
      const extrasNote = joinLines(tr.extrasNote);
      const faqValue: Prisma.InputJsonValue | typeof Prisma.DbNull =
        tr.faq && tr.faq.length > 0
          ? (tr.faq as unknown as Prisma.InputJsonValue)
          : Prisma.DbNull;

      const translationData = {
        name:        tr.name,
        headline:    tr.headline   ?? null,
        description: tr.description ?? null,
        itinerary,
        audience,
        included,
        extrasNote,
        bookingNote: tr.bookingNote ?? null,
        tags:        tr.tags ?? null,
        faq:         faqValue,
      };

      await db.tripTranslation.upsert({
        where: { tripId_locale: { tripId: trip.id, locale } },
        create: { tripId: trip.id, locale, ...translationData },
        update: translationData,
      });

      console.log(`    [${locale}] upserted → "${tr.name}"`);
    }
    console.log('');
  }

  console.log('[import-trips] Done.');
}

main()
  .catch((err) => {
    console.error('[import-trips] Fatal error:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
