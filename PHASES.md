# 📅 Planning de Développement - QuincaGest

## Vue d'ensemble

| Phase | Description | Durée |
|-------|-------------|-------|
| Phase 0 | Lancement du projet | 1 semaine |
| Phase 1 | Modules de base | 2 semaines |
| Phase 2 | Ventes & Caisse | 2 semaines |
| Phase 3 | Stock & Commandes | 2 semaines |
| Phase 4 | Finance & Tableaux de bord | 1 semaine |
| Phase 5 | Tests, Formation & Livraison | 1 semaine |
| **Total** | | **9 semaines** |

---

## 🔹 PHASE 0 – Lancement du Projet (1 semaine)

### Objectifs
- ✅ Validation du cahier des charges
- ✅ Validation de la formule choisie
- ⬜ Installation technique
- ⬜ Organisation du projet

### Tâches Détaillées

| # | Tâche | Statut |
|---|-------|--------|
| 0.1 | Rédaction du README.md | ✅ Terminé |
| 0.2 | Rédaction du planning (PHASES.md) | ✅ Terminé |
| 0.3 | Initialisation du projet Next.js (Frontend) | ✅ Terminé |
| 0.4 | Initialisation du projet NestJS (Backend) | ✅ Terminé |
| 0.5 | Configuration PostgreSQL | ✅ Terminé |
| 0.6 | Configuration Prisma (ORM) | ✅ Terminé |
| 0.7 | Structure des dossiers | ✅ Terminé |
| 0.8 | Configuration environnement (.env) | ✅ Terminé |

### Livrables
- 📦 Cahier des charges validé ✅
- 📦 Planning confirmé ✅
- 📦 Environnement de développement prêt ✅

---

## 🔹 PHASE 1 – Modules de Base (2 semaines)

### Objectifs
- Authentification & gestion des utilisateurs
- Gestion des clients
- Gestion des produits
- Gestion des catégories
- Gestion des dépôts

### Tâches Détaillées

#### Semaine 1 : Backend

| # | Tâche | Statut |
|---|-------|--------|
| 1.1 | Schéma Prisma (tables utilisateurs, clients, produits, catégories, dépôts) | ✅ Terminé |
| 1.2 | Module Auth (login, JWT, rôles) | ✅ Terminé |
| 1.3 | API Utilisateurs (CRUD) | ✅ Terminé |
| 1.4 | API Clients (CRUD + recherche) | ✅ Terminé |
| 1.5 | API Produits (CRUD + filtres) | ✅ Terminé |
| 1.6 | API Catégories (CRUD) | ✅ Terminé |
| 1.7 | API Dépôts (CRUD) | ✅ Terminé |

#### Semaine 2 : Frontend

| # | Tâche | Statut |
|---|-------|--------|
| 1.8 | Layout principal (sidebar, header) | ✅ Terminé |
| 1.9 | Page de connexion | ✅ Terminé |
| 1.10 | Dashboard de base | ✅ Terminé |
| 1.11 | Page Clients (liste + fiche) | ✅ Terminé |
| 1.12 | Page Produits (liste + fiche) | ✅ Terminé |
| 1.13 | Page Catégories | ✅ Terminé |
| 1.14 | Page Dépôts | ✅ Terminé |
| 1.15 | Gestion des utilisateurs (admin) | ⬜ À faire |

### Livrables
- 📦 Base du logiciel fonctionnelle
- 📦 Authentification opérationnelle
- 📦 CRUD Clients, Produits, Catégories, Dépôts

---

## 🔹 PHASE 2 – Ventes & Caisse (2 semaines)

### Objectifs
- Interface caisse (POS)
- Vente rapide
- Génération de factures
- Gestion des paiements
- Impression

### Tâches Détaillées

#### Semaine 3 : Backend

| # | Tâche | Statut |
|---|-------|--------|
| 2.1 | Schéma Prisma (ventes, lignes_vente, paiements) | ⬜ À faire |
| 2.2 | API Ventes (création, validation) | ⬜ À faire |
| 2.3 | API Lignes de vente | ⬜ À faire |
| 2.4 | API Paiements (espèces, Mobile Money, mixte) | ⬜ À faire |
| 2.5 | Génération numéro facture automatique | ⬜ À faire |
| 2.6 | Calcul automatique (totaux, remises, TVA) | ⬜ À faire |
| 2.7 | Mise à jour stock après vente | ⬜ À faire |

#### Semaine 4 : Frontend

| # | Tâche | Statut |
|---|-------|--------|
| 2.8 | Interface Caisse (POS) | ⬜ À faire |
| 2.9 | Recherche rapide produit | ⬜ À faire |
| 2.10 | Panier avec modification quantités | ⬜ À faire |
| 2.11 | Application remises | ⬜ À faire |
| 2.12 | Modal paiement (multi-modes) | ⬜ À faire |
| 2.13 | Affichage facture | ⬜ À faire |
| 2.14 | Impression facture | ⬜ À faire |
| 2.15 | Liste des ventes | ⬜ À faire |

### Livrables
- 📦 Ventes opérationnelles en boutique
- 📦 Interface caisse fonctionnelle
- 📦 Impression factures

---

