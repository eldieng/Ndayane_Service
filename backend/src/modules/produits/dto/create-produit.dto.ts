import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsUUID, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProduitDto {
  @ApiProperty({ description: 'Nom du produit' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du produit est requis' })
  nom: string;

  @ApiPropertyOptional({ description: 'Description du produit' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Prix de vente' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @Min(0, { message: 'Le prix ne peut pas être négatif' })
  prixVente?: number;

  @ApiPropertyOptional({ description: 'Prix d\'achat' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prixAchat?: number;

  @ApiPropertyOptional({ description: 'Stock minimum pour alerte' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockMin?: number;

  @ApiPropertyOptional({ description: 'Unité de mesure' })
  @IsOptional()
  @IsString()
  unite?: string;

  @ApiPropertyOptional({ description: 'Code barre' })
  @IsOptional()
  @IsString()
  codeBarre?: string;

  @ApiPropertyOptional({ description: 'ID de la catégorie' })
  @IsOptional()
  @ValidateIf((o) => o.categorieId !== null && o.categorieId !== '')
  @IsUUID('4', { message: 'ID de catégorie invalide' })
  categorieId?: string | null;

  @ApiPropertyOptional({ description: 'Nom de la catégorie (alternative à categorieId)' })
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiPropertyOptional({ description: 'Fournisseur' })
  @IsOptional()
  @IsString()
  fournisseur?: string;
}
