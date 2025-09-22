/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateMedicaoMensalDto } from './dtos/create-medicao-mensal.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { UpdateMedicaoMensalDto } from './dtos/update-medicao-mensal.dto';
import { MedicaoMensal } from '@prisma/client';
import * as XLSX from 'xlsx';

interface PlanilhaRow {
  Obra: string;
  'Total Distorções': number;
  'Total Custo por Nível': number;
  'Total Estoque': number;
  'Total Medições': number;
  Locadora: number;
  Usina: number;
  'Custo Incorrido': number;
  ID: string;
}

@Injectable()
export class MedicaoMensalService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateMedicaoMensalDto) {
    const empreendimento = await this.prisma.empreendimento.findUnique({
      where: {
        idSienge: dto.idSienge,
      },
    });

    if (!empreendimento) {
      throw new NotFoundException(
        `Empreendimento com idSienge ${dto.idSienge} não encontrado`,
      );
    }

    const existingMedicao = await this.prisma.medicaoMensal.findFirst({
      where: {
        ano: dto.ano,
        empreendimentoId: empreendimento.id,
        mes: dto.mes,
      },
    });

    if (existingMedicao) {
      throw new ConflictException(
        `Já existe uma medição para este empreendimento no mês ${dto.mes} e ano ${dto.ano}`,
      );
    }

    // Buscar medição anterior para calcular o gasto do mês
    const medicaoAnterior = await this.prisma.medicaoMensal.findFirst({
      where: {
        empreendimentoId: empreendimento.id,
        OR: [
          { ano: { lt: dto.ano } },
          {
            ano: dto.ano,
            mes: { lt: dto.mes },
          },
        ],
      },
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });

    // Buscar o INCC do mês/ano correspondente
    const inccRegistro = await this.prisma.incc.findUnique({
      where: {
        mes_ano: {
          mes: dto.mes,
          ano: dto.ano,
        },
      },
    });

    if (!inccRegistro) {
      throw new NotFoundException(
        `INCC para mês ${dto.mes} e ano ${dto.ano} não encontrado`,
      );
    }

    // Buscar aditivos para este mês/ano
    const aditivos = await this.prisma.aditivo.findMany({
      where: {
        empreendimentoId: empreendimento.id,
        mes: dto.mes,
        ano: dto.ano,
      },
    });

    const totalAditivos = aditivos.reduce(
      (sum, aditivo) => sum.plus(new Decimal(aditivo.aditivo.toString())),
      new Decimal(0),
    );

    // Calcular campos derivados
    const custoIncorrido = new Decimal(dto.custoIncorrido);
    const custoAnterior = medicaoAnterior
      ? new Decimal(medicaoAnterior.custoIncorrido.toString())
      : new Decimal(0);

    // 1. Gasto do mês = custoIncorrido atual - custoIncorrido anterior
    const gasto = custoIncorrido.minus(custoAnterior);

    // 2. Total gasto = custoIncorrido (acumulado)
    const totalGasto = custoIncorrido;

    // 3. Determinar valores iniciais
    let aGastar: Decimal;
    let baseCalculo = 'CHEQUE';

    if (medicaoAnterior) {
      // Usar o saldo atualizado da medição anterior como ponto de partida
      aGastar = new Decimal(medicaoAnterior.aGastarAtualizado!.toString());
      baseCalculo = medicaoAnterior.baseCalculo || baseCalculo;
    } else {
      // Primeira medição - definir valores iniciais
      const orcamentoBase = empreendimento.orcamentoExecutivo
        ? new Decimal(empreendimento.orcamentoExecutivo.toString())
        : new Decimal(empreendimento.chequeValor.toString());

      baseCalculo = empreendimento.orcamentoExecutivo ? 'EXECUTIVO' : 'CHEQUE';
      aGastar = orcamentoBase;
    }

    // 4. Subtrair o gasto do mês do saldo
    aGastar = aGastar.minus(gasto);

    // 5. Verificar se houve mudança de base de cálculo (CHEQUE → EXECUTIVO)
    const orcamentoExecutivo = empreendimento.orcamentoExecutivo
      ? new Decimal(empreendimento.orcamentoExecutivo.toString())
      : null;

    // Se temos orçamento executivo e a base anterior era CHEQUE, mudar a base
    if (orcamentoExecutivo && baseCalculo === 'CHEQUE') {
      baseCalculo = 'EXECUTIVO';
      // Recalcular o aGastar considerando o novo orçamento base
      aGastar = orcamentoExecutivo.minus(totalGasto);
    }

    // 6. Calcular saldo atualizado (com INCC e aditivos)
    const aGastarAtualizado = aGastar
      .times(new Decimal(1).plus(new Decimal(inccRegistro.incc).dividedBy(100)))
      .plus(totalAditivos);

    // 7. Calcular orçamento corrigido
    const orcamentoCorrigido = aGastarAtualizado.plus(totalGasto);

