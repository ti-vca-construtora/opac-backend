import { Module } from '@nestjs/common';
import { MedicaoMensalService } from './medicao-mensal.service';
import { MedicaoMensalController } from './medicao-mensal.controller';

@Module({
  providers: [MedicaoMensalService],
  controllers: [MedicaoMensalController],
})
export class MedicaoMensalModule {}
