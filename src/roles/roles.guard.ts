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
    // what is the require role?
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

    console.log('RolesGuard: Usuário: ', user);

    // enable for MASTER users
    if (user.roles.some((role) => role === 'MASTER')) return true;

    // does the current user making the request have those required roles?
    return requireRole.some((role) => user.roles.includes(role));
  }
}
