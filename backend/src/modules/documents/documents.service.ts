import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    type: 'DEVIS' | 'BON_COMMANDE';
    clientId?: string;
    clientNom?: string;
    clientTel?: string;
    validite?: number;
    dateLivraison?: string;
    vendeur?: string;
    notes?: string;
    lignes: {
      produitId?: string;
      designation: string;
      quantite: number;
      prixUnitaire: number;
    }[];
  }) {
    const prefix = data.type === 'DEVIS' ? 'DEV' : 'BC';
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    
    // Générer un numéro unique
    const count = await this.prisma.document.count({
      where: {
        numero: { startsWith: `${prefix}-${dateStr}` }
      }
    });
    const numero = `${prefix}-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    // Calculer le total
    const total = data.lignes.reduce((sum, l) => sum + (l.quantite * l.prixUnitaire), 0);

    return this.prisma.document.create({
      data: {
        numero,
        type: data.type,
        clientId: data.clientId || null,
        clientNom: data.clientNom,
        clientTel: data.clientTel,
        validite: data.validite,
        dateLivraison: data.dateLivraison ? new Date(data.dateLivraison) : null,
        vendeur: data.vendeur,
        notes: data.notes,
        total,
        lignes: {
          create: data.lignes.map(l => ({
            produitId: l.produitId || null,
            designation: l.designation,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
            total: l.quantite * l.prixUnitaire,
          })),
        },
      },
      include: {
        client: true,
        lignes: true,
      },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    type?: 'DEVIS' | 'BON_COMMANDE';
    search?: string;
    clientId?: string;
  }) {
    const { page = 1, limit = 20, type, search, clientId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (clientId) where.clientId = clientId;
    if (search) {
      where.OR = [
        { numero: { contains: search, mode: 'insensitive' } },
        { clientNom: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          lignes: true,
        },
      }),
      this.prisma.document.count({ where }),
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
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        client: true,
        lignes: true,
      },
    });
  }

  async updateStatut(id: string, statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE' | 'CONVERTI' | 'EXPIRE') {
    return this.prisma.document.update({
      where: { id },
      data: { statut },
    });
  }

  async update(id: string, data: {
    clientNom?: string;
    clientTel?: string;
    vendeur?: string;
    notes?: string;
    validite?: number;
    dateLivraison?: string;
  }) {
    return this.prisma.document.update({
      where: { id },
      data: {
        clientNom: data.clientNom,
        clientTel: data.clientTel,
        vendeur: data.vendeur,
        notes: data.notes,
        validite: data.validite,
        dateLivraison: data.dateLivraison ? new Date(data.dateLivraison) : null,
      },
      include: {
        client: true,
        lignes: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.document.delete({
      where: { id },
    });
  }
}
