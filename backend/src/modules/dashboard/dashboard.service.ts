import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      ventesJour,
      totalClients,
      totalProduits,
      produitsStockBas,
    ] = await Promise.all([
      this.prisma.vente.aggregate({
        where: { createdAt: { gte: today }, statut: { in: ['PAYEE', 'PARTIELLE', 'VALIDEE'] } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.client.count({ where: { actif: true } }),
      this.prisma.produit.count({ where: { actif: true } }),
      this.prisma.stock.count({
        where: { quantite: { lte: 5 } },
      }),
    ]);

    return {
      chiffreAffaires: ventesJour._sum?.total || 0,
      ventesJour: ventesJour._count || 0,
      produitsStock: totalProduits,
      alertesStock: produitsStockBas,
      clientsActifs: totalClients,
    };
  }

  async getVentesRecentes() {
    return this.prisma.vente.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { client: true, utilisateur: { select: { nom: true } } },
    });
  }

  async getProduitsPopulaires() {
    const lignes = await this.prisma.ligneVente.groupBy({
      by: ['produitId'],
      _sum: { quantite: true },
      orderBy: { _sum: { quantite: 'desc' } },
      take: 10,
    });

    const produits = await this.prisma.produit.findMany({
      where: { id: { in: lignes.map((l) => l.produitId) } },
    });

    return lignes.map((l) => ({
      produit: produits.find((p) => p.id === l.produitId),
      quantiteVendue: l._sum.quantite,
    }));
  }

  async getAlertesStock() {
    return this.prisma.stock.findMany({
      where: {
        quantite: { lte: 5 },
        produit: { actif: true },
      },
      include: { 
        produit: { select: { nom: true, stockMin: true, unite: true } },
        depot: { select: { nom: true } },
      },
      take: 20,
    });
  }

  async getVentesParJour(jours: number = 7) {
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - jours);
    dateDebut.setHours(0, 0, 0, 0);

    const ventes = await this.prisma.vente.findMany({
      where: {
        createdAt: { gte: dateDebut },
        statut: { in: ['PAYEE', 'PARTIELLE', 'VALIDEE'] },
      },
      select: { createdAt: true, total: true },
    });

    // Grouper par jour
    const parJour: Record<string, { total: number; count: number }> = {};
    for (let i = 0; i < jours; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      parJour[key] = { total: 0, count: 0 };
    }

    ventes.forEach((v) => {
      const key = v.createdAt.toISOString().split('T')[0];
      if (parJour[key]) {
        parJour[key].total += v.total || 0;
        parJour[key].count += 1;
      }
    });

    return Object.entries(parJour)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        total: data.total,
        count: data.count,
      }))
      .reverse();
  }

  async getVentesParCategorie() {
    const lignes = await this.prisma.ligneVente.findMany({
      where: {
        vente: { statut: { in: ['PAYEE', 'PARTIELLE', 'VALIDEE'] } },
      },
      include: {
        produit: { include: { categorie: true } },
      },
    });

    const parCategorie: Record<string, number> = {};
    lignes.forEach((l) => {
      const cat = l.produit?.categorie?.nom || 'Sans catégorie';
      parCategorie[cat] = (parCategorie[cat] || 0) + (l.total || 0);
    });

    return Object.entries(parCategorie)
      .map(([categorie, total]) => ({ categorie, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);
  }

  async getComparaison(jours: number = 7) {
    const now = new Date();
    const debutActuel = new Date();
    debutActuel.setDate(now.getDate() - jours);
    debutActuel.setHours(0, 0, 0, 0);

    const debutPrecedent = new Date();
    debutPrecedent.setDate(now.getDate() - jours * 2);
    debutPrecedent.setHours(0, 0, 0, 0);

    const [actuel, precedent] = await Promise.all([
      this.prisma.vente.aggregate({
        where: {
          createdAt: { gte: debutActuel },
          statut: { in: ['PAYEE', 'PARTIELLE', 'VALIDEE'] },
        },
        _sum: { total: true },
      }),
      this.prisma.vente.aggregate({
        where: {
          createdAt: { gte: debutPrecedent, lt: debutActuel },
          statut: { in: ['PAYEE', 'PARTIELLE', 'VALIDEE'] },
        },
        _sum: { total: true },
      }),
    ]);

    const totalActuel = actuel._sum?.total || 0;
    const totalPrecedent = precedent._sum?.total || 0;
    const variation = totalPrecedent > 0 
      ? ((totalActuel - totalPrecedent) / totalPrecedent) * 100 
      : 0;

    return {
      actuel: totalActuel,
      precedent: totalPrecedent,
      variation: Math.round(variation * 10) / 10,
    };
  }
}
