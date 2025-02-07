import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeletePermissionsDto {
  @ApiProperty({ description: 'Permissão específica a ser removida' })
  @IsNotEmpty()
  @IsString()
  permissionToDelete: string;
}
