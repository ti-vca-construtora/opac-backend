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
import { Protected } from 'src/shared/protect/protected.guard';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Protected(Role.READER)
  @Get()
  getAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 20,
  ) {
    return this.userService.getAll(page, pageSize);
  }

  @Protected(Role.READER)
  @Get('/id/:id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Protected(Role.READER)
  @Get('/email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Protected(Role.MASTER)
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Delete('/:id')
  @Roles(Role.MASTER)
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Protected(Role.MASTER)
  @Patch('/:id')
  @HttpCode(204)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
}
