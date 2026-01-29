import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer l'utilisateur admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@ndayane.sn' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@ndayane.sn',
      nom: 'Administrateur',
      motDePasse: hashedPassword,
      role: 'ADMIN',
      actif: true,
    },
  });

  console.log('✅ Admin créé:', admin.email);

  // Créer le gérant
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

  console.log('✅ Gérant créé:', gerant.email);

  // Créer le dépôt principal
  const depot = await prisma.depot.upsert({
    where: { id: 'depot-principal' },
    update: {},
    create: {
      id: 'depot-principal',
      nom: 'Magasin Principal',
      localisation: 'Ndayane',
      principal: true,
      actif: true,
    },
  });

  console.log('✅ Dépôt créé:', depot.nom);

  // Créer quelques catégories de base
  const categories = [
    'Ciment & Béton',
    'Fer & Métaux',
    'Plomberie',
    'Électricité',
    'Peinture',
    'Outillage',
    'Quincaillerie Générale',
  ];

  for (const nom of categories) {
    await prisma.categorie.upsert({
      where: { id: nom.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      update: {},
      create: {
        id: nom.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        nom,
      },
    });
  }

  console.log('✅ Catégories créées:', categories.length);

  console.log('🎉 Seed terminé!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
