import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import { ContabilidadeService } from './contabilidade.service';

@Controller('contabilidade')
@UseGuards(JwtAuthGuard)
export class ContabilidadeController {
  constructor(private readonly service: ContabilidadeService) {}

  @Get('periodos')
  periodos() { return this.service.periodos(); }

  @Get('acompanhamento')
  acompanhar(@Query('empreendimentoId') empreendimentoId: string, @Query('mes', ParseIntPipe) mes: number, @Query('ano', ParseIntPipe) ano: number) {
    return this.service.acompanhar(empreendimentoId, mes, ano);
  }

  @Post('importar/:fonte')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  importar(@Param('fonte') fonte: string, @UploadedFile() file: Express.Multer.File, @Body('mes') mes?: string, @Body('ano') ano?: string) {
    return this.service.importar(fonte, file?.buffer, mes ? Number(mes) : undefined, ano ? Number(ano) : undefined);
  }

  @Get('aditivos/modelo')
  async modeloAditivos(@Res() response: Response) {
    const buffer = await this.service.modeloAditivos();
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', 'attachment; filename="modelo-aditivos-contabeis.xlsx"');
    response.send(buffer);
  }

  @Post('aditivos/importar')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  importarAditivos(@UploadedFile() file: Express.Multer.File, @Body('mes') mes: string, @Body('ano') ano: string) {
    return this.service.importarAditivos(file?.buffer, Number(mes), Number(ano));
  }

  @Get('aditivos')
  aditivos(@Query('empreendimentoId') empreendimentoId: string) { return this.service.aditivos(empreendimentoId); }

  @Post('aditivos')
  criarAditivo(@Body() body: { empreendimentoId: string; mes: number; ano: number; valor: number; observacao?: string }) { return this.service.criarAditivo(body); }

  @Delete('aditivos/:id')
  removerAditivo(@Param('id') id: string) { return this.service.removerAditivo(id); }

  @Get('mapeamentos')
  mapeamentos() { return this.service.mapeamentos(); }

  @Get('empresas-sienge')
  empresasSienge() { return this.service.empresasSienge(); }

  @Post('mapeamentos')
  mapear(@Body() body: { empresaSienge: string; contaConstrucao: string; contaTransferencia: string; contaTerreno: string }) { return this.service.mapear(body); }

  @Post('sincronizar-balancete')
  sincronizar(@Body() body: { mes: number; ano: number }) { return this.service.sincronizarBalancete(body.mes, body.ano); }
}
