import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
