import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateAnoDto } from './dtos/create-ano.dto';

@Injectable()
export class AnosService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const anos = await this.prisma.ano.findMany({
      include: {
        meses: true,
      },
    });

    return {
      data: anos,
    };
  }

  async findById(id: string) {
    const ano = await this.prisma.ano.findUnique({
      where: {
        id,
      },
    });

    if (!ano) {
      throw new NotFoundException('Não foi possível encontrar este ano!');
    }

    return {
      data: ano,
    };
  }

  async create(dto: CreateAnoDto) {
    const ano = await this.prisma.ano.create({
      data: dto,
    });

    return {
      data: ano,
    };
  }
}
