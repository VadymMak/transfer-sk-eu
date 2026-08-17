import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const db = new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })) });

const titleI18n = {
  sk: 'Letiskové transfery Trenčín → Viedeň, Bratislava, Budapešť',
  en: 'Airport Transfers Trenčín → Vienna, Bratislava, Budapest',
  de: 'Flughafentransfers Trenčín → Wien, Bratislava, Budapest',
  cs: 'Letištní transfery Trenčín → Vídeň, Bratislava, Budapešť',
  ru: 'Трансферы в аэропорт Тренчин → Вена, Братислава, Будапешт',
  uk: 'Трансфери в аеропорт Тренчин → Відень, Братислава, Будапешт',
};

async function main() {
  const store = await db.store.findUniqueOrThrow({
    where: { slug: 'transfer-sk-eu' },
    select: { id: true },
  });
  const result = await db.heroConfig.update({
    where: { storeId: store.id },
    data: { titleI18n },
  });
  console.log('✓ heroConfig.titleI18n updated for store', store.id);
  console.log('  New titles:', JSON.stringify(result.titleI18n, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
