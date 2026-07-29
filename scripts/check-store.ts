import { PrismaClient } from '@prisma/client';

async function main() {
  const db = new PrismaClient();
  const s = await db.store.findFirst({ where: { slug: 'kate-barber' } });
  console.log(JSON.stringify(s, null, 2));
  await db.$disconnect();
}

main();
