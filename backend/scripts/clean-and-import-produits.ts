import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('=== NETTOYAGE ET IMPORT DES PRODUITS NDAYANE ===\n');

  // 1. Supprimer les produits et catégories existants
  console.log('1. Nettoyage des données existantes...');
  await prisma.stock.deleteMany({});
  await prisma.produit.deleteMany({});
  await prisma.categorie.deleteMany({});
  console.log('   ✅ Produits et catégories supprimés\n');

  // 2. Lire le fichier Excel
  console.log('2. Lecture du fichier Excel des produits...');
  const filePath = path.join(__dirname, '../../data/Ndayanne_produits 002.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`   ${data.length} produits trouvés dans le fichier\n`);

  // 3. Créer les catégories
  console.log('3. Création des catégories...');
  const categorieDefaut = await prisma.categorie.create({
    data: { nom: 'Non classé' }
  });
  const categoriePlomberie = await prisma.categorie.create({
    data: { nom: 'Plomberie' }
  });
  console.log('   ✅ Catégories créées\n');

  // 4. Récupérer ou créer le dépôt principal
  let depotPrincipal = await prisma.depot.findFirst({
    where: { principal: true }
  });

  if (!depotPrincipal) {
    depotPrincipal = await prisma.depot.create({
      data: {
        nom: 'Magasin Principal',
        localisation: 'Ndayane',
        principal: true,
        actif: true
      }
    });
  }
  console.log(`   Dépôt: ${depotPrincipal.nom}\n`);

  // 5. Importer les produits
  console.log('4. Import des produits...');
  
  let imported = 0;

  for (const row of data as any[]) {
    const designation = row['DESIGNATION']?.toString().trim();
    if (!designation) continue;

    const prixVente = parseFloat(row['PRIX_VENTE']) || 0;
    const prixAchat = parseFloat(row['PRIX_ACHAT']) || 0;
    const unite = row['UNITE']?.toString().trim() || 'Unité';
    const stockMin = parseInt(row['STOCK_MIN']) || 5;
    const stockInitial = parseFloat(row['STOCK_INITIAL']) || 0;

    let categorieId = categorieDefaut.id;
    if (row['CATEGORIE']?.toString().toLowerCase() === 'plomberie') {
      categorieId = categoriePlomberie.id;
    }

    const produit = await prisma.produit.create({
      data: {
        nom: designation,
        prixVente: prixVente,
        prixAchat: prixAchat,
        unite: unite,
        stockMin: stockMin,
        categorieId: categorieId,
        actif: true,
      },
    });

    if (stockInitial > 0) {
      await prisma.stock.create({
        data: {
          produitId: produit.id,
          depotId: depotPrincipal.id,
          quantite: stockInitial,
        }
      });
    }

    imported++;
  }

  console.log(`\n=== RÉSULTAT ===`);
  console.log(`✅ Produits importés: ${imported}`);
  console.log(`📊 Total produits en base: ${await prisma.produit.count()}`);
  console.log(`📊 Total catégories en base: ${await prisma.categorie.count()}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
