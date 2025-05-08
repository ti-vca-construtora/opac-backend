import { Module } from '@nestjs/common';
import { AnosService } from './anos.service';
import { AnosController } from './anos.controller';

@Module({
  providers: [AnosService],
  controllers: [AnosController],
})
export class AnosModule {}
