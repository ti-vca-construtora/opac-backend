import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PermissionDto } from 'src/permissions/dtos/permission.dto';
import { Role } from 'src/roles/roles.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'E-mail do usuário (e-mail corporativo)' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Nome do usuário (opcional)' })
  @IsOptional()
  @IsString()
  name: string | null;

  @ApiProperty({ description: 'Senha do usuário' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'Roles do usuário, default READER' })
  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles?: Role[];

  @ApiPropertyOptional({ description: 'Permissões do usuário' })
  @IsOptional()
  @IsArray()
  permissions?: PermissionDto[];
}
