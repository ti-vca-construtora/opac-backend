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
import { Roles } from '../roles/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  getAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 20,
  ) {
    return this.userService.getAll(page, pageSize);
  }

  @Get('/id/:id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('/email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(201)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Patch('/:id')
  @HttpCode(204)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
}
