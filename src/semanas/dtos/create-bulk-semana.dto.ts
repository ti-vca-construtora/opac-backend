import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateBulkSemanaDto {
  @ApiProperty({
    description: 'Número da semana',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  semana: number;

  @ApiProperty({
    description: 'Número do mês (1-12)',
    minimum: 1,
    maximum: 12,
    example: 7,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  mesNumero: number;

  @ApiProperty({
    description: 'ID do ano (formato UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  anoId: string;
}
