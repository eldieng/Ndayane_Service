import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UtilisateursService } from './utilisateurs.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Utilisateurs')
@Controller('utilisateurs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  @Put('profile')
  @ApiOperation({ summary: 'Modifier son propre profil' })
  updateProfile(@Request() req: any, @Body() data: { nom?: string; email?: string }) {
    return this.utilisateursService.update(req.user.id, data);
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Changer son mot de passe' })
  changePassword(@Request() req: any, @Body() data: { currentPassword: string; newPassword: string }) {
    return this.utilisateursService.changePassword(req.user.id, data.currentPassword, data.newPassword);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des utilisateurs' })
  findAll() {
    return this.utilisateursService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un utilisateur' })
  findOne(@Param('id') id: string) {
    return this.utilisateursService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un utilisateur' })
  create(@Body() data: any) {
    return this.utilisateursService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un utilisateur' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.utilisateursService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactiver un utilisateur' })
  remove(@Param('id') id: string) {
    return this.utilisateursService.remove(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Supprimer définitivement un utilisateur' })
  removePermanent(@Param('id') id: string) {
    return this.utilisateursService.removePermanent(id);
  }
}
