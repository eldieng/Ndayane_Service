import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  
  constructor(private prisma: PrismaService) {}

  async sendSms(telephone: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Normaliser le numéro de téléphone (format Sénégal)
      const phoneNumber = this.normalizePhone(telephone);
      
      if (!phoneNumber) {
        return { success: false, error: 'Numéro de téléphone invalide' };
      }

      // Ici, intégrer l'API SMS de votre choix (Orange, Twilio, etc.)
      // Pour l'instant, on simule l'envoi et on log
      this.logger.log(`SMS envoyé à ${phoneNumber}: ${message.substring(0, 50)}...`);
      
      // Log de l'envoi (la table smsLog n'existe pas encore)
      // TODO: Créer la table SmsLog dans le schéma Prisma si nécessaire

      // TODO: Remplacer par l'appel API réel
      // Exemple avec Orange SMS API:
      // const response = await fetch('https://api.orange.com/smsmessaging/v1/outbound/...', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${process.env.ORANGE_SMS_TOKEN}` },
      //   body: JSON.stringify({ ... })
      // });

      return { success: true };
    } catch (error) {
      this.logger.error(`Erreur envoi SMS: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendFactureSms(venteId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const vente = await this.prisma.vente.findUnique({
        where: { id: venteId },
        include: {
          client: true,
          lignes: { include: { produit: true } },
        },
      });

      if (!vente) {
        return { success: false, error: 'Vente non trouvée' };
      }

      if (!vente.client?.telephone) {
        return { success: false, error: 'Le client n\'a pas de numéro de téléphone' };
      }

      // Construire le message SMS
      const message = this.buildFactureMessage(vente);
      
      return this.sendSms(vente.client.telephone, message);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private buildFactureMessage(vente: any): string {
    const lignesResume = vente.lignes.slice(0, 3).map((l: any) => 
      `${l.produit.nom}: ${l.quantite}x${l.prixUnitaire}F`
    ).join(', ');
    
    const autresArticles = vente.lignes.length > 3 ? ` +${vente.lignes.length - 3} autres` : '';
    
    return `NDAYANE SERVICES
Facture N°${vente.numero || vente.id.slice(0, 8)}
${lignesResume}${autresArticles}
Total: ${vente.total?.toLocaleString()}F
Merci de votre confiance!
Tel: 77 781 89 08`;
  }

  private normalizePhone(phone: string): string | null {
    if (!phone) return null;
    
    // Supprimer espaces et caractères spéciaux
    let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
    
    // Format Sénégal
    if (cleaned.startsWith('00221')) {
      cleaned = '+221' + cleaned.slice(5);
    } else if (cleaned.startsWith('221')) {
      cleaned = '+221' + cleaned.slice(3);
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
      cleaned = '+221' + cleaned;
    } else if (cleaned.startsWith('07') && cleaned.length === 10) {
      cleaned = '+221' + cleaned.slice(1);
    }
    
    // Valider le format final
    if (!/^\+221[0-9]{9}$/.test(cleaned)) {
      return null;
    }
    
    return cleaned;
  }

  async sendRappelPaiement(clientId: string, montant: number): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client?.telephone) {
        return { success: false, error: 'Client sans numéro de téléphone' };
      }

      const message = `NDAYANE SERVICES
Rappel: Vous avez un solde de ${montant.toLocaleString()}F à régler.
Merci de passer nous voir.
Tel: 77 781 89 08`;

      return this.sendSms(client.telephone, message);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
