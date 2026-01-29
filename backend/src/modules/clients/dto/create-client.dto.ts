import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TypeClient {
  PARTICULIER = 'PARTICULIER',
  PROFESSIONNEL = 'PROFESSIONNEL',
  ENTREPRISE = 'ENTREPRISE',
  CHANTIER = 'CHANTIER',
}

export class CreateClientDto {
  @ApiProperty({ description: 'Nom du client' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du client est requis' })
  nom: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ description: 'Adresse email' })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @ApiPropertyOptional({ description: 'Adresse' })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({ description: 'Type de client', enum: TypeClient })
  @IsOptional()
  @IsString()
  typeClient?: string;

  @ApiPropertyOptional({ description: 'Plafond de crédit' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  plafondCredit?: number;
}
