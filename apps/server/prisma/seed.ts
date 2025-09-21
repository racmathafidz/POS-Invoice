import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `InvoiceItem`');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `Invoice`');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `Product`');
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1');

  await prisma.product.createMany({
    data: [
      {
        id: 1,
        name: 'Arabica Beans 250g',
        priceCents: 89000,
        stock: 42,
        imageUrl: '/img/arabica.jpg',
      },
      {
        id: 2,
        name: 'Robusta Beans 250g',
        priceCents: 69000,
        stock: 55,
        imageUrl: '/img/robusta.jpg',
      },
      { id: 3, name: 'Whole Milk 1L', priceCents: 24000, stock: 80, imageUrl: '/img/milk.jpg' },
      { id: 4, name: 'Chocolate Syrup', priceCents: 35000, stock: 30, imageUrl: '/img/syrup.jpg' },
      { id: 5, name: 'Paper Cup (50x)', priceCents: 28000, stock: 120, imageUrl: '/img/cups.jpg' },
    ],
    skipDuplicates: true,
  });
  await prisma.$executeRawUnsafe('ALTER TABLE `Product` AUTO_INCREMENT = 6');

  console.log('✅ Seeded products with explicit IDs 1..5');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
