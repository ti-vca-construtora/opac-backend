import { UseGuards, applyDecorators } from '@nestjs/common';
import { Role } from 'src/roles/roles.enum';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { Permission } from 'src/permissions/permissions.decorator';

export function Protected(permission: string, ...roles: Role[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard),
    Roles(...roles),
    Permission(permission),
  );
}
