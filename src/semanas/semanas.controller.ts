import { Body, Controller, Get, Post } from '@nestjs/common';
import { SemanasService } from './semanas.service';
import { CreateSemanaDto } from './dtos/create-semana.dto';
import { CreateBulkSemanaDto } from './dtos/create-bulk-semana.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Protected } from 'src/shared/protect/protected.decorator';
import { Role } from 'src/roles/roles.enum';

@ApiBearerAuth('JWT')
@Controller('semanas')
export class SemanasController {
  constructor(private semanasService: SemanasService) {}

  @Protected({ controladoria: ['read_semanas'] }, Role.CONTROLLER)
  @Get()
  @ApiOperation({
    summary: 'lista todas as semanas',
    description: 'pega geral das semanas cadastradas',
  })
  @ApiResponse({ status: 200, description: 'deu bom, aqui a lista' })
  @ApiResponse({ status: 500, description: 'deu zica no server' })
  getAll() {
    return this.semanasService.getAll();
  }

  @Protected({ controladoria: ['create_semana'] }, Role.CONTROLLER)
  @Post()
  @ApiOperation({
    summary: 'cria uma semana individual',
    description: 'cria uma semana linkando direto num mês existente',
  })
  @ApiBody({ type: CreateSemanaDto })
  @ApiResponse({ status: 201, description: 'semana criada na paz' })
  @ApiResponse({ status: 400, description: 'dados errados ou faltando' })
  @ApiResponse({ status: 404, description: 'mês não existe' })
  create(@Body() dto: CreateSemanaDto) {
    return this.semanasService.create(dto);
  }

  @Protected({ controladoria: ['create_bulk_semanas'] }, Role.CONTROLLER)
  @Post('bulk')
  @ApiOperation({
    summary: 'cria várias semanas de uma vez',
    description:
      'mass cria semanas e meses automaticamente pelo ano. maneiro pra lotar o banco rápido',
  })
  @ApiBody({ type: [CreateBulkSemanaDto] })
  @ApiResponse({
    status: 201,
    description: 'semanas criadas ou ignoradas se já existirem',
    schema: {
      example: { message: 'semanas processadas', created: 5, ignored: 2 },
    },
  })
  @ApiResponse({ status: 400, description: 'dados zoados ou lista vazia' })
  @ApiResponse({ status: 404, description: 'ano não encontrado' })
  createBulk(@Body() dto: CreateBulkSemanaDto[]) {
    return this.semanasService.createBulk(dto);
  }
}
