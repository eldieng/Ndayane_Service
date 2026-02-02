import { PrismaClient, TypeClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ==================== VRAIS CLIENTS NDAYANE ====================
const clientsNdayane = [
  { nom: "OUSMANE DRAME", telephone: "776346847", adresse: "Dakar" },
  { nom: "MODOU KHALY GADIAGA", telephone: "781147753", adresse: "Dakar" },
  { nom: "BAYE KEBE", adresse: "Dakar" },
  { nom: "SAMBA MAREGA", adresse: "Dakar" },
  { nom: "LAMINE TOURE", adresse: "Dakar" },
  { nom: "BASS TALL", adresse: "Dakar" },
  { nom: "DIEGO SARAKHOULE", adresse: "Dakar" },
  { nom: "MANSOUR GADIAGA", adresse: "Dakar" },
  { nom: "ASS FALL", adresse: "Dakar" },
  { nom: "AMETH MANGANE", adresse: "Dakar" },
  { nom: "IBRAHIMA THIOYE", adresse: "Dakar" },
  { nom: "NASS DEMARCHEUR", adresse: "Dakar" },
  { nom: "ASS CHEIKH MBAYE", adresse: "Dakar" },
  { nom: "TALLA GADIAGA", adresse: "Dakar" },
  { nom: "MAME CHEIKH DIA", adresse: "Dakar" },
  { nom: "SAMBA SARAKHOULE", adresse: "Dakar" },
  { nom: "DJIBY NDIAYE", adresse: "Dakar" },
  { nom: "YAYA", adresse: "Dakar" },
  { nom: "DEMBA DIAWARA", adresse: "Dakar" },
  { nom: "SERIGNE BAYE KHADIM", adresse: "Dakar" },
  { nom: "MOUSSA DIOP LOUGA", adresse: "Louga" },
  { nom: "MOUHAMED WAGUE", adresse: "Dakar" },
  { nom: "MOUSSA TAMBEDOU", adresse: "Dakar" },
  { nom: "DJILY TOURE", adresse: "Dakar" },
  { nom: "RACINE FALL", adresse: "Dakar" },
  { nom: "TIDIANE MANGANE", adresse: "Dakar" },
  { nom: "IBRAHIMA LOUM", adresse: "Dakar" },
  { nom: "BASS SALL", adresse: "Dakar" },
  { nom: "MODOU NIANG DEMARCHEUR", adresse: "Dakar" },
  { nom: "THIERNO WAGUE", adresse: "Dakar" },
  { nom: "THIERNO ABDOU AZIZ BA", adresse: "Dakar" },
  { nom: "FALLOU DIA", adresse: "Dakar" },
  { nom: "MANSOUR WAGUE", adresse: "Dakar" },
  { nom: "TAMBIDOU", adresse: "Dakar" },
  { nom: "ABDOULAYE DIAWARA", adresse: "Dakar" },
  { nom: "OMAR DRAME", adresse: "Dakar" },
  { nom: "MOUHAMED NDIAYE", adresse: "Dakar" },
  { nom: "MOUHAMED NDIAYE DEMARCHEUR", adresse: "Dakar" },
  { nom: "NIASSE DEMARCHEUR", adresse: "Dakar" },
  { nom: "KHALIL DIAWARA", adresse: "Dakar" },
  { nom: "BABACAR GAYE", adresse: "Dakar" },
  { nom: "MADAME NDIAYE", adresse: "Dakar" },
  { nom: "GASSAMA", adresse: "Dakar" },
  { nom: "ABDOU AZIZ WAGUE", adresse: "Dakar" },
  { nom: "KHADIM SYLL", adresse: "Dakar" },
  { nom: "MAME SERIGNE", adresse: "Dakar" },
  { nom: "BASSIROU MBAYE", adresse: "Dakar" },
  { nom: "ALIOU DIENG", adresse: "Dakar" },
  { nom: "ABDOU KARIM GAYE", adresse: "Dakar" },
  { nom: "DIAW DEMARCHEUR", adresse: "Dakar" },
  { nom: "IBRAHIMA NDIAYE", adresse: "Dakar" },
  { nom: "GAKOU DIAWARA", adresse: "Dakar" },
  { nom: "SOULEYE DIAWARA", adresse: "Dakar" },
  { nom: "MAKHTAR GUEYE LOUGA", adresse: "Louga" },
  { nom: "ANDALA MBENGUE LOUGA", adresse: "Louga" },
  { nom: "MANDIAYE TQG", adresse: "Dakar" },
  { nom: "RATTE SYLL DAKAR", adresse: "Dakar" },
  { nom: "ALADJI ABDOU", adresse: "Dakar" },
  { nom: "KORA MBAYE", adresse: "Dakar" },
  { nom: "OUSTAZ", adresse: "Dakar" },
  { nom: "MAMOUR NDIAYE", adresse: "Dakar" },
  { nom: "LAMINE DIA", adresse: "Dakar" },
  { nom: "MOUHAMED GAYE", adresse: "Dakar" },
  { nom: "ISSA FOFNA", adresse: "Dakar" },
  { nom: "DIAKHATE DEMARCHEUR", adresse: "Dakar" },
  { nom: "BABACAR NIANG", adresse: "Dakar" },
  { nom: "ABDOU LAHAD NDIAYE", adresse: "Dakar" },
  { nom: "LAHAD CHEIKH MBAYE", adresse: "Dakar" },
  { nom: "MOUHAMED MBAYE", adresse: "Dakar" },
  { nom: "MOUSSA DIA", adresse: "Dakar" },
  { nom: "ALIOUNE DIBA", adresse: "Dakar" },
  { nom: "DJIM LOUM", adresse: "Dakar" },
  { nom: "RATTE SYLL LOUGA", adresse: "Louga" },
  { nom: "TAPHA DEMARCHEUR", adresse: "Dakar" },
  { nom: "BASS THIOYE", adresse: "Dakar" },
  { nom: "MOUHAMED THIAW", adresse: "Dakar" },
  { nom: "PAPE MODOU DIEYE", adresse: "Dakar" },
  { nom: "TOUBA ARAME FALL", adresse: "Louga" },
  { nom: "MAWO FALL DEMARCHEUR", adresse: "Dakar" },
];

// ==================== VRAIS PRODUITS NDAYANE ====================
const produitsNdayane = [
  { nom: "TEE EGAUX NF 14-18", prixVente: 112000, prixAchat: 90000, unite: "Unité", stockMin: 5, stockInitial: 20, categorie: "Plomberie" },
  { nom: "TEE FEMELLE NF 14-18", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "MANCHON MALE NF 14-18", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "MANCHON EGAUX NF 14-18", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "COUDE EGAUX NF 14-18", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "COUDE FEMELLE NF 14-18", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "COUDE MALE NF 14-18", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "VANNE A BIS 1/2", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "VANNE A BIS 3/4", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "NOURIS 2SB", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "NOURIS 2SR", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "NOURIS 3SB", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "NOURIS 3SR", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "NOURIS 4SB", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "NOURIS 4SR", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "NOURIS 5SB", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "NOURIS 5SR", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "CONTACT SIMPLE QUALITEC", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Électricité" },
  { nom: "PRISE DE TERRE QUALITEC", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Électricité" },
  { nom: "CONTACT VA ET VIENT QUALITEC", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Électricité" },
  { nom: "CONTACT DOUBLE ALLUMAGE QUALITEC", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Électricité" },
  { nom: "PRISE TV BLANC DORE QUALITEC", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Électricité" },
  { nom: "CONTACT SIMPLE DORE QUALITEC", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Électricité" },
  { nom: "GANT 300#", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "NAMKEM", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "ROBINET DOUBLE FIRMER", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "DOUCHETTE FIRMER", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "ROBINET LAVABO FIRMER", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "ROBINET LAVABO METIGEUR FIRMER", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 5, stockInitial: 0, categorie: "Plomberie" },
  { nom: "COLLIER 18", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Plomberie" },
  { nom: "COLLIER 25", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Plomberie" },
  { nom: "COLLIER 32", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Plomberie" },
  { nom: "COLLIER 75", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Plomberie" },
  { nom: "COLLIER 110", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Plomberie" },
  { nom: "COLLIER 125", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Plomberie" },
  { nom: "COLLANT GM", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "COLLANT PM", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "ROBINET P", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "ROBINET D'ARRET P", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "ROBINET OK", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "ROBINET D'ARRET OK", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "CADENAS 261", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "CADENAS 262", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "CADENAS 263", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "CADENAS 264", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "CADENAS 265", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "CADENAS 266", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "CADENAS 267", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "CADENAS 94", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "CLE D'OR", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "PAPIER EN FER 150", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "PAPIER EN FER 180", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "PAPIER EN FER 220", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "PAPIER EN FER 240", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "PAPIER EN FER 360", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 20, stockInitial: 0, categorie: "Quincaillerie Générale" },
  { nom: "RACCORD MIXTE 1/2 MF", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "RACCORD MIXTE 1/2 MM", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "SIFFON S", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "SIFFON 12/12", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "SIFFON 15/15", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "SIFFON 12 INOX", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "SIFFON 15 INOX", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Plomberie" },
  { nom: "TOURNE VICE AMERICAIN 75", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Outillage" },
  { nom: "TOURNE VICE AMERICAIN 100", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Outillage" },
  { nom: "TOURNE VICE AMERICAIN 125", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Outillage" },
  { nom: "TOURNE VICE AMERICAIN 150", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Outillage" },
  { nom: "TOURNE VICE AMERICAIN 200", prixVente: 0, prixAchat: 0, unite: "Unité", stockMin: 10, stockInitial: 0, categorie: "Outillage" },
];

async function main() {
  console.log('🌱 Seeding database Ndayane Service...\n');

  // ==================== UTILISATEURS ====================
  console.log('1. Création des utilisateurs...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@ndayane.sn' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@ndayane.sn',
      nom: 'Mor FALL',
      motDePasse: hashedPassword,
      role: 'ADMIN',
      actif: true,
    },
  });
  console.log('   ✅ Admin:', admin.email);

  const gerant = await prisma.utilisateur.upsert({
    where: { email: 'gerant@ndayane.sn' },
    update: {},
    create: {
      email: 'gerant@ndayane.sn',
      nom: 'Gérant Ndayane',
      motDePasse: hashedPassword,
      role: 'GERANT',
      actif: true,
    },
  });
  console.log('   ✅ Gérant:', gerant.email);

  // ==================== DEPOT ====================
  console.log('\n2. Création du dépôt...');
  const depot = await prisma.depot.upsert({
    where: { id: 'depot-principal' },
    update: {},
    create: {
      id: 'depot-principal',
      nom: 'Magasin Principal',
      localisation: 'Rue Blaise Diagne X Armand Angrand, Dakar',
      principal: true,
      actif: true,
    },
  });
  console.log('   ✅ Dépôt:', depot.nom);

  // ==================== CATEGORIES ====================
  console.log('\n3. Création des catégories...');
  const categoriesNoms = [
    'Plomberie',
    'Électricité',
    'Quincaillerie Générale',
    'Outillage',
    'Ciment & Béton',
    'Fer & Métaux',
    'Peinture',
    'Non classé',
  ];

  const categoriesMap: Record<string, string> = {};
  for (const nom of categoriesNoms) {
    let cat = await prisma.categorie.findFirst({ where: { nom } });
    if (!cat) {
      cat = await prisma.categorie.create({ data: { nom } });
    }
    categoriesMap[nom] = cat.id;
  }
  console.log('   ✅ Catégories:', categoriesNoms.length);

  // ==================== CLIENTS ====================
  console.log('\n4. Création des clients Ndayane...');
  let clientsCreated = 0;
  for (const client of clientsNdayane) {
    try {
      let telephone = client.telephone || null;
      if (telephone && telephone.length === 9) {
        telephone = '+221' + telephone;
      }
      
      await prisma.client.create({
        data: {
          nom: client.nom.trim(),
          telephone,
          adresse: client.adresse || 'Dakar',
          typeClient: TypeClient.PARTICULIER,
          solde: 0,
          actif: true,
        },
      });
      clientsCreated++;
    } catch (e) {
      // Ignore duplicates
    }
  }
  console.log(`   ✅ Clients: ${clientsCreated}`);

  // ==================== PRODUITS ====================
  console.log('\n5. Création des produits Ndayane...');
  let produitsCreated = 0;
  for (const produit of produitsNdayane) {
    try {
      const categorieId = categoriesMap[produit.categorie] || categoriesMap['Non classé'];
      
      const created = await prisma.produit.create({
        data: {
          nom: produit.nom.trim(),
          prixVente: produit.prixVente,
          prixAchat: produit.prixAchat,
          unite: produit.unite,
          stockMin: produit.stockMin,
          categorieId,
          actif: true,
        },
      });

      // Créer le stock initial si > 0
      if (produit.stockInitial > 0) {
        await prisma.stock.create({
          data: {
            produitId: created.id,
            depotId: depot.id,
            quantite: produit.stockInitial,
          },
        });
      }
      produitsCreated++;
    } catch (e) {
      // Ignore duplicates
    }
  }
  console.log(`   ✅ Produits: ${produitsCreated}`);

  // ==================== RÉSUMÉ ====================
  console.log('\n========================================');
  console.log('🎉 Seed Ndayane Service terminé!');
  console.log('========================================');
  
  const stats = await Promise.all([
    prisma.utilisateur.count(),
    prisma.client.count(),
    prisma.produit.count(),
    prisma.categorie.count(),
    prisma.depot.count(),
  ]);
  
  console.log(`\n📊 Statistiques:`);
  console.log(`   - Utilisateurs: ${stats[0]}`);
  console.log(`   - Clients: ${stats[1]}`);
  console.log(`   - Produits: ${stats[2]}`);
  console.log(`   - Catégories: ${stats[3]}`);
  console.log(`   - Dépôts: ${stats[4]}`);
  
  console.log(`\n🔐 Connexion admin:`);
  console.log(`   Email: admin@ndayane.sn`);
  console.log(`   Mot de passe: admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
