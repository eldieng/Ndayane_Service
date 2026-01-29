import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UtilisateursService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.utilisateur.findMany({
      select: { id: true, nom: true, email: true, role: true, actif: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id },
      select: { id: true, nom: true, email: true, role: true, actif: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async create(data: { nom: string; email: string; motDePasse: string; role?: string; actif?: boolean }) {
    const hashedPassword = await bcrypt.hash(data.motDePasse, 10);
    return this.prisma.utilisateur.create({
      data: {
        nom: data.nom,
        email: data.email,
        motDePasse: hashedPassword,
        role: (data.role as any) || 'VENDEUR',
        actif: data.actif !== undefined ? data.actif : true,
      },
      select: { id: true, nom: true, email: true, role: true, actif: true, createdAt: true },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    if (data.motDePasse) {
      data.motDePasse = await bcrypt.hash(data.motDePasse, 10);
    }
    return this.prisma.utilisateur.update({
      where: { id },
      data,
      select: { id: true, nom: true, email: true, role: true, actif: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.utilisateur.update({
      where: { id },
      data: { actif: false },
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    
    const isValid = await bcrypt.compare(currentPassword, user.motDePasse);
    if (!isValid) {
      throw new Error('Mot de passe actuel incorrect');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.utilisateur.update({
      where: { id },
      data: { motDePasse: hashedPassword },
      select: { id: true, nom: true, email: true, role: true },
    });
  }

  async removePermanent(id: string) {
    const user = await this.findOne(id);
    
    // Vérifier si l'utilisateur a des ventes associées
    const ventesCount = await this.prisma.vente.count({
      where: { utilisateurId: id },
    });
    
    if (ventesCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer cet utilisateur car il a ${ventesCount} vente(s) associée(s). Désactivez-le plutôt.`
      );
    }
    
    // Supprimer définitivement
    await this.prisma.utilisateur.delete({
      where: { id },
    });
    
    return { message: 'Utilisateur supprimé définitivement' };
  }
}
