import { Module } from '@nestjs/common';
import { AprovacaoService } from './aprovacoes.service';
import { AprovacaoController } from './aprovacoes.controller';

@Module({
  providers: [AprovacaoService],
  controllers: [AprovacaoController],
})
export class AprovacoesModule {}
