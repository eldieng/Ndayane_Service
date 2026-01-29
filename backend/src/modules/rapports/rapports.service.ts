import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RapportsService {
  constructor(private prisma: PrismaService) {}

  private getDateRange(periode: string) {
    const now = new Date();
    let startDate: Date;

    switch (periode) {
      case 'jour':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'semaine':
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'mois':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'annee':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    }

    return { startDate, endDate: now };
  }

  async getStats(periode: string) {
    const { startDate } = this.getDateRange(periode);

    const ventes = await this.prisma.vente.aggregate({
      where: {
        createdAt: { gte: startDate },
        statut: { in: ['PAYEE', 'VALIDEE', 'PARTIELLE'] },
      },
      _sum: { total: true },
      _count: true,
    });

    const clientsDistincts = await this.prisma.vente.findMany({
      where: {
        createdAt: { gte: startDate },
        statut: { in: ['PAYEE', 'VALIDEE', 'PARTIELLE'] },
        clientId: { not: null },
      },
      select: { clientId: true },
      distinct: ['clientId'],
    });

    const totalVentes = ventes._count || 0;
    const chiffreAffaires = ventes._sum?.total || 0;
    const panierMoyen = totalVentes > 0 ? Math.round(chiffreAffaires / totalVentes) : 0;

    return {
      totalVentes,
      chiffreAffaires,
      panierMoyen,
      nombreClients: clientsDistincts.length,
    };
  }

  async getVentesParJour(periode: string) {
    const { startDate } = this.getDateRange(periode);

    const ventes = await this.prisma.vente.findMany({
      where: {
        createdAt: { gte: startDate },
        statut: { in: ['PAYEE', 'VALIDEE', 'PARTIELLE'] },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const ventesParJour: Record<string, { total: number; count: number }> = {};

    ventes.forEach((vente) => {
      const dateKey = vente.createdAt.toISOString().split('T')[0];
      if (!ventesParJour[dateKey]) {
        ventesParJour[dateKey] = { total: 0, count: 0 };
      }
      ventesParJour[dateKey].total += vente.total;
      ventesParJour[dateKey].count += 1;
    });

    return Object.entries(ventesParJour).map(([date, data]) => ({
      date,
      total: data.total,
      count: data.count,
    }));
  }

  async getProduitsPopulaires(periode: string) {
    const { startDate } = this.getDateRange(periode);

    const lignes = await this.prisma.ligneVente.groupBy({
      by: ['produitId'],
      where: {
        vente: {
          createdAt: { gte: startDate },
          statut: { in: ['PAYEE', 'VALIDEE', 'PARTIELLE'] },
        },
      },
      _sum: { quantite: true, total: true },
      orderBy: { _sum: { quantite: 'desc' } },
      take: 10,
    });

    const produits = await this.prisma.produit.findMany({
      where: { id: { in: lignes.map((l) => l.produitId) } },
      select: { id: true, nom: true, prixVente: true },
    });

    return lignes.map((l) => ({
      produit: produits.find((p) => p.id === l.produitId),
      quantiteVendue: l._sum?.quantite || 0,
      chiffreAffaires: l._sum?.total || 0,
    }));
  }

  async getRapportVentes(periode: string, dateDebut?: string, dateFin?: string) {
    let startDate: Date;
    let endDate: Date = new Date();

    if (dateDebut && dateFin) {
      startDate = new Date(dateDebut);
      endDate = new Date(dateFin);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const range = this.getDateRange(periode);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const ventes = await this.prisma.vente.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        statut: { in: ['PAYEE', 'VALIDEE', 'PARTIELLE'] },
      },
      include: {
        client: { select: { nom: true } },
        lignes: {
          include: { produit: { select: { nom: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ventes;
  }

  async getRapportStock() {
    const stocks = await this.prisma.stock.findMany({
      include: {
        produit: {
          select: { nom: true, prixAchat: true, prixVente: true, stockMin: true, unite: true },
        },
        depot: { select: { nom: true } },
      },
      orderBy: { produit: { nom: 'asc' } },
    });

    const totalValeurAchat = stocks.reduce(
      (sum, s) => sum + s.quantite * (s.produit.prixAchat || 0),
      0,
    );
    const totalValeurVente = stocks.reduce(
      (sum, s) => sum + s.quantite * (s.produit.prixVente || 0),
      0,
    );

    return {
      stocks,
      totalValeurAchat,
      totalValeurVente,
      beneficePotentiel: totalValeurVente - totalValeurAchat,
    };
  }

  async getRapportClients(periode: string) {
    const { startDate } = this.getDateRange(periode);

    const clients = await this.prisma.client.findMany({
      where: { actif: true },
      include: {
        ventes: {
          where: {
            createdAt: { gte: startDate },
            statut: { in: ['PAYEE', 'VALIDEE', 'PARTIELLE'] },
          },
          select: { total: true },
        },
        _count: { select: { ventes: true } },
      },
    });

    return clients
      .map((client) => ({
        id: client.id,
        nom: client.nom,
        telephone: client.telephone,
        totalAchats: client.ventes.reduce((sum, v) => sum + v.total, 0),
        nombreVentes: client.ventes.length,
        solde: client.solde,
      }))
      .sort((a, b) => b.totalAchats - a.totalAchats);
  }
}
