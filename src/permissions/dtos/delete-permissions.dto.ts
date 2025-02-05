import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeletePermissionsDto {
  @ApiProperty({ description: 'ID da permissão a ser modificada' })
  @IsNotEmpty()
  @IsString()
  permissionId: string;

  @ApiProperty({ description: 'Permissão específica a ser removida' })
  @IsNotEmpty()
  @IsString()
  permissionToDelete: string;
}
