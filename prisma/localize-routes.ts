import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const db = new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })) });

const data = [
  { match: 'Trenčín → Bratislava', nameI18n: {
    sk:'Trenčín → Bratislava', cs:'Trenčín → Bratislava', de:'Trenčín → Bratislava',
    en:'Trenčín → Bratislava', ru:'Тренчин → Братислава', uk:'Тренчин → Братислава' } },
  { match: 'Trenčín → Vienna Airport', nameI18n: {
    sk:'Trenčín → Letisko Viedeň', cs:'Trenčín → Letiště Vídeň', de:'Trenčín → Flughafen Wien',
    en:'Trenčín → Vienna Airport', ru:'Тренчин → Аэропорт Вены', uk:'Тренчин → Аеропорт Відня' } },
  { match: 'Trenčín → Budapest Airport', nameI18n: {
    sk:'Trenčín → Letisko Budapešť', cs:'Trenčín → Letiště Budapešť', de:'Trenčín → Flughafen Budapest',
    en:'Trenčín → Budapest Airport', ru:'Тренчин → Аэропорт Будапешта', uk:'Тренчин → Аеропорт Будапешта' } },
  { match: 'Trenčín → Prague Airport', nameI18n: {
    sk:'Trenčín → Letisko Praha', cs:'Trenčín → Letiště Praha', de:'Trenčín → Flughafen Prag',
    en:'Trenčín → Prague Airport', ru:'Тренчин → Аэропорт Праги', uk:'Тренчин → Аеропорт Праги' } },
];

async function main() {
  const store = await db.store.findUniqueOrThrow({ where: { slug: 'transfer-sk-eu' }, select: { id: true } });
  for (const d of data) {
    const rows = await db.service.findMany({ where: { storeId: store.id, category: 'route', nameKey: d.match }, select: { id: true, metadata: true } });
    for (const r of rows) {
      const meta = { ...((r.metadata as object) ?? {}), nameI18n: d.nameI18n };
      await db.service.update({ where: { id: r.id }, data: { metadata: meta } });
      console.log('✓', d.match);
    }
  }
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>db.$disconnect());
