import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommandesService {
  constructor(private prisma: PrismaService) {}

  async findAll(statut?: string, clientId?: string) {
    const where: any = {};
    if (statut) where.statut = statut;
    if (clientId) where.clientId = clientId;

    return this.prisma.commande.findMany({
      where,
      include: { client: true, lignes: { include: { produit: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const commande = await this.prisma.commande.findUnique({
      where: { id },
      include: { client: true, lignes: { include: { produit: true } } },
    });
    if (!commande) throw new NotFoundException('Commande non trouvée');
    return commande;
  }

  async create(data: {
    clientId: string;
    dateRetrait?: Date;
    lignes: { produitId: string; quantite: number; prixUnitaire: number }[];
  }) {
    const numero = await this.generateNumero();
    const total = data.lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0);

    return this.prisma.commande.create({
      data: {
        numero,
        clientId: data.clientId,
        dateRetrait: data.dateRetrait,
        total,
        lignes: { create: data.lignes },
      },
      include: { client: true, lignes: { include: { produit: true } } },
    });
  }

  async updateStatut(id: string, statut: string) {
    await this.findOne(id);
    return this.prisma.commande.update({
      where: { id },
      data: { statut: statut as any },
    });
  }

  private async generateNumero(): Promise<string> {
    const date = new Date();
    const prefix = `CMD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.prisma.commande.count({
      where: { numero: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }
}
