import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Patch,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { MedicaoMensalService } from './medicao-mensal.service';
import { CreateMedicaoMensalDto } from './dtos/create-medicao-mensal.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateMedicaoMensalDto } from './dtos/update-medicao-mensal.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@ApiTags('Medição Mensal')
@Controller('medicao-mensal')
export class MedicaoMensalController {
  constructor(private readonly medicaoMensalService: MedicaoMensalService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma medição de orçamento' })
  @ApiResponse({ status: 201, description: 'Medição criada com sucesso' })
  create(@Body() createMedicaoMensalDto: CreateMedicaoMensalDto) {
    return this.medicaoMensalService.create(createMedicaoMensalDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Criar várias medições de orçamento' })
  async createBulk(@Body() createMedicoesDto: CreateMedicaoMensalDto[]) {
    return this.medicaoMensalService.createBulk(createMedicoesDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedicoes(
    @UploadedFile() file: Express.Multer.File,
    @Body() { mes, ano }: { mes: number; ano: number },
  ): Promise<any> {
    return this.medicaoMensalService.processExcelFile(file.buffer, mes, ano);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar o AMP de avanço físico' })
  updateAmpFisico(
    @Body() updateAmpFisico: UpdateMedicaoMensalDto,
    @Param('id') id: string,
  ) {
    return this.medicaoMensalService.updateAmpFisico(id, updateAmpFisico);
  }

  @Get()
  @ApiOperation({ summary: 'Listar medições de orçamento' })
  @ApiResponse({ status: 200, description: 'Lista de medições' })
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Query('idSienge') idSienge?: string,
    @Query('mes', new ParseIntPipe({ optional: true })) mes?: number,
    @Query('ano', new ParseIntPipe({ optional: true })) ano?: number,
  ) {
    return this.medicaoMensalService.getAll(page, pageSize, idSienge, mes, ano);
  }

  @Get('report')
  @ApiOperation({ summary: 'Gerar relatório de medições em XLSX' })
  @ApiResponse({
    status: 200,
    description: 'Relatório gerado com sucesso',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao gerar relatório',
  })
  async getReport(
    @Query('mes', new ParseIntPipe()) mes: number,
    @Query('ano', new ParseIntPipe()) ano: number,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.medicaoMensalService.generateReport(mes, ano);

      // Configurar headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=relatorio_medicoes_${mes}_${ano}.xlsx`,
      );

      // Enviar arquivo
      res.status(HttpStatus.ACCEPTED).send(buffer);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Bad Request' + error,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma medição de orçamento' })
  @ApiResponse({ status: 200, description: 'Medição encontrada' })
  findOne(@Param('id') id: string) {
    return this.medicaoMensalService.findOne(id);
  }

  @Delete('bulk')
  async removeBulk(@Body() deleteBulkDto: { mes: number; ano: number }) {
    return this.medicaoMensalService.removeBulk(
      deleteBulkDto.mes,
      deleteBulkDto.ano,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma medição de orçamento' })
  @ApiResponse({ status: 200, description: 'Medição removida' })
  remove(@Param('id') id: string) {
    return this.medicaoMensalService.remove(id);
  }
}
