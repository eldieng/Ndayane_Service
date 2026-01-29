import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('=== IMPORT DES PRODUITS NDAYANE ===\n');

  // 1. Lire le fichier Excel
  console.log('1. Lecture du fichier Excel des produits...');
  const filePath = path.join(__dirname, '../../data/Ndayanne_produits 002.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`   ${data.length} produits trouvés dans le fichier\n`);

  // 2. Créer la catégorie par défaut "Non classé"
  console.log('2. Création de la catégorie par défaut...');
  let categorieDefaut = await prisma.categorie.findFirst({
    where: { nom: 'Non classé' }
  });
  
  if (!categorieDefaut) {
    categorieDefaut = await prisma.categorie.create({
      data: { nom: 'Non classé' }
    });
  }
  console.log(`   Catégorie par défaut: ${categorieDefaut.nom} (${categorieDefaut.id})`);

  // Créer aussi la catégorie Plomberie si elle existe dans les données
  let categoriePlomberie = await prisma.categorie.findFirst({
    where: { nom: 'Plomberie' }
  });
  
  if (!categoriePlomberie) {
    categoriePlomberie = await prisma.categorie.create({
      data: { nom: 'Plomberie' }
    });
  }

  // 3. Récupérer le dépôt principal
  let depotPrincipal = await prisma.depot.findFirst({
    where: { principal: true }
  });

  if (!depotPrincipal) {
    depotPrincipal = await prisma.depot.create({
      data: {
        nom: 'Dépôt Principal',
        localisation: 'Ndayane',
        principal: true,
        actif: true
      }
    });
  }
  console.log(`   Dépôt principal: ${depotPrincipal.nom}\n`);

  // 4. Importer les produits
  console.log('3. Import des produits...');
  
  let imported = 0;
  let errors = 0;

  for (const row of data as any[]) {
    try {
      const designation = row['DESIGNATION']?.toString().trim();
      if (!designation) continue;

      // Générer une référence si non fournie
      const ref = row['REF']?.toString().trim() || `PROD${String(imported + 1).padStart(4, '0')}`;

      // Valeurs par défaut pour les champs manquants (convertir en nombres)
      const prixVente = parseFloat(row['PRIX_VENTE']) || 0;
      const prixAchat = parseFloat(row['PRIX_ACHAT']) || 0;
      const unite = row['UNITE']?.toString().trim() || 'Unité';
      const stockMin = parseInt(row['STOCK_MIN']) || 5;
      const stockInitial = parseFloat(row['STOCK_INITIAL']) || 0;

      // Déterminer la catégorie
      let categorieId = categorieDefaut.id;
      if (row['CATEGORIE']) {
        const catNom = row['CATEGORIE'].toString().trim();
        if (catNom.toLowerCase() === 'plomberie') {
          categorieId = categoriePlomberie!.id;
        }
      }

      // Créer le produit
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

      // Créer le stock initial si > 0
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
      process.stdout.write(`\r   Importés: ${imported}/${data.length}`);
    } catch (error: any) {
      errors++;
      console.error(`\n   Erreur pour ${row['DESIGNATION']}: ${error.message}`);
    }
  }

  console.log(`\n\n=== RÉSULTAT ===`);
  console.log(`✅ Produits importés: ${imported}`);
  if (errors > 0) {
    console.log(`❌ Erreurs: ${errors}`);
  }

  // Vérification
  const totalProduits = await prisma.produit.count();
  const totalCategories = await prisma.categorie.count();
  console.log(`\n📊 Total produits en base: ${totalProduits}`);
  console.log(`📊 Total catégories en base: ${totalCategories}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
