import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ProduitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, categorieId?: string) {
    const where: any = { actif: true };

    if (search) {
      where.nom = { contains: search, mode: 'insensitive' };
    }

    if (categorieId) {
      where.categorieId = categorieId;
    }

    return this.prisma.produit.findMany({
      where,
      include: {
        categorie: true,
        stocks: {
          include: { depot: true },
        },
      },
      orderBy: { nom: 'asc' },
    });
  }

  async findAllPaginated(pagination: PaginationDto, categorieId?: string): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, search } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { actif: true };

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { codeBarre: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categorieId) {
      where.categorieId = categorieId;
    }

    const [data, total] = await Promise.all([
      this.prisma.produit.findMany({
        where,
        include: {
          categorie: true,
          stocks: { include: { depot: true } },
        },
        orderBy: { nom: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.produit.count({ where }),
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
    const produit = await this.prisma.produit.findUnique({
      where: { id },
      include: {
        categorie: true,
        stocks: {
          include: { depot: true },
        },
      },
    });

    if (!produit) {
      throw new NotFoundException('Produit non trouvé');
    }

    return produit;
  }

  async create(data: {
    nom: string;
    categorieId?: string | null;
    categorie?: string;
    unite?: string;
    prixAchat?: number;
    prixVente?: number;
    stockMin?: number;
    fournisseur?: string;
  }) {
    // Vérifier si un produit avec le même nom existe déjà
    const existingByName = await this.prisma.produit.findFirst({
      where: { nom: { equals: data.nom, mode: 'insensitive' }, actif: true },
    });
    if (existingByName) {
      throw new BadRequestException(`Un produit avec le nom "${data.nom}" existe déjà`);
    }

    // Si le nom de la catégorie est fourni, trouver ou créer la catégorie
    let categorieId = data.categorieId || null;
    if (!categorieId && data.categorie) {
      const categorie = await this.prisma.categorie.findFirst({
        where: { nom: { equals: data.categorie, mode: 'insensitive' } },
      });
      if (categorie) {
        categorieId = categorie.id;
      } else {
        // Créer la catégorie si elle n'existe pas
        const newCategorie = await this.prisma.categorie.create({
          data: { nom: data.categorie },
        });
        categorieId = newCategorie.id;
      }
    }

    return this.prisma.produit.create({
      data: {
        nom: data.nom,
        categorieId,
        unite: data.unite || 'pièce',
        prixAchat: data.prixAchat || 0,
        prixVente: data.prixVente || 0,
        stockMin: data.stockMin || 0,
        fournisseur: data.fournisseur || null,
      },
      include: { categorie: true },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.produit.update({
      where: { id },
      data,
      include: { categorie: true, stocks: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.produit.update({
      where: { id },
      data: { actif: false },
    });
  }

  async getStockBas() {
    return this.prisma.produit.findMany({
      where: {
        actif: true,
        stocks: {
          some: {
            quantite: { lte: this.prisma.produit.fields.stockMin as any },
          },
        },
      },
      include: {
        categorie: true,
        stocks: true,
      },
    });
  }
}
