import { Body, Controller, Get, Post } from '@nestjs/common';
import { MesesService } from './meses.service';
import { CreateMesDto } from './dtos/create-mes.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Protected } from 'src/shared/protect/protected.decorator';
import { Role } from 'src/roles/roles.enum';

@ApiBearerAuth('JWT')
@Controller('meses')
export class MesesController {
  constructor(private readonly mesesService: MesesService) {}

  @Protected({ controladoria: ['read_meses'] }, Role.CONTROLLER)
  @Get()
  @ApiOperation({
    summary: 'Listar todos os meses',
    description:
      'Retorna todos os meses cadastrados com suas respectivas semanas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de meses recuperada com sucesso',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            numero: 1,
            label: 'Janeiro',
            anoId: 'uuid',
            semanas: [{ id: 'uuid', numero: 1, label: 'Semana 1' }],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno no servidor',
  })
  getAll() {
    return this.mesesService.getAll();
  }

  @Protected({ controladoria: ['create_mes'] }, Role.CONTROLLER)
  @Post()
  @ApiOperation({
    summary: 'Criar novo mês',
    description: 'Cria um novo mês associado a um ano existente',
  })
  @ApiBody({
    type: CreateMesDto,
    description: 'Dados necessários para criação do mês',
  })
  @ApiResponse({
    status: 201,
    description: 'Mês criado com sucesso',
    schema: {
      example: {
        id: 'uuid',
        numero: 5,
        label: 'Maio',
        anoId: 'uuid',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou mês já existe para o ano',
  })
  @ApiResponse({
    status: 404,
    description: 'Ano não encontrado',
  })
  create(@Body() dto: CreateMesDto) {
    return this.mesesService.create(dto);
  }
}
