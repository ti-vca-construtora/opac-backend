import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { Role } from 'src/roles/roles.enum';
import { PermissionDto } from 'src/permissions/dtos/permission.dto';

interface ApiOptions {
  summary: string;
  description?: string;
  requiresPagination?: boolean;
  requiresIdParam?: boolean;
  requiresEmailQuery?: boolean;
  successResponse?: any;
  noContent?: boolean;
  role?: Role;
  permissions?: PermissionDto;
}

export function SwaggerDocs({
  summary,
  description,
  requiresPagination = false,
  requiresIdParam = false,
  requiresEmailQuery = false,
  successResponse,
  noContent = false,
}: ApiOptions) {
  const decorators = [ApiOperation({ summary, description })];

  if (requiresPagination) {
    decorators.push(
      ApiQuery({
        name: 'page',
        required: false,
        description: 'Número da página (default: 1)',
        example: 1,
      }),
      ApiQuery({
        name: 'pageSize',
        required: false,
        description: 'Itens por página (default: 20)',
        example: 20,
      }),
    );
  }

  if (requiresIdParam) {
    decorators.push(
      ApiParam({
        name: 'id',
        description: 'UUID do recurso',
        example: '550e8400-e29b-41d4-a716-446655440000',
      }),
    );
  }

  if (requiresEmailQuery) {
    decorators.push(
      ApiQuery({
        name: 'email',
        description: 'E-mail do usuário',
        example: 'usuario@example.com',
      }),
    );
  }

  if (successResponse) {
    decorators.push(
      ApiResponse({
        status: 200,
        description: 'Requisição bem-sucedida',
        schema: { example: successResponse },
      }),
    );
  }

  if (noContent) {
    decorators.push(
      ApiNoContentResponse({ description: 'Operação bem-sucedida' }),
    );
  }

  return applyDecorators(...decorators);
}
