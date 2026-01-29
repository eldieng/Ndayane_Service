import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LigneVenteDto {
  @ApiProperty({ description: 'ID du produit' })
  @IsUUID('4', { message: 'ID de produit invalide' })
  produitId: string;

  @ApiProperty({ description: 'Quantité' })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'La quantité doit être au moins 1' })
  quantite: number;

  @ApiPropertyOptional({ description: 'Prix unitaire (optionnel, utilise le prix du produit par défaut)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prixUnitaire?: number;
}

export enum ModePaiement {
  ESPECES = 'ESPECES',
  WAVE = 'WAVE',
  ORANGE_MONEY = 'ORANGE_MONEY',
  CARTE_BANCAIRE = 'CARTE_BANCAIRE',
  CHEQUE = 'CHEQUE',
  CREDIT = 'CREDIT',
}

export class CreateVenteDto {
  @ApiPropertyOptional({ description: 'ID du client (optionnel pour vente comptoir)' })
  @IsOptional()
  @IsUUID('4', { message: 'ID de client invalide' })
  clientId?: string;

  @ApiProperty({ description: 'Liste des articles', type: [LigneVenteDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneVenteDto)
  lignes: LigneVenteDto[];

  @ApiPropertyOptional({ description: 'Remise en FCFA' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'La remise ne peut pas être négative' })
  remise?: number;

  @ApiPropertyOptional({ description: 'Mode de paiement', enum: ModePaiement })
  @IsOptional()
  @IsEnum(ModePaiement, { message: 'Mode de paiement invalide' })
  modePaiement?: ModePaiement;

  @ApiPropertyOptional({ description: 'Notes ou commentaires' })
  @IsOptional()
  @IsString()
  notes?: string;
}
