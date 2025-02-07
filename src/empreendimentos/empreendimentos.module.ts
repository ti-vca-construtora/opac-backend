import { Module } from '@nestjs/common';
import { EmpreendimentosService } from './empreendimentos.service';
import { EmpreendimentosController } from './empreendimentos.controller';

@Module({
  providers: [EmpreendimentosService],
  controllers: [EmpreendimentosController],
})
export class EmpreendimentosModule {}
