import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumberString,
  Length,
  IsNumber,
} from 'class-validator';

export class UpdateEmpreendimentoDto {
  @ApiPropertyOptional({
    description: 'Nome do empreendimento',
    example: 'Residencial Alpha',
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({
    description: 'CNPJ do empreendimento (14 dígitos)',
    example: '12345678000195',
  })
  @IsOptional()
  @IsNumberString()
  @Length(14, 14)
  cnpj?: string;

  @ApiPropertyOptional({
    description: 'Tipo do empreendimento',
    example: 'Residencial',
  })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Cidade do empreendimento',
    example: 'São Paulo',
  })
  @IsOptional()
  @IsString()
  cidade?: string;

  @ApiPropertyOptional({
    description: 'Estado (UF) do empreendimento',
    example: 'SP',
    minLength: 2,
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  uf?: string;

  @ApiPropertyOptional({
    description: 'Data prevista para entrega',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  entregaData?: Date;

  @ApiPropertyOptional({ description: 'Data do cheque', example: '2024-06-15' })
  @IsOptional()
  @IsString()
  chequeData?: string;

  @ApiPropertyOptional({
    description: 'FRE - Custos de obra',
    example: 10000000.0,
  })
  @IsOptional()
  @IsNumber()
  custoObra?: number;

  @ApiPropertyOptional({
    description: 'FRE - Custos Adicionais',
    example: 10000000.0,
  })
  @IsOptional()
  @IsNumber()
  custosAdicionais?: number;

  @ApiPropertyOptional({
    description: 'FRE - Custos de terreno',
    example: 10000000.0,
  })
  @IsOptional()
  @IsNumber()
  custoTerreno?: number;

  @ApiPropertyOptional({
    description: 'Valor do cheque associado ao empreendimento',
    example: 10000000.0,
  })
  @IsOptional()
  @IsNumber()
  chequeValor?: number;

  @ApiPropertyOptional({
    description: 'Valor do orçamento executivo associado ao empreendimento',
    example: 10000000.0,
  })
  @IsOptional()
  @IsNumber()
  orcamentoExecutivo?: number;
}
