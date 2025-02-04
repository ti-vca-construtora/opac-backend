import { UseGuards, applyDecorators } from '@nestjs/common';
import { Role } from 'src/roles/roles.enum';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';

export function Protected(...roles: Role[]) {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));
}
