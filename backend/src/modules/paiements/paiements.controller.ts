import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaiementsService } from './paiements.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Paiements')
@Controller('paiements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaiementsController {
  constructor(private readonly paiementsService: PaiementsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des paiements' })
  findAll(
    @Query('venteId') venteId?: string,
    @Query('clientId') clientId?: string,
    @Query('typePaiement') typePaiement?: string,
  ) {
    return this.paiementsService.findAll(venteId, clientId, typePaiement);
  }

  @Get('acomptes/:clientId')
  @ApiOperation({ summary: 'Acomptes et crédit d\'un client' })
  getAcomptesClient(@Param('clientId') clientId: string) {
    return this.paiementsService.getAcomptesClient(clientId);
  }

  @Post()
  @ApiOperation({ summary: 'Enregistrer un paiement' })
  create(@Body() data: any) {
    return this.paiementsService.create(data);
  }

  @Post('acompte')
  @ApiOperation({ summary: 'Enregistrer un acompte client' })
  createAcompte(@Body() data: any) {
    return this.paiementsService.createAcompte(data);
  }

  @Post('utiliser-credit')
  @ApiOperation({ summary: 'Utiliser le crédit client pour une vente' })
  utiliserCredit(@Body() data: any) {
    return this.paiementsService.utiliserCredit(data);
  }
}
