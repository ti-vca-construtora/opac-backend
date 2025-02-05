import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePermissionDto } from './dtos/create-permissions.dto';
import { DeletePermissionsDto } from './dtos/delete-permissions.dto';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'Listar todas as permissões' })
  @ApiResponse({
    status: 200,
    description: 'Lista de permissões retornada com sucesso',
  })
  @Get()
  getAll() {
    return this.permissionsService.getAll();
  }

  @ApiOperation({ summary: 'Buscar permissão por ID' })
  @ApiResponse({ status: 200, description: 'Permissão encontrada' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  @Get('/id/:id')
  findById(@Param('id') id: string) {
    return this.permissionsService.findById(id);
  }

  @ApiOperation({ summary: 'Criar uma nova permissão' })
  @ApiResponse({ status: 201, description: 'Permissão criada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @ApiOperation({ summary: 'Excluir uma permissão pelo ID' })
  @ApiResponse({ status: 200, description: 'Permissão excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  @Delete('/id/:id')
  delete(@Param('id') id: string) {
    return this.permissionsService.delete(id);
  }

  @ApiOperation({ summary: 'Remover uma permissão específica de um usuário' })
  @ApiResponse({ status: 200, description: 'Permissão removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  @Delete()
  deleteOne(@Body() dto: DeletePermissionsDto) {
    return this.permissionsService.deleteOne(dto);
  }
}
