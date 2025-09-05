import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsIn,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateAprovacaoDto {
  @ApiProperty({
    description: 'Tipo de aprovação (EXECUTIVO ou ADITIVO)',
    enum: ['EXECUTIVO', 'ADITIVO'],
  })
  @IsString()
  @IsIn(['EXECUTIVO', 'ADITIVO'])
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Mês da solicitação (obrigatório para ADITIVO)',
    required: false,
  })
  @ValidateIf((o: CreateAprovacaoDto) => o.type === 'ADITIVO')
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  mes?: number;

  @ApiProperty({
    description: 'Ano da solicitação (obrigatório para ADITIVO)',
    required: false,
  })
  @ValidateIf((o: CreateAprovacaoDto) => o.type === 'ADITIVO')
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  ano?: number;

  @ApiProperty({
    description: 'Valor da aprovação',
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  valor: number;

  @ApiProperty({
    description: 'Observações opcionais',
    required: false,
  })
  @IsString()
  @IsOptional()
  obs?: string;

  @ApiProperty({
    description: 'URL do anexo (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  anexoLink?: string;

  @ApiProperty({
    description: 'ID do empreendimento relacionado',
  })
  @IsUUID()
  @IsNotEmpty()
  empreendimentoId: string;

  @ApiProperty({
    description: 'ID do usuário que está criando a aprovação',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
