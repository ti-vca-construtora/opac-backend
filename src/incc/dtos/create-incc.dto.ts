import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInccDto {
  @ApiProperty({
    example: 1,
    description: 'Mês de referência (0-11)',
    minimum: 0,
    maximum: 11,
  })
  @IsNumber()
  mes: number;

  @ApiProperty({
    example: 2024,
    description: 'Ano de referência (4 dígitos)',
  })
  @IsNumber()
  ano: number;

  @ApiProperty({
    example: 0.5,
    description: 'Valor do INCC em porcentagem',
  })
  @IsNumber()
  incc: number;
}
