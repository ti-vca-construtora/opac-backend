import { Body, Controller, Get, Post } from '@nestjs/common';
import { SemanasService } from './semanas.service';
import { CreateSemanaDto } from './dtos/create-semana.dto';

@Controller('semanas')
export class SemanasController {
  constructor(private semanasService: SemanasService) {}

  @Get()
  getAll() {
    return this.semanasService.getAll();
  }

  @Post()
  create(@Body() dto: CreateSemanaDto) {
    return this.semanasService.create(dto);
  }
}
