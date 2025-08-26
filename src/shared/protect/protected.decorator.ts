import { UseGuards, applyDecorators } from '@nestjs/common';
import { Role } from 'src/roles/roles.enum';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { Permission } from 'src/permissions/permissions.decorator';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

export function Protected(
  permission: { [area: string]: string[] } | '',
  description: string,
  ...roles: Role[]
) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard),
    ApiSecurity('roles', roles),
    ApiOperation({
      summary: description || 'Acesso protegido',
      description: `Requer role: ${roles.join(', ')} ${
        permission ? `e permissões: ${JSON.stringify(permission)}` : ''
      }`,
    }),
    Roles(...roles),
    Permission(permission),
  );
}
