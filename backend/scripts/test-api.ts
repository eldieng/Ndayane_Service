import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== VÉRIFICATION DIRECTE DE LA BASE ===\n');
  
  // Compter les produits
  const count = await prisma.produit.count();
  console.log(`Total produits: ${count}`);
  
  // Lister les 20 premiers produits
  const produits = await prisma.produit.findMany({
    take: 20,
    orderBy: { nom: 'asc' },
    select: { id: true, nom: true }
  });
  
  console.log('\nProduits (triés par nom):');
  produits.forEach((p, i) => {
    console.log(`  ${i+1}. ${p.nom} (${p.id})`);
  });
  
  // Vérifier s'il y a des produits "CADENAS"
  const cadenas = await prisma.produit.findMany({
    where: { nom: { contains: 'CADENAS' } }
  });
  console.log(`\nProduits contenant "CADENAS": ${cadenas.length}`);
  
  await prisma.$disconnect();
}

main();
