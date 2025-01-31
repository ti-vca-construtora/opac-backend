import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'E-mail do usuário (e-mail corporativo)' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Nome do usuário (opcional)' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Hash de senha do usuário' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  hash?: string;
}
