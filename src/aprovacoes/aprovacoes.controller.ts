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
  ParseBoolPipe,
} from '@nestjs/common';
import { AprovacaoService } from './aprovacoes.service';
import { CreateAprovacaoDto } from './dtos/create-aprovacao.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateAprovacaoDto } from './dtos/update-aprovacao.dto';

@ApiTags('Aprovações')
@Controller('aprovacoes')
export class AprovacaoController {
  constructor(private readonly aprovacaoService: AprovacaoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma solicitação de aprovação' })
  @ApiResponse({ status: 201, description: 'Solicitação criada com sucesso' })
  create(@Body() createAprovacaoDto: CreateAprovacaoDto) {
    return this.aprovacaoService.create(createAprovacaoDto);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Aprovar uma solicitação' })
  @ApiResponse({ status: 200, description: 'Solicitação aprovada com sucesso' })
  approve(@Param('id') id: string, @Query('userId') userId: string) {
    return this.aprovacaoService.approveAprovacao(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma solicitação de aprovação' })
  update(
    @Body() updateAprovacaoDto: UpdateAprovacaoDto,
    @Param('id') id: string,
  ) {
    return this.aprovacaoService.update(id, updateAprovacaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar solicitações de aprovação' })
  @ApiResponse({ status: 200, description: 'Lista de solicitações' })
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Query('type') type?: string,
    @Query('approved', new ParseBoolPipe({ optional: true }))
    approved?: boolean,
    @Query('empreendimentoId') empreendimentoId?: string,
  ) {
    return this.aprovacaoService.getAll(
      page,
      pageSize,
      type,
      approved,
      empreendimentoId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma solicitação de aprovação' })
  @ApiResponse({ status: 200, description: 'Solicitação encontrada' })
  findOne(@Param('id') id: string) {
    return this.aprovacaoService.findOne(id);
  }

  @Get('empreendimento/:empreendimentoId')
  @ApiOperation({ summary: 'Listar aprovações por empreendimento' })
  @ApiResponse({
    status: 200,
    description: 'Lista de aprovações do empreendimento',
  })
  getByEmpreendimento(@Param('empreendimentoId') empreendimentoId: string) {
    return this.aprovacaoService.getByEmpreendimento(empreendimentoId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma solicitação de aprovação' })
  @ApiResponse({ status: 200, description: 'Solicitação removida' })
  remove(@Param('id') id: string) {
    return this.aprovacaoService.remove(id);
  }
}
