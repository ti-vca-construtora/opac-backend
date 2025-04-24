import { Role } from 'src/roles/roles.enum';
import { CreateUserDto } from '../dtos/create-user.dto';

export class InputUserPresenter {
  name: string | null;
  email: string;
  hash: string;
  roles: Role[];
  permissions?: { create: { area: string; permissions: string[] }[] };

  constructor(input: CreateUserDto, hashedPassword: string) {
    this.name = input.name || null;
    this.email = input.email;
    this.hash = hashedPassword;
    this.roles = input.roles || [Role.READER];
    this.permissions = input.permissions?.length
      ? {
          create: input.permissions.map((perm) => ({
            area: perm.area,
            permissions: perm.permissions,
          })),
        }
      : undefined;
  }
}
