import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, images: true },
  });

  let fixed = 0;

  for (const product of products) {
    const broken = product.images.filter((url) =>
      url.includes('cdn.thingiverse.com') || url.includes('thingiverse.com')
    );

    if (broken.length === 0) continue;

    const clean = product.images.filter(
      (url) => !url.includes('thingiverse.com')
    );

    await prisma.product.update({
      where: { id: product.id },
      data: { images: clean },
    });

    console.log(
      `Naprawiono: "${product.name}" (${product.slug}) — usunięto ${broken.length} URL thingiverse`
    );
    fixed++;
  }

  console.log(`\nGotowe: naprawiono ${fixed} z ${products.length} produktów.`);
}

main()
  .catch((e) => {
    console.error('Błąd:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
