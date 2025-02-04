import { ApiProperty } from '@nestjs/swagger';

export class UserOutputDto {
  @ApiProperty({ description: 'ID do usuário' })
  id: string;

  @ApiProperty({ description: 'Data de criação do usuário' })
  createdAt: Date;

  @ApiProperty({ description: 'E-mail do usuário (e-mail corporativo)' })
  email: string;

  @ApiProperty({ description: 'Nome do usuário (opcional)' })
  name?: string | null;

  @ApiProperty({ description: 'Cargos do usuário ' })
  roles: string[];

  @ApiProperty({ description: 'Cargos do usuário ' })
  permissions: string[];
}
