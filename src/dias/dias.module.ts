import { Module } from '@nestjs/common';
import { DiasService } from './dias.service';
import { DiasController } from './dias.controller';

@Module({
  providers: [DiasService],
  controllers: [DiasController]
})
export class DiasModule {}
