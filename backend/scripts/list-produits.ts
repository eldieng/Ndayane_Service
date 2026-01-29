import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const produits = await prisma.produit.findMany({
    take: 15,
    select: { nom: true }
  });
  
  console.log('Produits actuels dans la base:');
  produits.forEach(p => console.log('  -', p.nom));
  
  await prisma.$disconnect();
}

main();
