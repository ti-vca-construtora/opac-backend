import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateMedicaoMensalDto } from './dtos/create-medicao-mensal.dto';

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

    return this.prisma.medicaoMensal.create({
      data: {
        ...dto,
        empreendimentoId: empreendimento.id,
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
