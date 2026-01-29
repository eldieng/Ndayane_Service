import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async getStock(produitId?: string, depotId?: string) {
    const where: any = {};
    if (produitId) where.produitId = produitId;
    if (depotId) where.depotId = depotId;

    return this.prisma.stock.findMany({
      where,
      include: { produit: true, depot: true },
    });
  }

  async getMouvements(produitId?: string, depotId?: string, type?: string) {
    const where: any = {};
    if (produitId) where.produitId = produitId;
    if (depotId) where.depotId = depotId;
    if (type) where.type = type;

    return this.prisma.mouvementStock.findMany({
      where,
      include: { produit: true, depot: true, utilisateur: { select: { nom: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async entreeStock(data: {
    produitId: string;
    depotId: string;
    quantite: number;
    motif?: string;
    utilisateurId: string;
  }) {
    if (data.quantite <= 0) throw new BadRequestException('Quantité invalide');

    return this.prisma.$transaction(async (tx) => {
      // Créer le mouvement
      const mouvement = await tx.mouvementStock.create({
        data: {
          produitId: data.produitId,
          depotId: data.depotId,
          type: 'ENTREE',
          quantite: data.quantite,
          motif: data.motif,
          utilisateurId: data.utilisateurId,
        },
      });

      // Mettre à jour le stock
      await tx.stock.upsert({
        where: { produitId_depotId: { produitId: data.produitId, depotId: data.depotId } },
        update: { quantite: { increment: data.quantite } },
        create: { produitId: data.produitId, depotId: data.depotId, quantite: data.quantite },
      });

      return mouvement;
    });
  }

  async sortieStock(data: {
    produitId: string;
    depotId: string;
    quantite: number;
    motif?: string;
    utilisateurId: string;
  }) {
    if (data.quantite <= 0) throw new BadRequestException('Quantité invalide');

    const stock = await this.prisma.stock.findUnique({
      where: { produitId_depotId: { produitId: data.produitId, depotId: data.depotId } },
    });

    if (!stock || stock.quantite < data.quantite) {
      throw new BadRequestException('Stock insuffisant');
    }

    return this.prisma.$transaction(async (tx) => {
      const mouvement = await tx.mouvementStock.create({
        data: {
          produitId: data.produitId,
          depotId: data.depotId,
          type: 'SORTIE',
          quantite: data.quantite,
          motif: data.motif,
          utilisateurId: data.utilisateurId,
        },
      });

      await tx.stock.update({
        where: { produitId_depotId: { produitId: data.produitId, depotId: data.depotId } },
        data: { quantite: { decrement: data.quantite } },
      });

      return mouvement;
    });
  }

  async transfertStock(data: {
    produitId: string;
    depotSourceId: string;
    depotDestinationId: string;
    quantite: number;
    utilisateurId: string;
  }) {
    await this.sortieStock({
      produitId: data.produitId,
      depotId: data.depotSourceId,
      quantite: data.quantite,
      motif: `Transfert vers dépôt`,
      utilisateurId: data.utilisateurId,
    });

    await this.entreeStock({
      produitId: data.produitId,
      depotId: data.depotDestinationId,
      quantite: data.quantite,
      motif: `Transfert depuis dépôt`,
      utilisateurId: data.utilisateurId,
    });

    return { success: true };
  }

  async getAlertesStockBas() {
    // Récupérer tous les produits avec leur stock total
    const produits = await this.prisma.produit.findMany({
      where: { actif: true },
      include: {
        stocks: true,
        categorie: true,
      },
    });

    // Seuil par défaut si stockMin n'est pas défini
    const seuilDefaut = 5;

    // Filtrer les produits dont le stock total est inférieur au seuil minimum
    const alertes = produits
      .map((produit) => {
        const stockTotal = produit.stocks.reduce((sum, s) => sum + s.quantite, 0);
        const seuil = produit.stockMin > 0 ? produit.stockMin : seuilDefaut;
        return {
          id: produit.id,
          nom: produit.nom,
          categorie: produit.categorie?.nom || 'Sans catégorie',
          stockActuel: stockTotal,
          stockMin: seuil,
          unite: produit.unite,
          prixAchat: produit.prixAchat,
          ecart: stockTotal - seuil,
        };
      })
      .filter((p) => p.stockActuel <= p.stockMin)
      .sort((a, b) => a.ecart - b.ecart);

    return {
      count: alertes.length,
      alertes,
    };
  }
}
