import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class UpdateAprovacaoDto {
  @ApiProperty({
    description: 'Valor da aprovação',
    type: Number,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  valor?: number;

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
}
