import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommandesFournisseurService } from './commandes-fournisseur.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Commandes Fournisseur')
@Controller('commandes-fournisseur')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommandesFournisseurController {
  constructor(private readonly commandesFournisseurService: CommandesFournisseurService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des commandes fournisseur' })
  findAll(
    @Query('fournisseurId') fournisseurId?: string,
    @Query('statut') statut?: string,
  ) {
    return this.commandesFournisseurService.findAll(fournisseurId, statut);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une commande fournisseur' })
  findOne(@Param('id') id: string) {
    return this.commandesFournisseurService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une commande fournisseur' })
  create(@Body() data: any) {
    return this.commandesFournisseurService.create(data);
  }

  @Put(':id/statut')
  @ApiOperation({ summary: 'Modifier le statut d\'une commande' })
  updateStatut(@Param('id') id: string, @Body() data: { statut: string }) {
    return this.commandesFournisseurService.updateStatut(id, data.statut);
  }

  @Put(':id/receptionner')
  @ApiOperation({ summary: 'Réceptionner une commande fournisseur' })
  receptionner(
    @Param('id') id: string,
    @Body() data: { lignes: { ligneId: string; quantiteRecue: number }[] },
  ) {
    return this.commandesFournisseurService.receptionner(id, data.lignes);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une commande fournisseur' })
  remove(@Param('id') id: string) {
    return this.commandesFournisseurService.remove(id);
  }
}
