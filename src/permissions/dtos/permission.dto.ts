import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class PermissionDto {
  @ApiProperty({
    description: 'Área da permissão (ex: api, engenharia, financeiro)',
  })
  @IsNotEmpty()
  @IsString()
  area: string;

  @ApiProperty({ description: 'Lista de permissões para a área' })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
