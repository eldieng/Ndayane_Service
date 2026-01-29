import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepotsService } from './depots.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Dépôts')
@Controller('depots')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepotsController {
  constructor(private readonly depotsService: DepotsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des dépôts' })
  findAll() {
    return this.depotsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un dépôt' })
  findOne(@Param('id') id: string) {
    return this.depotsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un dépôt' })
  create(@Body() data: { nom: string; localisation?: string; principal?: boolean }) {
    return this.depotsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un dépôt' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.depotsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un dépôt' })
  remove(@Param('id') id: string) {
    return this.depotsService.remove(id);
  }
}
