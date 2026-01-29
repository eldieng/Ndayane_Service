# Configuration Multi-Clients

Ce dossier contient la configuration centralisée de l'application.

## Pour un nouveau client

### 1. Modifier le fichier `entreprise.ts`

Ouvrez le fichier `entreprise.ts` et modifiez les valeurs suivantes :

```typescript
export const ENTREPRISE = {
  // Informations générales
  nom: "Nom de l'entreprise",
  slogan: "Slogan de l'entreprise",
  
  // Coordonnées
  gerant: "Nom du gérant",
  telephone: "77 XXX XX XX",
  telephone2: "77 XXX XX XX",  // Optionnel, laisser vide si pas de 2ème numéro
  email: "email@exemple.com",
  adresse: "Adresse de l'entreprise",
  ville: "Ville",
  pays: "Pays",
  
  // Logo et images
  logo: "/logo.png",  // Placer le logo dans /public/logo.png
  
  // Devise
  devise: "FCFA",
  deviseSymbole: "F",
  
  // Paramètres par défaut
  defaults: {
    validiteDevis: 15,      // Jours de validité des devis
    paginationLimit: 20,    // Nombre d'éléments par page
  },
  
  // Textes légaux
  mentions: {
    facture: "Merci pour votre confiance !",
    devis: "Ce devis est valable pour la durée indiquée.",
    bonCommande: "Bon de commande à signer par le client.",
  },
}
```

### 2. Remplacer le logo

1. Préparez le logo au format PNG (recommandé : 200x200 pixels)
2. Placez-le dans le dossier `public/` à la racine du projet frontend
3. Nommez-le `logo.png`

### 3. Configurer le backend

Dans le fichier `.env` du backend, modifiez :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nom_base_client"
```

### 4. Créer la base de données

```bash
cd backend
npx prisma db push
```

### 5. Créer le premier utilisateur admin

```bash
cd backend
npm run seed
```

Ou créez manuellement via l'API.

## Structure des fichiers

```
frontend/
├── public/
│   └── logo.png          # Logo de l'entreprise
├── src/
│   └── config/
│       ├── entreprise.ts # Configuration entreprise
│       └── README.md     # Ce fichier
```

## Checklist nouveau client

- [ ] Modifier `entreprise.ts` avec les infos du client
- [ ] Remplacer `public/logo.png`
- [ ] Créer la base de données PostgreSQL
- [ ] Configurer `.env` du backend
- [ ] Exécuter `npx prisma db push`
- [ ] Créer l'utilisateur admin
- [ ] Tester l'impression des factures/devis
- [ ] Déployer sur le serveur du client
