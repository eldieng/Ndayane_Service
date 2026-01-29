import { Module } from '@nestjs/common';
import { CommandesFournisseurService } from './commandes-fournisseur.service';
import { CommandesFournisseurController } from './commandes-fournisseur.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommandesFournisseurController],
  providers: [CommandesFournisseurService],
  exports: [CommandesFournisseurService],
})
export class CommandesFournisseurModule {}
