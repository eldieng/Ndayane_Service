import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VentesService } from './ventes.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Ventes')
@Controller('ventes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VentesController {
  constructor(private readonly ventesService: VentesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des ventes avec pagination' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('statut') statut?: string,
    @Query('clientId') clientId?: string,
  ) {
    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    };
    return this.ventesService.findAllPaginated(pagination, statut, clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une vente' })
  findOne(@Param('id') id: string) {
    return this.ventesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une vente' })
  create(@Body() data: any, @Request() req: any) {
    return this.ventesService.create({ ...data, utilisateurId: req.user.id });
  }

  @Put(':id/valider')
  @ApiOperation({ summary: 'Valider une vente' })
  valider(@Param('id') id: string, @Body('depotId') depotId: string) {
    return this.ventesService.valider(id, depotId);
  }

  @Put(':id/annuler')
  @ApiOperation({ summary: 'Annuler une vente' })
  annuler(@Param('id') id: string) {
    return this.ventesService.annuler(id);
  }
}
