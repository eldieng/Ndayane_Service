import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UtilisateursModule } from './modules/utilisateurs/utilisateurs.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProduitsModule } from './modules/produits/produits.module';
import { DepotsModule } from './modules/depots/depots.module';
import { StockModule } from './modules/stock/stock.module';
import { VentesModule } from './modules/ventes/ventes.module';
import { CommandesModule } from './modules/commandes/commandes.module';
import { PaiementsModule } from './modules/paiements/paiements.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RapportsModule } from './modules/rapports/rapports.module';
import { FournisseursModule } from './modules/fournisseurs/fournisseurs.module';
import { CommandesFournisseurModule } from './modules/commandes-fournisseur/commandes-fournisseur.module';
import { SmsModule } from './modules/sms/sms.module';
import { FacturesModule } from './modules/factures/factures.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UtilisateursModule,
    ClientsModule,
    CategoriesModule,
    ProduitsModule,
    DepotsModule,
    StockModule,
    VentesModule,
    CommandesModule,
    PaiementsModule,
    DashboardModule,
    RapportsModule,
    FournisseursModule,
    CommandesFournisseurModule,
    SmsModule,
    FacturesModule,
    DocumentsModule,
  ],
})
export class AppModule {}
