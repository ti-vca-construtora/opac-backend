import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { InccService } from './incc.service';
import { CreateInccDto } from './dtos/create-incc.dto';
import { UpdateInccDto } from './dtos/update-incc.dto';

@ApiTags('INCC')
@Controller('incc')
export class InccController {
  constructor(private inccService: InccService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os INCCs',
    description: 'Retorna uma lista paginada de INCCs.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Tamanho da página (padrão: 20)',
  })
  @ApiOkResponse({
    description: 'Lista de INCCs retornada com sucesso.',
    schema: {
      example: {
        total: 100,
        totalPages: 5,
        currentPage: 1,
        data: [
          {
            id: 'uuid',
            mes: 1,
            ano: 2024,
            incc: 0.5,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' })
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    return this.inccService.getAll({ page, pageSize });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar um novo INCC',
    description:
      'Cria um novo registro de INCC. Não permite mês/ano duplicados.',
  })
  @ApiBody({ type: CreateInccDto })
  @ApiCreatedResponse({
    description: 'INCC criado com sucesso.',
    schema: {
      example: {
        data: {
          id: 'uuid',
          mes: 1,
          ano: 2024,
          incc: 0.5,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'Já existe um INCC para este mês/ano.' })
  @ApiBadRequestResponse({ description: 'Dados inválidos.' })
  @ApiInternalServerErrorResponse({ description: 'Erro ao criar INCC.' })
  create(@Body() dto: CreateInccDto) {
    return this.inccService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar um INCC',
    description: 'Atualiza os dados de um INCC existente.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID do INCC a ser atualizado',
  })
  @ApiBody({ type: UpdateInccDto })
  @ApiOkResponse({ description: 'INCC atualizado com sucesso.' })
  @ApiNotFoundResponse({ description: 'INCC não encontrado.' })
  @ApiConflictResponse({ description: 'Conflito de mês/ano.' })
  @ApiInternalServerErrorResponse({ description: 'Erro ao atualizar INCC.' })
  update(@Param('id') id: string, @Body() dto: UpdateInccDto) {
    return this.inccService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir um INCC',
    description: 'Remove permanentemente um registro de INCC.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID do INCC a ser excluído',
  })
  @ApiOkResponse({ description: 'INCC excluído com sucesso.' })
  @ApiNotFoundResponse({ description: 'INCC não encontrado.' })
  @ApiInternalServerErrorResponse({ description: 'Erro ao excluir INCC.' })
  delete(@Param('id') id: string) {
    return this.inccService.delete(id);
  }
}