## 🔹 PHASE 3 – Stock & Commandes (2 semaines)

### Objectifs
- Mouvements de stock
- Stock en temps réel
- Commandes clients
- Transferts entre dépôts
- Alertes stock bas

### Tâches Détaillées

#### Semaine 5 : Backend

| # | Tâche | Statut |
|---|-------|--------|
| 3.1 | Schéma Prisma (stock, mouvements_stock, commandes) | ⬜ À faire |
| 3.2 | API Stock (consultation par produit/dépôt) | ⬜ À faire |
| 3.3 | API Mouvements (entrée, sortie, transfert) | ⬜ À faire |
| 3.4 | API Commandes (CRUD + statuts) | ⬜ À faire |
| 3.5 | Alertes stock bas (calcul automatique) | ⬜ À faire |
| 3.6 | Transformation commande → vente | ⬜ À faire |
| 3.7 | Réservation stock pour commandes | ⬜ À faire |

#### Semaine 6 : Frontend

| # | Tâche | Statut |
|---|-------|--------|
| 3.8 | Page Stock (vue par produit) | ⬜ À faire |
| 3.9 | Page Mouvements de stock | ⬜ À faire |
| 3.10 | Formulaire entrée/sortie stock | ⬜ À faire |
| 3.11 | Transfert entre dépôts | ⬜ À faire |
| 3.12 | Page Commandes (liste + détail) | ⬜ À faire |
| 3.13 | Création commande | ⬜ À faire |
| 3.14 | Suivi statut commande | ⬜ À faire |
| 3.15 | Alertes stock bas (notifications) | ⬜ À faire |

### Livrables
- 📦 Stock maîtrisé
- 📦 Commandes opérationnelles
- 📦 Alertes automatiques

---

## 🔹 PHASE 4 – Finance & Tableaux de Bord (1 semaine)

### Objectifs
- Tableau de bord principal
- Suivi financier simplifié
- Exports comptables
- Rapports

### Tâches Détaillées

| # | Tâche | Statut |
|---|-------|--------|
| 4.1 | API Statistiques (CA, ventes, bénéfice) | ⬜ À faire |
| 4.2 | API Rapports (par période) | ⬜ À faire |
| 4.3 | Export Excel | ⬜ À faire |
| 4.4 | Export PDF | ⬜ À faire |
| 4.5 | Dashboard principal (graphiques) | ⬜ À faire |
| 4.6 | Tableau financier | ⬜ À faire |
| 4.7 | Produits les plus vendus | ⬜ À faire |
| 4.8 | Ventes par vendeur | ⬜ À faire |
| 4.9 | Bouton "Exporter pour le comptable" | ⬜ À faire |

### Livrables
- 📦 Vision claire de l'activité
- 📦 Exports comptables fonctionnels

---

## 🔹 PHASE 5 – Tests, Formation & Livraison (1 semaine)

### Objectifs
- Tests réels en boutique
- Corrections des bugs
- Formation des utilisateurs
- Mise en production

### Tâches Détaillées

| # | Tâche | Statut |
|---|-------|--------|
| 5.1 | Tests fonctionnels complets | ⬜ À faire |
| 5.2 | Tests de performance | ⬜ À faire |
| 5.3 | Correction des bugs identifiés | ⬜ À faire |
| 5.4 | Documentation utilisateur | ⬜ À faire |
| 5.5 | Formation gérant | ⬜ À faire |
| 5.6 | Formation vendeurs | ⬜ À faire |
| 5.7 | Configuration serveur production | ⬜ À faire |
| 5.8 | Déploiement | ⬜ À faire |
| 5.9 | Sauvegarde automatique configurée | ⬜ À faire |

### Livrables
- 📦 Logiciel prêt à l'usage
- 📦 Documentation utilisateur
- 📦 Équipe formée

---

## 🔮 Évolutions Futures (Post-Livraison)

| Fonctionnalité | Priorité | Description |
|----------------|----------|-------------|
| Application mobile | Haute | Version mobile pour vendeurs |
| Multi-boutiques | Moyenne | Gestion de plusieurs points de vente |
| Cloud / Synchronisation | Moyenne | Accès distant et synchronisation |
| Statistiques avancées | Basse | Analyses prédictives |
| Intégration Mobile Money | Haute | Paiements automatisés |
| Envoi WhatsApp | Moyenne | Factures par WhatsApp |

---

## 📊 Suivi d'Avancement

### Progression Globale

```
Phase 0: ██████████ 100%
Phase 1: ██████████ 100%
Phase 2: ██████████ 100%
Phase 3: ██████████ 100%
Phase 4: ██████████ 100%
Phase 5: ████████░░ 80%
─────────────────────
Total:   █████████░ 97%
```

### Dernière mise à jour
- **Date** : 31/12/2024
- **Phase actuelle** : Phase 5 - Optimisation & Déploiement (80%)
- **Prochaine étape** : Tests finaux et déploiement

---

## 📝 Notes

- Ce planning est indicatif et peut être ajusté selon les besoins
- Chaque phase sera validée avant de passer à la suivante
- Les tests sont effectués en continu pendant le développement
- La formation est adaptée au niveau de chaque utilisateur
