import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const db = new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })) });

const updates = [
  { match: 'Timko', date: '2026-07-15T08:30:00Z' },
  { match: 'Tomáš', date: '2026-07-21T17:10:00Z' },
  { match: 'Janka', date: '2026-07-28T12:00:00Z' },
];

async function main() {
  const store = await db.store.findUniqueOrThrow({ where: { slug: 'transfer-sk-eu' }, select: { id: true } });
  for (const u of updates) {
    const rows = await db.testimonial.findMany({
      where: { storeId: store.id, authorName: { startsWith: u.match } },
      select: { id: true, authorName: true },
    });
    for (const r of rows) {
      await db.testimonial.update({ where: { id: r.id }, data: { createdAt: new Date(u.date) } });
      console.log('Updated', r.authorName, '→', u.date);
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
