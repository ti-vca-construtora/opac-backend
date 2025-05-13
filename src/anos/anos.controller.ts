import { Body, Controller, Get, Post } from '@nestjs/common';
import { AnosService } from './anos.service';
import { CreateAnoDto } from './dtos/create-ano.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Protected } from 'src/shared/protect/protected.decorator';
import { Role } from 'src/roles/roles.enum';

@ApiBearerAuth('JWT')
@Controller('anos')
export class AnosController {
  constructor(private readonly anosService: AnosService) {}

  @Protected({ controladoria: ['read_anos'] }, Role.CONTROLLER)
  @Get()
  @ApiOperation({
    summary: 'Listar todos os anos',
    description:
      'Retorna todos os anos cadastrados com seus meses relacionados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de anos recuperada com sucesso',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            ano: 2024,
            meses: [{ id: 'uuid', numero: 1, label: 'Janeiro' }],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  getAll() {
    return this.anosService.getAll();
  }

  @Protected({ controladoria: ['create_ano'] }, Role.CONTROLLER)
  @Post()
  @ApiOperation({
    summary: 'Criar novo ano',
    description: 'Cadastra um novo ano no sistema',
  })
  @ApiBody({
    type: CreateAnoDto,
    description: 'Dados necessários para criação do ano',
  })
  @ApiResponse({
    status: 201,
    description: 'Ano criado com sucesso',
    schema: {
      example: {
        data: {
          id: 'uuid',
          ano: 2025,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou formato incorreto',
  })
  create(@Body() dto: CreateAnoDto) {
    return this.anosService.create(dto);
  }
}
