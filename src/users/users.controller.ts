import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Protected('', Role.READER)
  @Get()
  @ApiOperation({
    summary: 'Listar usuários',
    description:
      'Lista todos os usuários com paginação e retorna metadados de paginação (requer permissão de READER)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Itens por página (default: 20)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      example: {
        total: 100,
        totalPages: 5,
        currentPage: 1,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            createdAt: '2024-02-04T12:34:56.789Z',
            email: 'usuario@empresa.com',
            name: 'João Silva',
            roles: ['MASTER'],
            permissions: ['create_user', 'delete_user', 'update_user'],
          },
        ],
      },
    },
  })
  getAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 20,
  ) {
    return this.userService.getAll(page, pageSize);
  }

  @Protected('', Role.READER)
  @Get('/id/:id')
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
          permissions: ['create_user', 'delete_user', 'update_user'],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Protected('', Role.READER)
  @Get('/email/:email')
  @ApiOperation({
    summary: 'Buscar usuário por e-mail',
    description: 'Encontra um usuário pelo seu e-mail e retorna os dados.',
  })
  @ApiParam({
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
          permissions: ['create_user', 'delete_user', 'update_user'],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  // @Protected('create_user', Role.MASTER)
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
          permissions: ['create_user', 'delete_user', 'update_user'],
        },
      },
    },
  })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Protected('delete_user', Role.MASTER)
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

  @Protected('update_user', Role.MASTER)
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
