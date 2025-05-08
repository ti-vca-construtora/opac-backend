import { Module } from '@nestjs/common';
import { MesesService } from './meses.service';
import { MesesController } from './meses.controller';

@Module({
  providers: [MesesService],
  controllers: [MesesController]
})
export class MesesModule {}
