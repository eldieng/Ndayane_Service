import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('=== ÉTAT DE LA BASE DE DONNÉES ===\n');
  
  const clients = await prisma.client.count();
  const produits = await prisma.produit.count();
  const categories = await prisma.categorie.count();
  const ventes = await prisma.vente.count();
  const paiements = await prisma.paiement.count();
  const stocks = await prisma.stock.count();
  
  console.log('📊 Données actuelles:');
  console.log(`   - Clients: ${clients}`);
  console.log(`   - Produits: ${produits}`);
  console.log(`   - Catégories: ${categories}`);
  console.log(`   - Ventes: ${ventes}`);
  console.log(`   - Paiements: ${paiements}`);
  console.log(`   - Stocks: ${stocks}`);
  
  console.log('\n👤 Utilisateurs:');
  const users = await prisma.utilisateur.findMany({
    select: { email: true, nom: true, role: true }
  });
  users.forEach(u => {
    console.log(`   - ${u.nom} (${u.email}) - ${u.role}`);
  });
  
  await prisma.$disconnect();
}

check();
