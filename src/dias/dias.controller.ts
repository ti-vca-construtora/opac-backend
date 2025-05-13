import { Controller, Get } from '@nestjs/common';
import { DiasService } from './dias.service';

@Controller('dias')
export class DiasController {
  constructor(private diasService: DiasService) {}

  @Get()
  getAll() {
    return this.diasService.getAll();
  }
}
