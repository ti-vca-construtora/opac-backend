import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePermissionDto } from './dtos/create-permissions.dto';
import { Protected } from 'src/shared/protect/protected.decorator';
import { Role } from 'src/roles/roles.enum';
import { UpdatePermissionDto } from './dtos/update-permissions.dto';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Protected({ api: ['get_permissions'] }, Role.MASTER)
  @Get()
  @ApiOperation({ summary: 'Listar todas as permissões' })
  @ApiResponse({
    status: 200,
    description: 'Lista de permissões retornada com sucesso',
  })
  getAll() {
    return this.permissionsService.getAll();
  }

  @Protected({ api: ['get_permission_by_id'] }, Role.MASTER)
  @Get('/:id')
  @ApiOperation({ summary: 'Buscar permissão por ID' })
  @ApiResponse({ status: 200, description: 'Permissão encontrada' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  findById(@Param('id') id: string) {
    return this.permissionsService.findById(id);
  }

  @Protected({ api: ['create_permission'] }, Role.MASTER)
  @Post()
  @ApiOperation({ summary: 'Criar uma nova permissão' })
  @ApiResponse({ status: 204, description: 'Permissão criada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Protected({ api: ['update_permission'] }, Role.MASTER)
  @Patch('/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Atualiza as permissões por ID' })
  @ApiResponse({ status: 204, description: 'Permissão criada com sucesso' })
  @ApiResponse({
    status: 404,
    description: 'Não foi possível encontrar esta permissão!',
  })
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto.permissions);
  }

  @Protected({ api: ['delete_permission'] }, Role.MASTER)
  @Delete('/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir uma permissão pelo ID' })
  @ApiResponse({ status: 204, description: 'Permissão excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  delete(@Param('id') id: string) {
    return this.permissionsService.delete(id);
  }
}