    // 8. Calcular evoluções
    const evolucaoTotal = totalGasto
      .dividedBy(orcamentoCorrigido)
      .times(100)
      .toNumber();

    const evolucaoTotalAnterior = medicaoAnterior?.evolucaoTotal || 0;
    const evolucaoMes = evolucaoTotal - evolucaoTotalAnterior;

    return this.prisma.medicaoMensal.create({
      data: {
        ...dto,
        empreendimentoId: empreendimento.id,
        gasto: gasto.toDecimalPlaces(2),
        incc: inccRegistro.incc,
        totalGasto: totalGasto.toDecimalPlaces(2),
        aGastar: aGastar.toDecimalPlaces(2),
        aditivo: totalAditivos.toDecimalPlaces(2),
        aGastarAtualizado: aGastarAtualizado.toDecimalPlaces(2),
        orcamentoCorrigido: orcamentoCorrigido.toDecimalPlaces(2),
        evolucaoMes: parseFloat(evolucaoMes.toFixed(2)),
        evolucaoTotal: parseFloat(evolucaoTotal.toFixed(2)),
        baseCalculo,
      },
    });
  }

  async createBulk(dtos: CreateMedicaoMensalDto[]) {
    const results: MedicaoMensal[] = [];
    const errors: { dto: CreateMedicaoMensalDto; error: unknown }[] = [];

    for (const dto of dtos) {
      try {
        const result = await this.create(dto);

        results.push(result);
      } catch (error) {
        errors.push({
          dto,
          error: error,
        });
      }
    }

    return {
      success: results,
      errors,
    };
  }

  async findByMesAno(mes: number, ano: number) {
    return this.prisma.medicaoMensal.findMany({
      where: {
        mes,
        ano,
      },
      include: {
        empreendimento: true,
      },
    });
  }

  async generateReport(mes: number, ano: number): Promise<Buffer> {
    try {
      // Buscar medições filtradas por mês/ano
      const medicoes = await this.findByMesAno(mes, ano);

      if (medicoes.length === 0) {
        throw new BadRequestException(
          'Nenhuma medição encontrada para o período selecionado',
        );
      }

      // Preparar dados para a planilha - CONVERTENDO Decimal PARA NÚMEROS
      const worksheetData = medicoes.map((medicao) => ({
        Empreendimento: medicao.empreendimento.nome,
        Cidade: medicao.empreendimento.cidade,
        UF: medicao.empreendimento.uf,
        Mês: medicao.mes,
        Ano: medicao.ano,
        'Total Distorções': medicao.totalDistorcoes?.toNumber() || 0,
        'Total Custo por Nível': medicao.totalCustoPorNivel?.toNumber() || 0,
        'Total Estoque': medicao.totalEstoque?.toNumber() || 0,
        'Total Medições': medicao.totalMedicoes?.toNumber() || 0,
        'Custo Incorrido': medicao.custoIncorrido?.toNumber() || 0,
        Gasto: medicao.gasto?.toNumber() || 0,
        INCC: medicao.incc,
        'Total Gasto': medicao.totalGasto?.toNumber() || 0,
        'A Gastar': medicao.aGastar?.toNumber() || 0,
        Aditivo: medicao.aditivo?.toNumber() || 0,
        'A Gastar Atualizado': medicao.aGastarAtualizado?.toNumber() || 0,
        'Orçamento Corrigido': medicao.orcamentoCorrigido?.toNumber() || 0,
        'Evolução Mês': medicao.evolucaoMes,
        'Evolução Total': medicao.evolucaoTotal,
        'Base Cálculo': medicao.baseCalculo,
        'AMP Físico Total': medicao.ampFisicoTotal || null,
        'AMP Físico Mês': medicao.ampFisicoMes || null,
        Locadora: medicao.locadora,
        Usina: medicao.usina,
      }));

      // Criar workbook e worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Opcional: Definir largura das colunas para melhor visualização
      const columnWidths = [
        { wch: 20 }, // Empreendimento
        { wch: 15 }, // Cidade
        { wch: 5 }, // UF
        { wch: 8 }, // Mês
        { wch: 8 }, // Ano
        { wch: 15 }, // Total Distorções
        { wch: 18 }, // Total Custo por Nível
        { wch: 15 }, // Total Estoque
        { wch: 15 }, // Total Medições
        { wch: 15 }, // Custo Incorrido
        { wch: 12 }, // Gasto
        { wch: 8 }, // INCC
        { wch: 15 }, // Total Gasto
        { wch: 12 }, // A Gastar
        { wch: 10 }, // Aditivo
        { wch: 18 }, // A Gastar Atualizado
        { wch: 18 }, // Orçamento Corrigido
        { wch: 12 }, // Evolução Mês
        { wch: 12 }, // Evolução Total
        { wch: 12 }, // Base Cálculo
        { wch: 15 }, // AMP Físico Total
        { wch: 15 }, // AMP Físico Mês
        { wch: 10 }, // Locadora
        { wch: 8 }, // Usina
      ];

      worksheet['!cols'] = columnWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Medições');

      // Gerar buffer
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
      throw new BadRequestException('Erro ao gerar relatório: ' + error);
    }
  }

  async processExcelFile(buffer: Buffer, mes: number, ano: number) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Verificar se a aba 'import' existe
    if (!workbook.SheetNames.includes('import')) {
      throw new BadRequestException(
        'A planilha deve conter uma aba chamada "import"',
      );
    }

    const worksheet = workbook.Sheets['import'];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Pular cabeçalhos
    const rows = data.slice(1);
    const medicoes: CreateMedicaoMensalDto[] = [];
    const errors: { row: number; message: string; details: PlanilhaRow[] }[] =
      [];

    // Mapeamento de colunas
    const COLUMNS = {
      Obra: 0,
      'Total Distorções': 1,
      'Total Custo por Nível': 2,
      'Total Estoque': 3,
      'Total Medições': 4,
      Locadora: 5,
      Usina: 6,
      'Custo Incorrido': 7,
      ID: 8,
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as PlanilhaRow[];

      try {
        // Verificar se a linha está vazia
        if (!row || row.length === 0 || !row[COLUMNS.ID]) continue;

        const medicao: CreateMedicaoMensalDto = {
          idSienge: row[COLUMNS['ID']] as unknown as string,
          totalDistorcoes: Number(row[COLUMNS['Total Distorções']]),
          totalCustoPorNivel: Number(row[COLUMNS['Total Custo por Nível']]),
          totalEstoque: Number(row[COLUMNS['Total Estoque']]),
          totalMedicoes: Number(row[COLUMNS['Total Medições']]),
          custoIncorrido: Number(row[COLUMNS['Custo Incorrido']]),
          locadora: Number(row[COLUMNS['Locadora']]),
          usina: Number(row[COLUMNS['Usina']]),
          mes: Number(mes),
          ano: Number(ano),
        };

        medicoes.push(medicao);
      } catch (error) {
        errors.push({
          row: i,
          message: `Erro ao processar linha: ${error}`,
          details: row,
        });
      }
    }

    // Processar medições
    const results = await this.createBulk(medicoes);

    return {
      success: results.success,
      errors: [...errors, ...results.errors],
    };
  }

  async updateAmpFisico(id: string, dto: UpdateMedicaoMensalDto) {
    const medicao = await this.findOne(id);

    // Buscar medição anterior para calcular a medição mensal
    const medicaoAnterior = await this.prisma.medicaoMensal.findFirst({
      where: {
        empreendimentoId: medicao.empreendimento.id,
        OR: [
          { ano: { lt: medicao.ano } },
          {
            ano: medicao.ano,
            mes: { lt: medicao.mes },
          },
        ],
      },
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });

    const ampFisicoTotal: number = dto.ampFisico;
    let ampFisicoMensal: number = dto.ampFisico;

    if (medicaoAnterior && medicaoAnterior.ampFisicoTotal) {
      ampFisicoMensal = ampFisicoTotal - medicaoAnterior.ampFisicoTotal;
    }

    await this.prisma.medicaoMensal.update({
      where: { id },
      data: {
        ampFisicoTotal: dto.ampFisico,
        ampFisicoMes: ampFisicoMensal,
      },
    });
  }

  async getAll(
    page: number = 1,
    pageSize: number = 20,
    idSienge?: string,
    mes?: number,
    ano?: number,
  ) {
    const skip = (page - 1) * pageSize;
    const where = {
      ...(idSienge && { idSienge }),
      ...(mes && { mes }),
      ...(ano && { ano }),
    };

    const [medicoes, total] = await this.prisma.$transaction([
      this.prisma.medicaoMensal.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          empreendimento: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.medicaoMensal.count({ where }),
    ]);

    return {
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
      data: medicoes,
    };
  }

  async findOne(id: string) {
    const medicao = await this.prisma.medicaoMensal.findUnique({
      where: { id },
      include: {
        empreendimento: true,
      },
    });

    if (!medicao) {
      throw new NotFoundException(`Medição com id ${id} não encontrada`);
    }

    return medicao;
  }

  async remove(id: string) {
    try {
      return await this.prisma.medicaoMensal.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(
        `Medição com id ${id} não encontrada` + error,
      );
    }
  }

  async removeBulk(mes: number, ano: number) {
    try {
      const result = await this.prisma.medicaoMensal.deleteMany({
        where: {
          mes,
          ano,
        },
      });

      return {
        message: `${result.count} medições excluídas com sucesso para ${mes}/${ano}`,
        count: result.count,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao excluir medições' + error,
      );
    }
  }
}
