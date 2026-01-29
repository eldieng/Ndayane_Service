import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Stock')
@Controller('stock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @ApiOperation({ summary: 'État du stock' })
  getStock(@Query('produitId') produitId?: string, @Query('depotId') depotId?: string) {
    return this.stockService.getStock(produitId, depotId);
  }

  @Get('mouvements')
  @ApiOperation({ summary: 'Historique des mouvements' })
  getMouvements(
    @Query('produitId') produitId?: string,
    @Query('depotId') depotId?: string,
    @Query('type') type?: string,
  ) {
    return this.stockService.getMouvements(produitId, depotId, type);
  }

  @Post('entree')
  @ApiOperation({ summary: 'Entrée de stock' })
  entreeStock(@Body() data: any, @Request() req: any) {
    return this.stockService.entreeStock({ ...data, utilisateurId: req.user.id });
  }

  @Post('sortie')
  @ApiOperation({ summary: 'Sortie de stock' })
  sortieStock(@Body() data: any, @Request() req: any) {
    return this.stockService.sortieStock({ ...data, utilisateurId: req.user.id });
  }

  @Post('transfert')
  @ApiOperation({ summary: 'Transfert entre dépôts' })
  transfertStock(@Body() data: any, @Request() req: any) {
    return this.stockService.transfertStock({ ...data, utilisateurId: req.user.id });
  }

  @Get('alertes')
  @ApiOperation({ summary: 'Alertes de stock bas' })
  getAlertesStockBas() {
    return this.stockService.getAlertesStockBas();
  }
}
