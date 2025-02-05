import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserOutputDto } from 'src/users/dtos/output-user.dto';
import { PermissionDto } from './dtos/permission.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<PermissionDto>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request: { user: UserOutputDto } = context
      .switchToHttp()
      .getRequest();
    const user = request.user;

    const userWithPermissions = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { permissions: true },
    });

    if (!userWithPermissions) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    const userPermissionsBySector: Record<string, string[]> = {};
    userWithPermissions.permissions.forEach((p) => {
      userPermissionsBySector[p.area] = p.permissions;
    });

    let hasPermission = false;

    hasPermission = Object.entries(requiredPermissions).some(
      ([setor, perms]: [string, string[]]) =>
        userPermissionsBySector[setor]?.some((perm) => perms.includes(perm)),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Acesso negado! Permissões insuficientes.');
    }

    return true;
  }
}
