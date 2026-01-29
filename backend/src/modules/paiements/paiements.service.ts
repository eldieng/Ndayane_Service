import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaiementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(venteId?: string, clientId?: string, typePaiement?: string) {
    const where: any = {};
    if (venteId) where.venteId = venteId;
    if (clientId) where.clientId = clientId;
    if (typePaiement) where.typePaiement = typePaiement;

    return this.prisma.paiement.findMany({
      where,
      include: { 
        vente: {
          include: { client: true }
        }, 
        client: true 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Récupérer les acomptes d'un client
  async getAcomptesClient(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, nom: true, solde: true },
    });

    const acomptes = await this.prisma.paiement.findMany({
      where: { clientId, typePaiement: 'ACOMPTE' },
      orderBy: { createdAt: 'desc' },
    });

    return {
      client,
      creditDisponible: client ? Math.abs(Math.min(0, client.solde)) : 0,
      acomptes,
    };
  }

  // Enregistrer un acompte client
  async createAcompte(data: {
    clientId: string;
    montant: number;
    modePaiement: string;
    reference?: string;
    notes?: string;
  }) {
    if (!data.clientId) {
      throw new BadRequestException('Un client est requis pour un acompte');
    }

    if (data.montant <= 0) {
      throw new BadRequestException('Le montant doit être positif');
    }

    const paiement = await this.prisma.paiement.create({
      data: {
        clientId: data.clientId,
        montant: data.montant,
        modePaiement: data.modePaiement as any,
        typePaiement: 'ACOMPTE',
        reference: data.reference,
        notes: data.notes || 'Acompte client',
      },
      include: { client: true },
    });

    // Diminuer le solde client (solde négatif = crédit disponible)
    await this.prisma.client.update({
      where: { id: data.clientId },
      data: { solde: { decrement: data.montant } },
    });

    return paiement;
  }

  // Utiliser le crédit client pour une vente
  async utiliserCredit(data: {
    clientId: string;
    venteId: string;
    montant: number;
  }) {
    const client = await this.prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new BadRequestException('Client non trouvé');
    }

    const creditDisponible = Math.abs(Math.min(0, client.solde));
    if (data.montant > creditDisponible) {
      throw new BadRequestException(`Crédit insuffisant. Disponible: ${creditDisponible} FCFA`);
    }

    // Créer le paiement lié à la vente
    const paiement = await this.prisma.paiement.create({
      data: {
        venteId: data.venteId,
        clientId: data.clientId,
        montant: data.montant,
        modePaiement: 'CREDIT',
        typePaiement: 'REGLEMENT',
        notes: 'Paiement par crédit client',
      },
    });

    // Augmenter le solde client (utilisation du crédit)
    await this.prisma.client.update({
      where: { id: data.clientId },
      data: { solde: { increment: data.montant } },
    });

    // Mettre à jour le statut de la vente
    await this.updateVenteStatut(data.venteId);

    return paiement;
  }

  async create(data: {
    venteId?: string;
    clientId?: string;
    montant: number;
    modePaiement: string;
    typePaiement?: string;
    reference?: string;
    notes?: string;
  }) {
    const paiement = await this.prisma.paiement.create({
      data: {
        venteId: data.venteId,
        clientId: data.clientId,
        montant: data.montant,
        modePaiement: data.modePaiement as any,
        typePaiement: (data.typePaiement as any) || 'REGLEMENT',
        reference: data.reference,
        notes: data.notes,
      },
    });

    // Mettre à jour le statut de la vente si applicable
    if (data.venteId) {
      await this.updateVenteStatut(data.venteId);
    }

    // Mettre à jour le solde client si applicable (pour les règlements de dette)
    if (data.clientId && !data.venteId && data.typePaiement !== 'ACOMPTE') {
      await this.prisma.client.update({
        where: { id: data.clientId },
        data: { solde: { decrement: data.montant } },
      });
    }

    return paiement;
  }

  private async updateVenteStatut(venteId: string) {
    const vente = await this.prisma.vente.findUnique({
      where: { id: venteId },
      include: { paiements: true },
    });

    if (vente) {
      const totalPaye = vente.paiements.reduce((sum, p) => sum + p.montant, 0);
      let statut: string;
      
      if (totalPaye >= vente.total) {
        statut = 'PAYEE';
      } else if (totalPaye > 0) {
        statut = 'PARTIELLE';
      } else {
        statut = vente.statut;
      }
      
      await this.prisma.vente.update({
        where: { id: venteId },
        data: { statut: statut as any },
      });
    }
  }
}
