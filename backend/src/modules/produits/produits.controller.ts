import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProduitsService } from './produits.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Produits')
@Controller('produits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des produits avec pagination' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categorieId') categorieId?: string,
  ) {
    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    };
    return this.produitsService.findAllPaginated(pagination, categorieId);
  }

  @Get('stock-bas')
  @ApiOperation({ summary: 'Produits en stock bas' })
  getStockBas() {
    return this.produitsService.getStockBas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un produit' })
  findOne(@Param('id') id: string) {
    return this.produitsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un produit' })
  create(@Body() data: any) {
    return this.produitsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un produit' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.produitsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un produit' })
  remove(@Param('id') id: string) {
    return this.produitsService.remove(id);
  }
}
