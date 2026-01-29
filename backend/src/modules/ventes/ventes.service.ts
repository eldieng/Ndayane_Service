import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class VentesService {
  constructor(private prisma: PrismaService) {}

  async findAll(statut?: string, clientId?: string) {
    const where: any = {};
    if (statut) where.statut = statut;
    if (clientId) where.clientId = clientId;

    return this.prisma.vente.findMany({
      where,
      include: {
        client: true,
        utilisateur: { select: { nom: true } },
        lignes: { include: { produit: true } },
        paiements: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPaginated(pagination: PaginationDto, statut?: string, clientId?: string): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, search } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (statut) where.statut = statut;
    if (clientId) where.clientId = clientId;
    if (search) {
      where.OR = [
        { numero: { contains: search, mode: 'insensitive' } },
        { client: { nom: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.vente.findMany({
        where,
        include: {
          client: true,
          utilisateur: { select: { nom: true } },
          lignes: { include: { produit: true } },
          paiements: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.vente.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const vente = await this.prisma.vente.findUnique({
      where: { id },
      include: {
        client: true,
        utilisateur: { select: { nom: true } },
        lignes: { include: { produit: true } },
        paiements: true,
      },
    });
    if (!vente) throw new NotFoundException('Vente non trouvée');
    return vente;
  }

  async create(data: {
    clientId?: string;
    utilisateurId: string;
    lignes: { produitId: string; quantite: number; prixUnitaire?: number; remise?: number }[];
    remise?: number;
    modePaiement?: string;
  }) {
    const numero = await this.generateNumero();
    
    // Récupérer les prix des produits si non fournis
    const produitsIds = data.lignes.map(l => l.produitId);
    const produits = await this.prisma.produit.findMany({
      where: { id: { in: produitsIds } },
      select: { id: true, prixVente: true },
    });
    const prixMap = new Map(produits.map(p => [p.id, p.prixVente]));

    let sousTotal = 0;
    const lignesData = data.lignes.map((ligne) => {
      const prixUnitaire = ligne.prixUnitaire ?? prixMap.get(ligne.produitId) ?? 0;
      const total = ligne.quantite * prixUnitaire - (ligne.remise || 0);
      sousTotal += total;
      return { ...ligne, prixUnitaire, total };
    });

    const total = sousTotal - (data.remise || 0);

    // Si un mode de paiement est fourni, la vente est directement validée (paiement en caisse)
    const statut = data.modePaiement ? 'VALIDEE' : 'EN_ATTENTE';

    // Créer la vente
    const vente = await this.prisma.vente.create({
      data: {
        numero,
        clientId: data.clientId,
        utilisateurId: data.utilisateurId,
        sousTotal,
        remise: data.remise || 0,
        total,
        statut,
        modePaiement: (data.modePaiement as any) || 'ESPECES',
        lignes: { create: lignesData },
      },
      include: { lignes: { include: { produit: true } }, client: true },
    });

    // Si la vente est validée, décrémenter le stock et créer le paiement
    if (statut === 'VALIDEE') {
      for (const ligne of lignesData) {
        // Trouver le stock du produit dans le dépôt principal
        const stock = await this.prisma.stock.findFirst({
          where: { produitId: ligne.produitId },
        });
        if (stock) {
          await this.prisma.stock.update({
            where: { id: stock.id },
            data: { quantite: { decrement: ligne.quantite } },
          });
        }
      }

      // Créer le paiement automatiquement
      await this.prisma.paiement.create({
        data: {
          venteId: vente.id,
          clientId: data.clientId,
          montant: total,
          modePaiement: (data.modePaiement as any) || 'ESPECES',
          reference: `PAY-${vente.numero}`,
        },
      });
    }

    return vente;
  }

  async valider(id: string, depotId: string) {
    const vente = await this.findOne(id);
    if (vente.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Cette vente ne peut pas être validée');
    }

    // Décrémenter le stock pour chaque ligne
    for (const ligne of vente.lignes) {
      await this.prisma.stock.update({
        where: { produitId_depotId: { produitId: ligne.produitId, depotId } },
        data: { quantite: { decrement: ligne.quantite } },
      });
    }

    return this.prisma.vente.update({
      where: { id },
      data: { statut: 'VALIDEE' },
    });
  }

  async annuler(id: string) {
    await this.findOne(id);
    return this.prisma.vente.update({
      where: { id },
      data: { statut: 'ANNULEE' },
    });
  }

  private async generateNumero(): Promise<string> {
    const date = new Date();
    const prefix = `VT${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.prisma.vente.count({
      where: { numero: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }
}
