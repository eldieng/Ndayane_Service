import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepotsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.depot.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: { stocks: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const depot = await this.prisma.depot.findUnique({
      where: { id },
      include: { stocks: { include: { produit: true } } },
    });
    if (!depot) throw new NotFoundException('Dépôt non trouvé');
    return depot;
  }

  async create(data: { nom: string; localisation?: string; principal?: boolean }) {
    return this.prisma.depot.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.depot.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.depot.update({ where: { id }, data: { actif: false } });
  }
}
