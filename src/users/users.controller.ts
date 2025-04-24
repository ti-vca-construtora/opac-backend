import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from '../roles/roles.enum';
import { Protected } from 'src/shared/protect/protected.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { SwaggerDocs } from 'src/shared/swagger/swagger.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Protected('', Role.READER)
  @Get()
  @SwaggerDocs({
    summary: 'Buscar usuário por ID',
    description: 'Encontra um usuário pelo seu ID e retorna os dados.',
    requiresPagination: true,
    successResponse: {
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: '2024-02-04T12:34:56.789Z',
        email: 'usuario@empresa.com',
        name: 'João Silva',
        roles: ['MASTER'],
        permissions: [
          {
            area: 'api',
            permissions: ['create_user, delete_user, update_user'],
          },
        ],
      },
    },
  })
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize: number,
    @Query('role', new ParseEnumPipe(Role, { optional: true })) role?: Role,
  ) {
    return this.userService.getAll({ page, pageSize, role });
  }

  @Protected('', Role.READER)
  @Get('/:id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Encontra um usuário pelo seu ID e retorna os dados.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    schema: {
      example: {
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2024-02-04T12:34:56.789Z',
          email: 'usuario@empresa.com',
          name: 'João Silva',
          roles: ['MASTER'],
          permissions: [
            {
              area: 'api',
              permissions: ['create_user, delete_user, update_user'],
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Protected('', Role.READER)
  @Get('/email')
  @ApiOperation({
    summary: 'Buscar usuário por e-mail',
    description: 'Encontra um usuário pelo seu e-mail e retorna os dados.',
  })
  @ApiQuery({
    name: 'email',
    description: 'E-mail do usuário',
    example: 'usuario@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    schema: {
      example: {
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2024-02-04T12:34:56.789Z',
          email: 'usuario@empresa.com',
          name: 'João Silva',
          roles: ['MASTER'],
          permissions: [
            {
              area: 'api',
              permissions: ['create_user, delete_user, update_user'],
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findByEmail(@Query('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Protected({ api: ['create_user'] }, Role.MASTER)
  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Cria um novo usuário e retorna os dados do usuário criado.',
  })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2024-02-04T12:34:56.789Z',
          email: 'usuario@empresa.com',
          name: 'João Silva',
          roles: ['MASTER'],
          permissions: [
            {
              area: 'api',
              permissions: ['create_user, delete_user, update_user'],
            },
          ],
        },
      },
    },
  })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Protected({ api: ['delete_user'] }, Role.MASTER)
  @Delete('/:id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Deletar usuário',
    description: 'Deleta um usuário pelo ID se ele existir.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiNoContentResponse({ description: 'Usuário deletado com sucesso' })
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Protected({ api: ['update_user'] }, Role.MASTER)
  @Patch('/:id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Atualiza os dados de um usuário.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiNoContentResponse({ description: 'Usuário atualizado com sucesso' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
}
