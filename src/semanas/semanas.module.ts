import { Module } from '@nestjs/common';
import { SemanasService } from './semanas.service';
import { SemanasController } from './semanas.controller';

@Module({
  providers: [SemanasService],
  controllers: [SemanasController]
})
export class SemanasModule {}
