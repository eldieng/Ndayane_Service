import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FournisseursService } from './fournisseurs.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Fournisseurs')
@Controller('fournisseurs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FournisseursController {
  constructor(private readonly fournisseursService: FournisseursService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des fournisseurs' })
  findAll(@Query('search') search?: string) {
    return this.fournisseursService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un fournisseur' })
  findOne(@Param('id') id: string) {
    return this.fournisseursService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un fournisseur' })
  create(@Body() data: any) {
    return this.fournisseursService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un fournisseur' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.fournisseursService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactiver un fournisseur' })
  remove(@Param('id') id: string) {
    return this.fournisseursService.remove(id);
  }
}
