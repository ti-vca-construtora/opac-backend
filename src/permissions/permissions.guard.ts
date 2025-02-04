import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserOutputDto } from 'src/users/dtos/output-user.dto';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );

    if (!requiredPermission) return true;

    const request: { user: UserOutputDto } = context
      .switchToHttp()
      .getRequest();
    const user = request.user;

    if (!user?.permissions) {
      throw new ForbiddenException(
        'Acesso negado: usuário não autenticado ou sem permissões.',
      );
    }

    const hasPermission = user.permissions.includes(requiredPermission);

    if (!hasPermission) {
      throw new ForbiddenException(
        `Acesso negado: permissão "${requiredPermission}" necessária.`,
      );
    }

    return true;
  }
}
