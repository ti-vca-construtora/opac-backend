import { Module } from '@nestjs/common';
import { InccService } from './incc.service';
import { InccController } from './incc.controller';

@Module({
  providers: [InccService],
  controllers: [InccController],
})
export class InccModule {}
