import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumberString,
  Length,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateEmpreendimentoDto {
  @ApiProperty({
    description: 'ID do empreendimento no Sienge',
    example: 11,
  })
  @IsNumber()
  idSienge: number;

  @ApiProperty({
    description: 'Nome do empreendimento',
    example: 'Residencial Alpha',
  })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'CNPJ do empreendimento (14 dígitos)',
    example: '12345678000195',
  })
  @IsNumberString()
  @Length(14, 14)
  cnpj: string;

  @ApiPropertyOptional({
    description: 'Tipo do empreendimento',
    example: 'Residencial',
  })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiProperty({
    description: 'Cidade do empreendimento',
    example: 'São Paulo',
  })
  @IsString()
  cidade: string;

  @ApiProperty({
    description: 'Estado (UF) do empreendimento',
    example: 'SP',
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @Length(2, 2)
  uf: string;

  @ApiPropertyOptional({
    description: 'Data prevista para entrega',
    example: '2025-04-25T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  entregaData?: string;

  @ApiProperty({
    description: 'FRE - Custos de obra',
    example: 10000000.0,
  })
  @IsNumber()
  custoObra: number;

  @ApiProperty({
    description: 'FRE - Custos Adicionais',
    example: 10000000.0,
  })
  @IsNumber()
  custosAdicionais: number;

  @ApiProperty({
    description: 'FRE - Custos de terreno',
    example: 10000000.0,
  })
  @IsNumber()
  custoTerreno: number;

  @ApiProperty({
    description: 'Valor do cheque associado ao empreendimento',
    example: 10000000.0,
  })
  @IsNumber()
  chequeValor: number;

  @ApiProperty({
    description: 'Data do cheque',
    example: '2025-04-25T00:00:00.000Z',
  })
  @IsDateString()
  chequeData: string;

  @ApiProperty({
    description: 'Valor do orçamento executivo associado ao empreendimento',
    example: 10000000.0,
  })
  @IsNumber()
  orcamentoExecutivo: number;
}
