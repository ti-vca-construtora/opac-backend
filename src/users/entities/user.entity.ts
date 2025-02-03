import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ description: 'E-mail do usuário (e-mail corporativo)' })
  email: string;

  @ApiPropertyOptional({ description: 'Nome do usuário (opcional)' })
  name?: string | null;
}
