import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from 'src/roles/roles.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'E-mail do usuário (e-mail corporativo)',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Nome do usuário (opcional)' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Senha do usuário' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ description: 'Cargos' })
  @IsNotEmpty()
  @IsOptional()
  roles?: Role[];

  @ApiPropertyOptional({ description: 'Status do Usuário' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
