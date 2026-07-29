import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const GALLERY = [
  { url: '/gallery/gallery-1-chair.webp',   alt: 'Štýlové barbershop kreslo',     sortOrder: 1 },
  { url: '/gallery/gallery-2-haircut.webp', alt: 'Presný strih',                  sortOrder: 2 },
  { url: '/gallery/gallery-3-beard.webp',   alt: 'Briadkový styling',             sortOrder: 3 },
  { url: '/gallery/gallery-4-result.webp',  alt: 'Výsledok - perfektný strih',    sortOrder: 4 },
  { url: '/gallery/gallery-5-studio.webp',  alt: 'Kate Barber Studio interiér',   sortOrder: 5 },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  const STORE_SLUG = process.env.STORE_SLUG ?? 'kate-barber';
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) throw new Error(`Store "${STORE_SLUG}" not found`);

  // Clean up existing records (including ones with empty URLs)
  const deleted = await db.galleryImage.deleteMany({ where: { storeId: store.id } });
  console.log(`Deleted ${deleted.count} old gallery records`);

  for (const item of GALLERY) {
    await db.galleryImage.create({
      data: { storeId: store.id, ...item, active: true },
    });
    console.log(`✓ ${item.url}`);
  }

  console.log(`\nSeeded ${GALLERY.length} gallery images for "${STORE_SLUG}"`);

  await db.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
