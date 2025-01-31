import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';

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

  @Get('/:id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: UserDto) {
    return this.userService.create(dto);
  }

  @Delete('/:id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
