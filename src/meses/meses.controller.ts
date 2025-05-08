import { Body, Controller, Get, Post } from '@nestjs/common';
import { MesesService } from './meses.service';
import { CreateMesDto } from './dtos/create-mes.dto';

@Controller('meses')
export class MesesController {
  constructor(private mesesService: MesesService) {}

  @Get()
  getAll() {
    return this.mesesService.getAll();
  }

  @Post()
  create(@Body() dto: CreateMesDto) {
    return this.mesesService.create(dto);
  }
}
