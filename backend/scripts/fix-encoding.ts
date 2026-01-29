import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEncoding() {
  console.log('Correction de l\'encodage des unités...');
  
  // Récupérer tous les produits avec un problème d'encodage
  const produits = await prisma.produit.findMany({
    where: {
      unite: {
        contains: 'Unit'
      }
    }
  });

  console.log(`${produits.length} produits à corriger`);

  for (const produit of produits) {
    await prisma.produit.update({
      where: { id: produit.id },
      data: { unite: 'Unité' }
    });
  }

  console.log('Correction terminée!');
  await prisma.$disconnect();
}

fixEncoding().catch(console.error);
