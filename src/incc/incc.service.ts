import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateInccDto } from './dtos/create-incc.dto';
import { Prisma } from '@prisma/client';
import { UpdateInccDto } from './dtos/update-incc.dto';

@Injectable()
export class InccService {
  constructor(private prismaService: PrismaService) {}

  async getAll({
    page = 1,
    pageSize = 20,
  }: {
    page?: number;
    pageSize?: number;
  }) {
    try {
      const skip = (page - 1) * pageSize;

      const [inccs, total] = await this.prismaService.$transaction([
        this.prismaService.incc.findMany({
          skip,
          take: pageSize,
          orderBy: [
            { ano: 'desc' }, // Ordena anos do maior para o menor
            { mes: 'desc' }, // Ordena meses do maior para o menor
          ],
        }),
        this.prismaService.incc.count(),
      ]);

      return {
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        data: inccs,
      };
    } catch (error) {
      console.error('Falha ao buscar INCCs:', error);
      throw new InternalServerErrorException(
        'Erro interno ao processar a requisição',
      );
    }
  }

  async findById(id: string) {
    const incc = await this.prismaService.incc.findUnique({
      where: {
        id,
      },
    });

    if (!incc) {
      throw new NotFoundException('Não foi possível encontrar o INCC!');
    }

    return {
      data: incc,
    };
  }

  async create(dto: CreateInccDto) {
    try {
      const incc = await this.prismaService.incc.create({
        data: dto,
      });

      return { data: incc };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Já existe um INCC para este mês e ano.');
      }
      throw new InternalServerErrorException('Erro ao criar o INCC.');
    }
  }

  async update(id: string, dto: UpdateInccDto) {
    await this.findById(id);

    await this.prismaService.incc.update({
      where: {
        id: id,
      },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prismaService.incc.delete({
      where: {
        id: id,
      },
    });
  }
}
