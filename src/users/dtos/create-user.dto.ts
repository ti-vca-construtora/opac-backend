import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
