import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommandesService } from './commandes.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Commandes')
@Controller('commandes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des commandes' })
  findAll(@Query('statut') statut?: string, @Query('clientId') clientId?: string) {
    return this.commandesService.findAll(statut, clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une commande' })
  findOne(@Param('id') id: string) {
    return this.commandesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une commande' })
  create(@Body() data: any) {
    return this.commandesService.create(data);
  }

  @Put(':id/statut')
  @ApiOperation({ summary: 'Changer le statut d\'une commande' })
  updateStatut(@Param('id') id: string, @Body('statut') statut: string) {
    return this.commandesService.updateStatut(id, statut);
  }
}
