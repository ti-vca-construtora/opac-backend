import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateMesDto {
  @ApiProperty({
    description: 'Número do mês (1-12)',
    minimum: 1,
    maximum: 12,
    example: 7,
    required: true,
  })
  @IsInt()
  @Min(1, { message: 'O mês deve ser entre 1 e 12' })
  @Max(12, { message: 'O mês deve ser entre 1 e 12' })
  numero: number;

  @ApiProperty({
    description: 'ID do ano relacionado (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4', { message: 'ID do ano inválido' })
  anoId: string;
}
