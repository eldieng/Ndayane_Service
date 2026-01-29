import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RapportsService } from './rapports.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Rapports')
@Controller('rapports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RapportsController {
  constructor(private readonly rapportsService: RapportsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques générales' })
  getStats(@Query('periode') periode: string = 'semaine') {
    return this.rapportsService.getStats(periode);
  }

  @Get('ventes-par-jour')
  @ApiOperation({ summary: 'Ventes par jour' })
  getVentesParJour(@Query('periode') periode: string = 'semaine') {
    return this.rapportsService.getVentesParJour(periode);
  }

  @Get('produits-populaires')
  @ApiOperation({ summary: 'Produits les plus vendus' })
  getProduitsPopulaires(@Query('periode') periode: string = 'semaine') {
    return this.rapportsService.getProduitsPopulaires(periode);
  }

  @Get('ventes')
  @ApiOperation({ summary: 'Rapport détaillé des ventes' })
  getRapportVentes(
    @Query('periode') periode: string = 'semaine',
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.rapportsService.getRapportVentes(periode, dateDebut, dateFin);
  }

  @Get('stock')
  @ApiOperation({ summary: 'Rapport inventaire' })
  getRapportStock() {
    return this.rapportsService.getRapportStock();
  }

  @Get('clients')
  @ApiOperation({ summary: 'Rapport clients' })
  getRapportClients(@Query('periode') periode: string = 'semaine') {
    return this.rapportsService.getRapportClients(periode);
  }
}
