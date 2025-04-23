import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInccDto {
  @ApiProperty({
    example: 2,
    description: 'Novo mês (opcional)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  mes?: number;

  @ApiProperty({
    example: 2025,
    description: 'Novo ano (opcional)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ano?: number;

  @ApiProperty({
    example: 0.7,
    description: 'Novo valor do INCC (opcional)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  incc?: number;
}
