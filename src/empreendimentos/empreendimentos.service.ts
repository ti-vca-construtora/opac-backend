import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateEmpreendimentoDto } from './dtos/create-empreendimento.dto';
import { UpdateEmpreendimentoDto } from './dtos/update-empreendimento.dto';

@Injectable()
export class EmpreendimentosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEmpreendimentoDto) {
    return this.prisma.empreendimento.create({ data });
  }

  async getAll(
    page: number | undefined = 1,
    pageSize: number | undefined = 20,
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const [empreendimentos, total] = await this.prisma.$transaction([
        this.prisma.empreendimento.findMany({
          skip,
          take: pageSize,
        }),
        this.prisma.empreendimento.count(),
      ]);

      return {
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        data: empreendimentos,
      };
    } catch (error) {
      console.error('Falha ao buscar empreendimentos:', error);
      throw new InternalServerErrorException(
        'Erro interno ao processar a requisição',
      );
    }
  }

  async findById(id: string) {
    const empreendimento = await this.prisma.empreendimento.findUnique({
      where: { id },
    });

    if (!empreendimento)
      throw new NotFoundException(
        'Não foi possível encontrar este empreendimento.',
      );

    return empreendimento;
  }

  async update(id: string, data: UpdateEmpreendimentoDto) {
    await this.findById(id);

    return this.prisma.empreendimento.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.empreendimento.delete({ where: { id } });
  }
}
