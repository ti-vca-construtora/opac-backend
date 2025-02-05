import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dtos/create-permissions.dto';
import { DeletePermissionsDto } from './dtos/delete-permissions.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  getAll() {
    return this.permissionsService.getAll();
  }

  @Get('/id/:id')
  findById(@Param('id') id: string) {
    return this.permissionsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Delete('/id/:id')
  delete(@Param('id') id: string) {
    return this.permissionsService.delete(id);
  }

  @Delete()
  deleteOne(@Body() dto: DeletePermissionsDto) {
    return this.permissionsService.deleteOne(dto);
  }
}
