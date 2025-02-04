import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from './roles.enum';

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

    // does the current user making the request have those required roles?
    return true;
  }
}
