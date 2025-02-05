import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  area: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
