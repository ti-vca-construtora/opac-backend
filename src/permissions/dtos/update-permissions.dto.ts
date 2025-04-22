import { IsArray, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
