import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Simuler ce que fait l'API alertes
  const produits = await prisma.produit.findMany({
    where: { actif: true },
    include: { 
      categorie: true,
      stocks: true 
    },
    take: 5
  });
  
  console.log('Produits avec alertes potentielles:');
  produits.forEach(p => {
    const stockTotal = p.stocks.reduce((sum, s) => sum + s.quantite, 0);
    console.log(`  ID: ${p.id}`);
    console.log(`  Nom: ${p.nom}`);
    console.log(`  Stock: ${stockTotal}, Min: ${p.stockMin}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

main();
