import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateSemanaDto } from './dtos/create-semana.dto';

@Injectable()
export class SemanasService {
  constructor(private prisma: PrismaService) {}

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
}
