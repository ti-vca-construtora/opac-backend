import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateAnoDto {
  @ApiProperty({
    description: 'Ano no formato YYYY',
    example: 2024,
    required: true,
  })
  @IsNumber({}, { message: 'O ano deve ser um número válido' })
  ano: number;
}
