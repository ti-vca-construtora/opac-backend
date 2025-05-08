import { Body, Controller, Get, Post } from '@nestjs/common';
import { AnosService } from './anos.service';
import { CreateAnoDto } from './dtos/create-ano.dto';

@Controller('anos')
export class AnosController {
  constructor(private anosService: AnosService) {}

  @Get()
  getAll() {
    return this.anosService.getAll();
  }

  @Post()
  create(@Body() dto: CreateAnoDto) {
    return this.anosService.create(dto);
  }
}
