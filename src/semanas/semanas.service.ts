import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateSemanaDto } from './dtos/create-semana.dto';
import { CreateBulkSemanaDto } from './dtos/create-bulk-semana.dto';

@Injectable()
export class SemanasService {
  constructor(private prisma: PrismaService) {}

  private readonly mesesMap = new Map<number, string>([
    [1, 'Janeiro'],
    [2, 'Fevereiro'],
    [3, 'Março'],
    [4, 'Abril'],
    [5, 'Maio'],
    [6, 'Junho'],
    [7, 'Julho'],
    [8, 'Agosto'],
    [9, 'Setembro'],
    [10, 'Outubro'],
    [11, 'Novembro'],
    [12, 'Dezembro'],
  ]);

  private getMesLabel(numero: number): string {
    const label = this.mesesMap.get(numero);

    if (!label) {
      throw new BadRequestException('Número do mês inválido');
    }

    return label;
  }

  private monthKey(numero: number, anoId: string) {
    return `${numero}:${anoId}`;
  }

  private weekKey(mesId: string, numero: number) {
    return `${mesId}:${numero}`;
  }

  private getUniqueMonths(semanas: CreateBulkSemanaDto[]) {
    return [
      ...new Map(
        semanas.map((s) => [
          this.monthKey(s.mesNumero, s.anoId),
          { numero: s.mesNumero, anoId: s.anoId },
        ]),
      ).values(),
    ];
  }

  private async validarAnos(semanas: CreateBulkSemanaDto[]) {
    const anoIds = [...new Set(semanas.map((s) => s.anoId))];
    const anos = await this.prisma.ano.findMany({
      where: { id: { in: anoIds } },
    });

    const anosExistentes = new Set(anos.map((a) => a.id));

    return {
      anosInvalidos: anoIds.filter((id) => !anosExistentes.has(id)),
    };
  }

  private async findExistingMonths(meses: { numero: number; anoId: string }[]) {
    return this.prisma.mes.findMany({
      where: { OR: meses.map((m) => ({ numero: m.numero, anoId: m.anoId })) },
    });
  }

  private async createMissingMonths(
    meses: { numero: number; anoId: string }[],
    map: Map<string, string>,
  ) {
    const mesesParaCriar = meses.filter(
      (mes) => !map.has(this.monthKey(mes.numero, mes.anoId)),
    );

    for (const { numero, anoId } of mesesParaCriar) {
      const mes = await this.prisma.mes.create({
        data: {
          numero,
          label: this.getMesLabel(numero),
          anoId,
        },
      });

      map.set(this.monthKey(numero, anoId), mes.id);
    }
  }

  private async getOrCreateMonths(semanas: CreateBulkSemanaDto[]) {
    const mesesUnicos = this.getUniqueMonths(semanas);
    const mesesExistentes = await this.findExistingMonths(mesesUnicos);

    const mesesMap = new Map(
      mesesExistentes.map((m) => [this.monthKey(m.numero, m.anoId), m.id]),
    );

    await this.createMissingMonths(mesesUnicos, mesesMap);
    return mesesMap;
  }

  private async createWeeks(
    semanas: CreateBulkSemanaDto[],
    mesesMap: Map<string, string>,
  ) {
    const semanasComMesId = semanas.map((s) => ({
      numero: s.semana,
      mesId: mesesMap.get(this.monthKey(s.mesNumero, s.anoId))!,
    }));

    const semanasExistentes = await this.prisma.semana.findMany({
      where: {
        OR: semanasComMesId.map((s) => ({
          numero: s.numero,
          mesId: s.mesId,
        })),
      },
    });

    const existingKeys = new Set(
      semanasExistentes.map((s) => this.weekKey(s.mesId, s.numero)),
    );

    const semanasParaCriar = semanasComMesId
      .filter((s) => !existingKeys.has(this.weekKey(s.mesId, s.numero)))
      .map((s) => ({
        numero: s.numero,
        label: `Semana ${s.numero}`,
        mesId: s.mesId,
      }));

    await this.prisma.semana.createMany({ data: semanasParaCriar });

    return {
      created: semanasParaCriar.length,
      ignored: existingKeys.size,
    };
  }

  async getAll() {
    const semanas = await this.prisma.semana.findMany({
      include: {
        dias: true,
      },
    });

    return {
      data: semanas,
    };
  }

  async create({ numero, mesId }: CreateSemanaDto) {
    const mes = await this.prisma.mes.findUnique({
      where: {
        id: mesId,
      },
    });

    if (!mes) {
      throw new NotFoundException('Mês não encontrado');
    }

    const semanaDuplicada = await this.prisma.semana.findFirst({
      where: { numero, mesId },
    });

    if (semanaDuplicada) {
      throw new BadRequestException(
        'Essa semana já existe para o mês informado',
      );
    }

    return this.prisma.semana.create({
      data: {
        numero,
        label: `Semana ${numero}`,
        mes: { connect: { id: mesId } },
      },
    });
  }

  async createBulk(dto: CreateBulkSemanaDto[]) {
    if (!dto?.length) {
      throw new BadRequestException('Nenhuma semana fornecida.');
    }

    const { anosInvalidos } = await this.validarAnos(dto);

    if (anosInvalidos.length) {
      throw new NotFoundException(
        `Ano(s) não encontrados: ${anosInvalidos.join(', ')}`,
      );
    }

    const mesesMap = await this.getOrCreateMonths(dto);

    const { created, ignored } = await this.createWeeks(dto, mesesMap);

    return {
      message: 'Semanas processadas com sucesso',
      created,
      ignored,
    };
  }
}
