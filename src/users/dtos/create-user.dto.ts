import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PermissionDto } from 'src/permissions/dtos/permission.dto';

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

  @ApiPropertyOptional({ description: 'Permissões do usuário' })
  @IsOptional()
  @IsArray()
  permissions?: PermissionDto[];
}
