/**
 * Patch the "Deliveries & Moving" db.service row:
 *   price:    1  → 45
 *   metadata: merge pageSlug = '/preprava-veci'  (preserve existing keys)
 *
 * Run: set -a; source .env; set +a && npx tsx scripts/patch-cargo-service.ts
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const STORE_SLUG = process.env.STORE_SLUG ?? '';
const PAGE_SLUG = '/preprava-veci';

async function main() {
  const store = await prisma.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true },
  });
  if (!store) throw new Error(`Store not found: ${STORE_SLUG}`);

  // Find all non-route/non-fleet services → print for inspection
  const candidates = await prisma.service.findMany({
    where: {
      storeId: store.id,
      category: { notIn: ['route', 'fleet'] },
    },
    select: { id: true, nameKey: true, price: true, category: true, metadata: true },
  });

  console.log('\nAll non-route/non-fleet services:');
  for (const s of candidates) {
    console.log(`  id=${s.id}  nameKey="${s.nameKey}"  price=${s.price}  category=${s.category ?? 'null'}  pageSlug=${(s.metadata as Record<string,unknown> | null)?.pageSlug ?? '—'}`);
  }

  // Find the cargo row by nameKey containing "Deliveries" or "delivery"
  const cargo = candidates.find(
    (s) =>
      s.nameKey.toLowerCase().includes('deliveri') ||
      s.nameKey.toLowerCase().includes('moving') ||
      s.nameKey.toLowerCase().includes('cargo') ||
      s.nameKey.toLowerCase().includes('prevoz') ||
      s.nameKey.toLowerCase().includes('preprava'),
  );

  if (!cargo) {
    console.error('\n❌ Cargo service not found. Check nameKey values above and adjust the search.');
    process.exit(1);
  }

  console.log(`\n✅ Target found: id=${cargo.id}  nameKey="${cargo.nameKey}"  price=${cargo.price}`);

  const existingMeta = (cargo.metadata as Record<string, unknown> | null) ?? {};
  const newMeta = { ...existingMeta, pageSlug: PAGE_SLUG };

  const updated = await prisma.service.update({
    where: { id: cargo.id },
    data: {
      price: 45,
      metadata: newMeta,
    },
    select: { id: true, nameKey: true, price: true, metadata: true },
  });

  console.log('\n✅ Updated successfully:');
  console.log(`  id        = ${updated.id}`);
  console.log(`  nameKey   = "${updated.nameKey}"`);
  console.log(`  price     = ${updated.price}`);
  console.log(`  pageSlug  = ${(updated.metadata as Record<string,unknown>)?.pageSlug}`);
  console.log('  full metadata:', JSON.stringify(updated.metadata, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
