import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques générales' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('ventes-recentes')
  @ApiOperation({ summary: 'Ventes récentes' })
  getVentesRecentes() {
    return this.dashboardService.getVentesRecentes();
  }

  @Get('produits-populaires')
  @ApiOperation({ summary: 'Produits les plus vendus' })
  getProduitsPopulaires() {
    return this.dashboardService.getProduitsPopulaires();
  }

  @Get('alertes-stock')
  @ApiOperation({ summary: 'Alertes stock bas' })
  getAlertesStock() {
    return this.dashboardService.getAlertesStock();
  }

  @Get('ventes-par-jour')
  @ApiOperation({ summary: 'Ventes par jour pour graphique' })
  getVentesParJour(@Query('jours') jours?: string) {
    return this.dashboardService.getVentesParJour(jours ? parseInt(jours) : 7);
  }

  @Get('ventes-par-categorie')
  @ApiOperation({ summary: 'Ventes par catégorie pour graphique' })
  getVentesParCategorie() {
    return this.dashboardService.getVentesParCategorie();
  }

  @Get('comparaison')
  @ApiOperation({ summary: 'Comparaison période actuelle vs précédente' })
  getComparaison(@Query('jours') jours?: string) {
    return this.dashboardService.getComparaison(jours ? parseInt(jours) : 7);
  }
}
