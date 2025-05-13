import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class CreateSemanaDto {
  @ApiProperty({
    description: 'Número sequencial da semana',
    example: 15,
  })
  @IsNumber()
  numero: number;

  @ApiProperty({
    description: 'ID do mês relacionado (formato UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  mesId: string;
}
