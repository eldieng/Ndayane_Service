import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const produit = await prisma.produit.findFirst({
    where: { id: 'cmklfcnh30007nsmf84eacxbu' }
  });
  
  console.log('Recherche produit ID: cmklfcnh30007nsmf84eacxbu');
  console.log(produit ? `Trouvé: ${produit.nom}` : 'Produit NON TROUVÉ');
  
  // Afficher quelques IDs de produits existants
  const produits = await prisma.produit.findMany({ take: 5, select: { id: true, nom: true } });
  console.log('\nProduits existants:');
  produits.forEach(p => console.log(`  ${p.id} - ${p.nom}`));
  
  await prisma.$disconnect();
}

main();
