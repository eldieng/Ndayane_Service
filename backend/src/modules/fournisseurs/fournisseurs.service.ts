import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FournisseursService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    const where: any = { actif: true };
    
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' as const } },
        { telephone: { contains: search } },
      ];
    }

    return this.prisma.fournisseur.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { commandesFournisseur: true } },
      },
    });
  }

  async findOne(id: string) {
    const fournisseur = await this.prisma.fournisseur.findUnique({
      where: { id },
      include: {
        commandesFournisseur: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!fournisseur) {
      throw new NotFoundException('Fournisseur non trouvé');
    }

    return fournisseur;
  }

  async create(data: {
    nom: string;
    telephone?: string;
    email?: string;
    adresse?: string;
  }) {
    return this.prisma.fournisseur.create({
      data: {
        nom: data.nom,
        telephone: data.telephone,
        email: data.email,
        adresse: data.adresse,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const { nom, telephone, email, adresse, actif } = data;
    return this.prisma.fournisseur.update({
      where: { id },
      data: {
        ...(nom !== undefined && { nom }),
        ...(telephone !== undefined && { telephone }),
        ...(email !== undefined && { email }),
        ...(adresse !== undefined && { adresse }),
        ...(actif !== undefined && { actif }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.fournisseur.update({
      where: { id },
      data: { actif: false },
    });
  }
}
