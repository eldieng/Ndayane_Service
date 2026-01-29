import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un document (devis ou bon de commande)' })
  create(@Body() data: any) {
    return this.documentsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des documents avec pagination' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: 'DEVIS' | 'BON_COMMANDE',
    @Query('search') search?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.documentsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      type,
      search,
      clientId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un document' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Put(':id/statut')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un document' })
  updateStatut(
    @Param('id') id: string,
    @Body('statut') statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE' | 'CONVERTI' | 'EXPIRE',
  ) {
    return this.documentsService.updateStatut(id, statut);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un document' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.documentsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un document' })
  delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }
}
