import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { FacturesService } from './factures.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Factures')
@Controller('factures')
export class FacturesController {
  constructor(private readonly facturesService: FacturesService) {}

  @Get(':venteId/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Générer le PDF d\'une facture' })
  async generatePdf(@Param('venteId') venteId: string, @Res() res: Response) {
    const pdfBuffer = await this.facturesService.generatePdf(venteId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=facture-${venteId.slice(0, 8)}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.end(pdfBuffer);
  }

  // Endpoint public pour téléchargement via lien WhatsApp (avec token dans l'URL)
  @Get(':venteId/download/:token')
  @ApiOperation({ summary: 'Télécharger une facture (lien public temporaire)' })
  async downloadPdf(
    @Param('venteId') venteId: string,
    @Param('token') token: string,
    @Res() res: Response
  ) {
    // Vérifier le token simple (basé sur l'ID de la vente)
    // Le token est généré avec btoa() côté frontend, qui est équivalent à Buffer.from().toString('base64')
    const expectedToken = Buffer.from(venteId).toString('base64').replace(/[+/=]/g, '').slice(0, 12);
    const receivedToken = token.replace(/[+/=]/g, '');
    
    // Accepter si les 8 premiers caractères correspondent (plus flexible)
    if (receivedToken.slice(0, 8) !== expectedToken.slice(0, 8)) {
      res.status(403).json({ error: 'Lien invalide ou expiré' });
      return;
    }

    try {
      const pdfBuffer = await this.facturesService.generatePdf(venteId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=facture-${venteId.slice(0, 8)}.pdf`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.end(pdfBuffer);
    } catch (error) {
      res.status(404).json({ error: 'Facture non trouvée' });
    }
  }
}
