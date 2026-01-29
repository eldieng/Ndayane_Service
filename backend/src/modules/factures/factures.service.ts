import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class FacturesService {
  constructor(private prisma: PrismaService) {}

  async generatePdf(venteId: string): Promise<Buffer> {
    const vente = await this.prisma.vente.findUnique({
      where: { id: venteId },
      include: {
        client: true,
        lignes: { include: { produit: true } },
        utilisateur: { select: { nom: true } },
      },
    });

    if (!vente) {
      throw new NotFoundException('Vente non trouvée');
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 40 });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const orange = '#f59e0b';
      const darkGray = '#1f2937';

      // ===== EN-TÊTE =====
      // Logo (si disponible)
      const logoPath = path.join(process.cwd(), '..', 'frontend', 'public', 'logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 230, 30, { width: 100 });
        doc.moveDown(4);
      }

      // Titre entreprise
      doc.y = 90;
      doc.fontSize(22).font('Helvetica-Bold').fillColor(darkGray)
        .text('QUINCAILLERIE NDAYANE SERVICES', { align: 'center' });
      
      doc.fontSize(10).font('Helvetica').fillColor('#666666');
      doc.text('Gérant : Mor FALL', { align: 'center' });
      doc.text('Tél: 77 781 89 08 | 77 766 85 36', { align: 'center' });
      doc.text('Email: morfall491@gmail.com', { align: 'center' });
      doc.text('Rue Blaise Diagne X Armand Angrand', { align: 'center' });
      
      doc.moveDown(1.5);

      // ===== BANDEAU ORANGE (Client + Date) =====
      const bandeauY = doc.y;
      doc.rect(40, bandeauY, 515, 50).fill(orange);
      
      // Infos client (gauche)
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11);
      doc.text('Client:', 55, bandeauY + 10);
      doc.font('Helvetica').text(vente.client?.nom || 'Client comptoir', 105, bandeauY + 10);
      
      if (vente.client?.telephone) {
        doc.text(`Tél: ${vente.client.telephone}`, 55, bandeauY + 28);
      }
      
      // Date (droite)
      doc.font('Helvetica-Bold').text('Date:', 400, bandeauY + 10);
      doc.font('Helvetica').text(new Date(vente.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }), 440, bandeauY + 10);

      doc.y = bandeauY + 70;

      // ===== TABLEAU DES ARTICLES =====
      const tableTop = doc.y;
      const colWidths = [250, 70, 100, 95];
      let xPos = 40;

      // En-tête du tableau (orange)
      doc.rect(40, tableTop, 515, 28).fill(orange);
      doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold');
      
      const headers = ['Article', 'Qté', 'Prix Unit.', 'Total'];
      headers.forEach((header, i) => {
        const align = i === 0 ? 'left' : 'right';
        doc.text(header, xPos + 8, tableTop + 8, { width: colWidths[i] - 16, align });
        xPos += colWidths[i];
      });

      let rowY = tableTop + 28;

      // Lignes du tableau
      vente.lignes.forEach((ligne, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(40, rowY, 515, 28).fill(bgColor);
        
        xPos = 40;
        doc.fillColor(darkGray).font('Helvetica').fontSize(10);
        
        // Article
        doc.text(ligne.produit?.nom || 'Produit', xPos + 8, rowY + 8, { width: colWidths[0] - 16 });
        xPos += colWidths[0];
        
        // Quantité
        doc.text(`${ligne.quantite}`, xPos + 8, rowY + 8, { width: colWidths[1] - 16, align: 'right' });
        xPos += colWidths[1];
        
        // Prix unitaire
        doc.text(`${(ligne.prixUnitaire || 0).toLocaleString('fr-FR')} F`, xPos + 8, rowY + 8, { width: colWidths[2] - 16, align: 'right' });
        xPos += colWidths[2];
        
        // Total ligne (orange)
        doc.fillColor(orange).font('Helvetica-Bold');
        doc.text(`${(ligne.total || 0).toLocaleString('fr-FR')} F`, xPos + 8, rowY + 8, { width: colWidths[3] - 16, align: 'right' });
        
        rowY += 28;
      });

      // Ligne de séparation
      doc.rect(40, rowY, 515, 3).fill(orange);
      rowY += 20;

      // ===== TOTAL =====
      // Remise si applicable
      if (vente.remise && vente.remise > 0) {
        doc.fillColor('#666666').font('Helvetica').fontSize(10);
        doc.text('Sous-total:', 350, rowY);
        doc.text(`${((vente.total || 0) + vente.remise).toLocaleString('fr-FR')} F`, 450, rowY, { width: 105, align: 'right' });
        rowY += 20;
        
        doc.fillColor(orange).text('Remise:', 350, rowY);
        doc.text(`-${vente.remise.toLocaleString('fr-FR')} F`, 450, rowY, { width: 105, align: 'right' });
        rowY += 25;
      }

      // Bandeau TOTAL
      doc.rect(330, rowY, 225, 40).fill(orange);
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(14);
      doc.text('TOTAL:', 345, rowY + 12);
      doc.fontSize(16).text(`${(vente.total || 0).toLocaleString('fr-FR')} FCFA`, 420, rowY + 11, { width: 120, align: 'right' });

      // ===== PIED DE PAGE =====
      doc.fillColor('#999999').font('Helvetica').fontSize(9);
      doc.text('Merci pour votre confiance !', 40, 760, { align: 'center', width: 515 });
      doc.text('À bientôt chez Ndayane Services', 40, 775, { align: 'center', width: 515 });

      doc.end();
    });
  }
}
