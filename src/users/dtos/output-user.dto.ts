import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PermissionDto } from 'src/permissions/dtos/permission.dto';

export class UserOutputDto {
  @ApiProperty({ description: 'ID do usuário' })
  id: string;

  @ApiProperty({ description: 'Data de criação do usuário' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de modificação do usuário' })
  updatedAt: Date;

  @ApiProperty({ description: 'E-mail do usuário (e-mail corporativo)' })
  email: string;

  @ApiProperty({ description: 'Nome do usuário (opcional)' })
  name?: string | null;

  @ApiProperty({ description: 'Cargos do usuário ' })
  roles: Role[];

  @ApiProperty({ description: 'Permissões do usuário ' })
  permissions: PermissionDto[];

  @ApiProperty({ description: 'Status do usuário' })
  isActive: boolean;
}
