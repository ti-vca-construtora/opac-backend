import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateMesDto } from './dtos/create-mes.dto';

@Injectable()
export class MesesService {
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

  async create({ numero, anoId }: CreateMesDto) {
    const ano = await this.prisma.ano.findUnique({ where: { id: anoId } });

    if (!ano) {
      throw new NotFoundException('Ano não encontrado');
    }

    const mesDuplicado = await this.prisma.mes.findFirst({
      where: { numero, anoId },
    });

    if (mesDuplicado) {
      throw new BadRequestException('Esse mês já existe para o ano informado');
    }

    const label = this.getMesLabel(numero);

    return this.prisma.mes.create({
      data: {
        numero,
        label,
        ano: { connect: { id: anoId } },
      },
    });
  }

  async getAll() {
    const meses = await this.prisma.mes.findMany({
      include: {
        semanas: true,
      },
    });

    return {
      data: meses,
    };
  }
}
