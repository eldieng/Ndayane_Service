# 🏪 Quincaillerie Ndayane Services - Logiciel de Gestion Commerciale

## 📋 Présentation du Projet

**Quincaillerie Ndayane Services** dispose d'un logiciel de gestion commerciale et de stock conçu spécifiquement pour ses besoins. Il remplace les solutions lourdes comme Sage par un outil :

- ✅ **Simple** - Interface intuitive pour tous les utilisateurs
- ✅ **Rapide** - Exécution fluide des tâches quotidiennes
- ✅ **Adapté** - Fonctionnalités métier pour quincailleries
- ✅ **Évolutif** - Architecture moderne permettant des extensions futures

---

## 🎯 Objectifs

| Objectif | Description |
|----------|-------------|
| Simplifier | Gestion quotidienne accessible à tous |
| Accélérer | Ventes au comptoir rapides et efficaces |
| Suivre | Stock en temps réel avec alertes |
| Réduire | Minimiser les erreurs humaines |
| Centraliser | Données produits, clients, ventes, stock |
| Visualiser | Vision claire de l'activité pour le gérant |

---

## 👥 Profils Utilisateurs

| Rôle | Accès |
|------|-------|
| **Gérant** | Accès total à toutes les fonctionnalités |
| **Vendeur** | Vente, caisse, consultation |
| **Responsable stock** | Stock, entrées/sorties |
| **Comptable** *(optionnel)* | Consultation & export |

---

## 🧩 Modules Fonctionnels

### Module 1 : Gestion des Clients
- Liste des clients avec recherche
- Fiche client complète (nom, téléphone, type, plafond crédit)
- Historique (ventes, commandes, paiements, retours, solde)
- Actions rapides (nouvelle vente, encaissement, relevé)

### Module 2 : Gestion des Produits
- Liste des produits avec statut stock
- Fiche produit (catégorie, prix achat/vente, marge auto, stock min)
- Gestion des unités (pièce, mètre, kg...)

### Module 3 : Gestion du Stock
- Stock en temps réel par produit
- Gestion multi-dépôts
- Mouvements (entrée, sortie, transfert)
- Alertes stock bas
- Historique et traçabilité

### Module 4 : Documents de Vente
- Liste centrale avec filtres (devis, commandes, factures, retours)
- Cycle de vente simplifié

### Module 5 : Caisse / POS
- Interface caisse rapide
- Recherche produit instantanée
- Paiements multiples (espèces, Mobile Money, mixte, partiel)
- Génération et impression factures

### Module 6 : Commandes Clients
- Création et suivi des commandes
- Statuts (en attente, préparation, prête, livrée, annulée)
- Transformation en vente

### Module 7 : Gestion Financière
- Tableau financier (ventes, dépenses, bénéfice, dettes)
- Suivi des paiements
- Export comptable (Excel, PDF)

### Module 8 : Tableaux de Bord
- Chiffre d'affaires
- Produits les plus vendus
- Stock critique
- Ventes par vendeur
- Bénéfice estimé

### Module 9 : Sécurité & Utilisateurs
- Comptes utilisateurs avec rôles
- Permissions granulaires
- Journal des actions (audit)
- Sauvegardes automatiques

---

## 🛠️ Stack Technique

### Frontend
- **Next.js** (React) - Interface utilisateur moderne et réactive
- **TailwindCSS** - Styling rapide et cohérent
- **shadcn/ui** - Composants UI professionnels
- **Lucide Icons** - Icônes modernes

### Backend
- **Node.js + NestJS** - API robuste et structurée
- **JWT** - Authentification sécurisée
- **Prisma** - ORM pour la base de données

### Base de Données
- **PostgreSQL** - Base de données relationnelle fiable

---

## 📊 Structure de la Base de Données

### Tables Principales

| Table | Description |
|-------|-------------|
| `utilisateurs` | Comptes utilisateurs et rôles |
| `clients` | Informations clients |
| `produits` | Catalogue produits |
| `categories` | Catégories de produits |
| `depots` | Dépôts/entrepôts |
| `stock` | Quantités par produit/dépôt |
| `mouvements_stock` | Historique des mouvements |
| `ventes` | En-têtes des ventes |
| `lignes_vente` | Détails des ventes |
| `paiements` | Paiements reçus |
| `commandes` | Commandes clients |
| `retours` | Retours produits |

---

## 🔐 Sécurité

- **Authentification** : Login + mot de passe avec JWT
- **Autorisation** : Accès basé sur les rôles
- **Audit** : Journal des actions utilisateurs
- **Sauvegardes** : Automatiques quotidiennes + export manuel
- **Validation** : Contrôle des données côté backend

---

## 🚀 Installation

```bash
# Cloner le projet
git clone [url-du-repo]

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Lancer la base de données
npm run db:migrate

# Démarrer le serveur de développement
npm run dev
```

---

## 📁 Structure du Projet

```
quincagest/
├── frontend/          # Application Next.js
│   ├── app/           # Pages et routes
│   ├── components/    # Composants réutilisables
│   └── lib/           # Utilitaires
├── backend/           # API NestJS
│   ├── src/
│   │   ├── modules/   # Modules métier
│   │   ├── auth/      # Authentification
│   │   └── common/    # Utilitaires partagés
│   └── prisma/        # Schéma base de données
└── docs/              # Documentation
```

---

## 📞 Support

Pour toute question ou assistance, contactez l'équipe de développement.

---

## 📄 Licence

Projet propriétaire - Tous droits réservés.
