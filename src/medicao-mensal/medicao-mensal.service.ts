import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateMedicaoMensalDto } from './dtos/create-medicao-mensal.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { UpdateMedicaoMensalDto } from './dtos/update-medicao-mensal.dto';

@Injectable()
export class MedicaoMensalService {
  constructor(private readonly prisma: PrismaService) {}

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
    idSienge?: number,
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
          empreendimento: {
            select: {
              id: true,
              nome: true,
              cidade: true,
              uf: true,
            },
          },
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
        empreendimento: {
          select: {
            id: true,
            nome: true,
            cidade: true,
            uf: true,
          },
        },
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
}
