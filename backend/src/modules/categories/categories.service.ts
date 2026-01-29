import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.categorie.findMany({
      include: { _count: { select: { produits: true } } },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string) {
    const categorie = await this.prisma.categorie.findUnique({
      where: { id },
      include: { produits: true },
    });
    if (!categorie) throw new NotFoundException('Catégorie non trouvée');
    return categorie;
  }

  async create(data: { nom: string }) {
    try {
      return await this.prisma.categorie.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Une catégorie avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async update(id: string, data: { nom: string }) {
    await this.findOne(id);
    return this.prisma.categorie.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.categorie.delete({ where: { id } });
  }
}
