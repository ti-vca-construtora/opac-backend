import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateEmpreendimentoDto } from './dtos/create-empreendimento.dto';
import { UpdateEmpreendimentoDto } from './dtos/update-empreendimento.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class EmpreendimentosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEmpreendimentoDto) {
    try {
      const empreendimento = await this.prisma.empreendimento.create({
        data,
      });

      return {
        data: empreendimento,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Já existe um empreendimento com este CNPJ',
          );
        }
      }

      throw error;
    }
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
          include: {
            medicaoMensal: true,
            Aprovacao: true,
            aditivo: true,
          },
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

    return { data: empreendimento };
  }

  async update(id: string, data: UpdateEmpreendimentoDto) {
    await this.findById(id);

    console.log(data);

    return this.prisma.empreendimento.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.empreendimento.delete({ where: { id } });
  }
}
