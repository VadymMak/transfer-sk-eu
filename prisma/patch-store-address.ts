import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const result = await db.store.update({
    where: { slug: 'transfer-sk-eu' },
    data: {
      address: 'K. Šmidkeho 2938/8',
      postalCode: '911 08',
    },
  });
  console.log('Updated store:', result.slug);
  console.log('  address:    ', result.address);
  console.log('  postalCode: ', result.postalCode);
  console.log('  city:       ', result.city);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
