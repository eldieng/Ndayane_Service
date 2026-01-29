import { PrismaClient, TypeClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('=== IMPORT DES CLIENTS NDAYANE ===\n');

  // 1. Supprimer les données de test existantes
  console.log('1. Suppression des données de test...');
  
  // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
  await prisma.paiement.deleteMany({});
  console.log('   - Paiements supprimés');
  
  await prisma.ligneVente.deleteMany({});
  console.log('   - Lignes de vente supprimées');
  
  await prisma.vente.deleteMany({});
  console.log('   - Ventes supprimées');
  
  await prisma.mouvementStock.deleteMany({});
  console.log('   - Mouvements de stock supprimés');
  
  await prisma.stock.deleteMany({});
  console.log('   - Stocks supprimés');
  
  await prisma.produit.deleteMany({});
  console.log('   - Produits supprimés');
  
  await prisma.categorie.deleteMany({});
  console.log('   - Catégories supprimées');
  
  await prisma.client.deleteMany({});
  console.log('   - Clients supprimés');

  console.log('\n2. Lecture du fichier Excel des clients...');
  
  // 2. Lire le fichier Excel
  const filePath = path.join(__dirname, '../../data/Ndayanne_clients001.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`   ${data.length} clients trouvés dans le fichier\n`);

  // 3. Importer les clients
  console.log('3. Import des clients...');
  
  let imported = 0;
  let errors = 0;

  for (const row of data as any[]) {
    try {
      const nom = row['NOM']?.toString().trim();
      if (!nom) continue;

      // Formater le téléphone
      let telephone = '';
      if (row['TELEPHONE']) {
        telephone = row['TELEPHONE'].toString().replace(/\.0$/, '');
        // Ajouter le préfixe +221 si nécessaire
        if (telephone.length === 9 && !telephone.startsWith('+')) {
          telephone = '+221' + telephone;
        }
      }

      // Déterminer le type de client
      let typeClient: TypeClient = TypeClient.PARTICULIER;
      if (row['TYPECLIENT']) {
        const type = row['TYPECLIENT'].toString().toUpperCase();
        if (type === 'ENTREPRISE' || type === 'PROFESSIONNEL') {
          typeClient = TypeClient.ENTREPRISE;
        }
      }

      await prisma.client.create({
        data: {
          nom: nom,
          telephone: telephone || null,
          adresse: row['ADRESSE']?.toString() || 'Dakar',
          typeClient: typeClient,
          solde: 0,
          actif: true,
        },
      });

      imported++;
      process.stdout.write(`\r   Importés: ${imported}/${data.length}`);
    } catch (error: any) {
      errors++;
      console.error(`\n   Erreur pour ${row['NOM']}: ${error.message}`);
    }
  }

  console.log(`\n\n=== RÉSULTAT ===`);
  console.log(`✅ Clients importés: ${imported}`);
  if (errors > 0) {
    console.log(`❌ Erreurs: ${errors}`);
  }

  // Vérification
  const totalClients = await prisma.client.count();
  console.log(`\n📊 Total clients en base: ${totalClients}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
