import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MedicaoMensalService } from './medicao-mensal.service';
import { CreateMedicaoMensalDto } from './dtos/create-medicao-mensal.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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

  @Get()
  @ApiOperation({ summary: 'Listar medições de orçamento' })
  @ApiResponse({ status: 200, description: 'Lista de medições' })
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Query('idSienge', new ParseIntPipe({ optional: true })) idSienge?: number,
    @Query('mes', new ParseIntPipe({ optional: true })) mes?: number,
    @Query('ano', new ParseIntPipe({ optional: true })) ano?: number,
  ) {
    return this.medicaoMensalService.getAll(page, pageSize, idSienge, mes, ano);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma medição de orçamento' })
  @ApiResponse({ status: 200, description: 'Medição encontrada' })
  findOne(@Param('id') id: string) {
    return this.medicaoMensalService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma medição de orçamento' })
  @ApiResponse({ status: 200, description: 'Medição removida' })
  remove(@Param('id') id: string) {
    return this.medicaoMensalService.remove(id);
  }
}
