import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from './roles.enum';
import { UserOutputDto } from 'src/users/dtos/output-user.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requireRole = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!requireRole) {
      return true;
    }

    const { user }: { user: UserOutputDto } = context
      .switchToHttp()
      .getRequest();

    if (user.roles.some((role) => role === 'MASTER')) return true;

    return requireRole.some((role) => user.roles.includes(role));
  }
}
