import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    const where: any = { actif: true };
    
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' as const } },
        { telephone: { contains: search } },
      ];
    }

    return this.prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPaginated(pagination: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, search } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { actif: true };
    
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' as const } },
        { telephone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.client.count({ where }),
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
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        ventes: { take: 10, orderBy: { createdAt: 'desc' } },
        commandes: { take: 10, orderBy: { createdAt: 'desc' } },
        paiements: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!client) {
      throw new NotFoundException('Client non trouvé');
    }

    return client;
  }

  async create(data: {
    nom: string;
    telephone?: string;
    adresse?: string;
    typeClient?: string;
    plafondCredit?: number;
  }) {
    return this.prisma.client.create({
      data: {
        nom: data.nom,
        telephone: data.telephone,
        adresse: data.adresse,
        typeClient: (data.typeClient as any) || 'PARTICULIER',
        plafondCredit: data.plafondCredit || 0,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    // Filtrer les champs valides pour éviter les erreurs Prisma
    const { nom, telephone, adresse, typeClient, plafondCredit, actif } = data;
    return this.prisma.client.update({
      where: { id },
      data: {
        ...(nom !== undefined && { nom }),
        ...(telephone !== undefined && { telephone }),
        ...(adresse !== undefined && { adresse }),
        ...(typeClient !== undefined && { typeClient: typeClient as any }),
        ...(plafondCredit !== undefined && { plafondCredit }),
        ...(actif !== undefined && { actif }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.update({
      where: { id },
      data: { actif: false },
    });
  }
}
