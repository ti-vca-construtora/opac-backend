import { Transform } from 'class-transformer';
import { UserOutputDto } from '../dtos/output-user.dto';
import { PermissionDto } from 'src/permissions/dtos/permission.dto';

export class OutputUserPresenter {
  id: string;
  name: string | null;
  email: string;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date;
  roles: string[];
  permissions: PermissionDto[];

  constructor(output: UserOutputDto) {
    this.id = output.id;
    this.name = output.name || null;
    this.email = output.email;
    this.createdAt = output.createdAt;
    this.roles = output.roles;
    this.permissions = output.permissions;
  }
}
