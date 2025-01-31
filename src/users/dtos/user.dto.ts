import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ description: 'E-mail do usuário (e-mail corporativo)' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nome do usuário (opcional)' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Hash de senha do usuário' })
  @IsNotEmpty()
  @IsString()
  hash: string;
}
