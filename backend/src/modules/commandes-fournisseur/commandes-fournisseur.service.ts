import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommandesFournisseurService {
  constructor(private prisma: PrismaService) {}

  async findAll(fournisseurId?: string, statut?: string) {
    const where: any = {};
    if (fournisseurId) where.fournisseurId = fournisseurId;
    if (statut) where.statut = statut;

    return this.prisma.commandeFournisseur.findMany({
      where,
      include: {
        fournisseur: true,
        lignes: {
          include: { produit: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const commande = await this.prisma.commandeFournisseur.findUnique({
      where: { id },
      include: {
        fournisseur: true,
        lignes: {
          include: { produit: true },
        },
      },
    });

    if (!commande) {
      throw new NotFoundException('Commande fournisseur non trouvée');
    }

    return commande;
  }

  async create(data: {
    fournisseurId: string;
    notes?: string;
    lignes: { produitId: string; quantite: number; prixUnitaire: number }[];
  }) {
    // Générer le numéro de commande
    const count = await this.prisma.commandeFournisseur.count();
    const numero = `CF${new Date().getFullYear()}${String(count + 1).padStart(5, '0')}`;

    // Calculer le total
    const total = data.lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0);

    return this.prisma.commandeFournisseur.create({
      data: {
        numero,
        fournisseurId: data.fournisseurId,
        notes: data.notes,
        total,
        lignes: {
          create: data.lignes.map((l) => ({
            produitId: l.produitId,
            quantiteCommandee: l.quantite,
            prixUnitaire: l.prixUnitaire,
          })),
        },
      },
      include: {
        fournisseur: true,
        lignes: { include: { produit: true } },
      },
    });
  }

  async updateStatut(id: string, statut: string) {
    await this.findOne(id);
    return this.prisma.commandeFournisseur.update({
      where: { id },
      data: { statut: statut as any },
      include: {
        fournisseur: true,
        lignes: { include: { produit: true } },
      },
    });
  }

  async receptionner(id: string, lignesRecues: { ligneId: string; quantiteRecue: number }[]) {
    const commande = await this.findOne(id);

    // Mettre à jour les quantités reçues
    for (const ligne of lignesRecues) {
      await this.prisma.ligneCommandeFournisseur.update({
        where: { id: ligne.ligneId },
        data: { quantiteRecue: ligne.quantiteRecue },
      });

      // Trouver la ligne pour obtenir le produitId
      const ligneCommande = commande.lignes.find((l: any) => l.id === ligne.ligneId);
      if (ligneCommande && ligne.quantiteRecue > 0) {
        // Ajouter au stock (dépôt principal)
        const depotPrincipal = await this.prisma.depot.findFirst({
          where: { principal: true },
        });

        if (depotPrincipal) {
          const stock = await this.prisma.stock.findFirst({
            where: {
              produitId: (ligneCommande as any).produitId,
              depotId: depotPrincipal.id,
            },
          });

          if (stock) {
            await this.prisma.stock.update({
              where: { id: stock.id },
              data: { quantite: { increment: ligne.quantiteRecue } },
            });
          } else {
            await this.prisma.stock.create({
              data: {
                produitId: (ligneCommande as any).produitId,
                depotId: depotPrincipal.id,
                quantite: ligne.quantiteRecue,
              },
            });
          }
        }
      }
    }

    // Vérifier si toutes les lignes sont reçues
    const commandeUpdated = await this.findOne(id);
    const toutRecu = commandeUpdated.lignes.every(
      (l: any) => l.quantiteRecue >= l.quantiteCommandee
    );

    if (toutRecu) {
      await this.prisma.commandeFournisseur.update({
        where: { id },
        data: { statut: 'LIVREE', dateLivraison: new Date() },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.commandeFournisseur.delete({
      where: { id },
    });
  }
}
