import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const count = await db.category.count();
await db.$disconnect();

if (count === 0) {
  console.log('Empty database — running seed...');
  await import('./seed.js');
} else {
  console.log(`Database already has ${count} categories — skipping seed.`);
}
