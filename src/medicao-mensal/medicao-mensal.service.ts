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

    // Calcular campos derivados
    const custoIncorrido = new Decimal(dto.custoIncorrido);
    const custoAnterior = medicaoAnterior
      ? new Decimal(medicaoAnterior.custoIncorrido.toString())
      : new Decimal(0);

    // 1. Gasto do mês = custoIncorrido atual - custoIncorrido anterior
    const gasto = custoIncorrido.minus(custoAnterior);

    // 2. Total gasto = custoIncorrido (acumulado)
    const totalGasto = custoIncorrido;

    // 3. Determinar o aGastarAtualizado anterior (para cálculo do aGastar)
    let aGastarAtualizadoAnterior: Decimal;
    let difChequeExecutivo: Decimal = new Decimal(0);

    // 3.1 Determinar a base de cálculo (EXECUTIVO OU CHEQUE)
    let baseCalculo = 'CHEQUE';

    if (medicaoAnterior) {
      aGastarAtualizadoAnterior = new Decimal(
        medicaoAnterior.aGastarAtualizado!.toString(),
      );

      // Verificar se houve mudança de orçamento (chequeValor → orcamentoExecutivo)
      const chequeValor = new Decimal(empreendimento.chequeValor.toString());
      const orcamentoExecutivo = empreendimento.orcamentoExecutivo
        ? new Decimal(empreendimento.orcamentoExecutivo.toString())
        : null;

      // Se temos orçamento executivo agora mas não tínhamos antes
      if (orcamentoExecutivo && medicaoAnterior.baseCalculo === 'CHEQUE') {
        const diferencaOrcamento = orcamentoExecutivo.minus(chequeValor);
        baseCalculo = 'EXECUTIVO';

        // Ajustar a diferença entre orçamento executivo e valor do cheque
        difChequeExecutivo = diferencaOrcamento;
      }
    } else {
      // Para a primeira medição, usar o orçamento base (chequeValor ou orcamentoExecutivo)
      aGastarAtualizadoAnterior = empreendimento.orcamentoExecutivo
        ? new Decimal(empreendimento.orcamentoExecutivo.toString())
        : new Decimal(empreendimento.chequeValor.toString());

      baseCalculo = empreendimento.orcamentoExecutivo ? 'EXECUTIVO' : 'CHEQUE';
    }

    // 4. A gastar = aGastarAtualizadoAnterior - gasto
    const aGastar = aGastarAtualizadoAnterior.minus(gasto);

    // 5. A gastar atualizado = aGastar + (aGastar * incc) + (difChequeOrcamento [caso seja a primeira medição após a inserção do orçamento executivo])
    const aGastarAtualizado = aGastar.plus(
      aGastar
        .times(new Decimal(inccRegistro.incc).dividedBy(100))
        .plus(difChequeExecutivo),
    );

    // 6. Orçamento corrigido = aGastarAtualizado + totalGasto
    const orcamentoCorrigido = aGastarAtualizado.plus(totalGasto);

    // 7. Evolução total = (totalGasto / orcamentoCorrigido) * 100
    const evolucaoTotal = totalGasto
      .dividedBy(orcamentoCorrigido)
      .times(100)
      .toNumber();

    // 8. Evolução do mês = evolução total atual - evolução total anterior
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
        aditivo: new Decimal(0).toDecimalPlaces(2), // Inicialmente zero
        aGastarAtualizado: aGastarAtualizado.toDecimalPlaces(2),
        orcamentoCorrigido: orcamentoCorrigido.toDecimalPlaces(2),
        evolucaoMes: parseFloat(evolucaoMes.toFixed(2)),
        evolucaoTotal: parseFloat(evolucaoTotal.toFixed(2)),
        baseCalculo:
          medicaoAnterior?.baseCalculo === 'EXECUTIVO'
            ? 'EXECUTIVO'
            : baseCalculo,
      },
    });
  }

  async updateAmpFisico(id: string, ampFisico: UpdateMedicaoMensalDto) {
    await this.findOne(id);

    await this.prisma.medicaoMensal.update({
      where: { id },
      data: ampFisico,
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
