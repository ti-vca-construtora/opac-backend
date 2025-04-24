import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumberString,
  Length,
  IsUUID,
} from 'class-validator';

export class CreateEmpreendimentoDto {
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

  @ApiProperty({
    description: 'ID do engenheiro responsável',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsUUID()
  engenheiroId: string;

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
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  entregaData?: Date;

  @ApiPropertyOptional({
    description: 'Cheque associado ao empreendimento',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  cheque?: string;

  @ApiPropertyOptional({ description: 'Data do cheque', example: '2024-06-15' })
  @IsOptional()
  @IsString()
  chequeData?: string;
}
