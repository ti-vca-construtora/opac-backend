import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EmpreendimentosService } from './empreendimentos.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateEmpreendimentoDto } from './dtos/create-empreendimento.dto';
import { UpdateEmpreendimentoDto } from './dtos/update-empreendimento.dto';
import { Protected } from 'src/shared/protect/protected.decorator';
import { Role } from 'src/roles/roles.enum';

@ApiTags('Empreendimentos')
@ApiBearerAuth('JWT')
@Controller('empreendimentos')
export class EmpreendimentosController {
  constructor(
    private readonly empreendimentosService: EmpreendimentosService,
  ) {}

  @Protected({ api: ['create_empreendimento'] }, Role.ENGINEER)
  @Post()
  @ApiOperation({ summary: 'Criar um novo empreendimento' })
  @ApiResponse({
    status: 201,
    description: 'Empreendimento criado com sucesso',
  })
  create(@Body() dto: CreateEmpreendimentoDto) {
    return this.empreendimentosService.create(dto);
  }

  @Protected('', Role.READER)
  @Get()
  @ApiOperation({ summary: 'Listar todos os empreendimentos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de empreendimentos retornada com sucesso',
  })
  getAll() {
    return this.empreendimentosService.getAll();
  }

  @Protected('', Role.READER)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar um empreendimento pelo ID' })
  @ApiResponse({ status: 200, description: 'Empreendimento encontrado' })
  @ApiResponse({ status: 404, description: 'Empreendimento não encontrado' })
  findById(@Param('id') id: string) {
    return this.empreendimentosService.findById(id);
  }

  @Protected({ api: ['update_empreendimento'] }, Role.MASTER)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um empreendimento' })
  @ApiResponse({
    status: 200,
    description: 'Empreendimento atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Empreendimento não encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateEmpreendimentoDto) {
    return this.empreendimentosService.update(id, dto);
  }

  @Protected({ api: ['delete_empreendimento'] }, Role.MASTER)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um empreendimento' })
  @ApiResponse({
    status: 204,
    description: 'Empreendimento removido com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Empreendimento não encontrado' })
  delete(@Param('id') id: string) {
    return this.empreendimentosService.delete(id);
  }
}
