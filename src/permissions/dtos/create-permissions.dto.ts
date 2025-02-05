import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'ID do usuário que receberá a permissão' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Área da permissão (ex: api, engenharia, financeiro)',
  })
  @IsNotEmpty()
  @IsString()
  area: string;

  @ApiProperty({ description: 'Lista de permissões dentro da área' })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
